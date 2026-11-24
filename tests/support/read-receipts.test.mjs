// Regression tests for member read receipts on the support thread. The thread page calls the tracker on
// every load, so the database call must happen once per new staff reply, failures must be reported with
// context and retried, and a failed call must never be dropped. The tracker is loaded from its TypeScript
// source with esbuild. Run with: npm run test:support
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

async function loadTsModule(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2020' })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const { createReadReceiptTracker, latestStaffReplyId, describeReadError } = await loadTsModule('../../src/lib/supportReadReceipts.ts')

const CONVERSATION = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const OTHER_CONVERSATION = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const member = (id) => ({ id, sender_role: 'member' })
const staff = (id) => ({ id, sender_role: 'support' })

// A markRead stub that records each call and answers with the next scripted result (success by default).
function scriptedMarkRead(...results) {
  const calls = []
  const markRead = async (conversationId) => {
    calls.push(conversationId)
    const next = results.shift()
    if (next instanceof Error) throw next
    return next ?? { error: null }
  }
  return { markRead, calls }
}

test('latestStaffReplyId returns the newest staff reply and ignores member messages', () => {
  assert.equal(latestStaffReplyId([]), null)
  assert.equal(latestStaffReplyId([member('m1')]), null)
  assert.equal(latestStaffReplyId([staff('s1'), member('m2'), staff('s2'), member('m3')]), 's2')
})

test('marks a thread once per staff reply, however many times the page loads', async () => {
  const { markRead, calls } = scriptedMarkRead()
  const tracker = createReadReceiptTracker(markRead, () => {})
  const thread = [member('m1'), staff('s1')]

  assert.equal((await tracker.sync(CONVERSATION, thread)).status, 'marked')
  for (let refresh = 0; refresh < 5; refresh += 1) {
    assert.equal((await tracker.sync(CONVERSATION, thread)).status, 'not-needed')
  }
  // The member replying does not change the newest staff reply, so no new request is needed.
  assert.equal((await tracker.sync(CONVERSATION, [...thread, member('m2')])).status, 'not-needed')

  assert.deepEqual(calls, [CONVERSATION], 'exactly one database call')
})

test('a new staff reply is marked again', async () => {
  const { markRead, calls } = scriptedMarkRead()
  const tracker = createReadReceiptTracker(markRead, () => {})

  await tracker.sync(CONVERSATION, [member('m1'), staff('s1')])
  const outcome = await tracker.sync(CONVERSATION, [member('m1'), staff('s1'), member('m2'), staff('s2')])

  assert.deepEqual(outcome, { status: 'marked', replyId: 's2' })
  assert.equal(calls.length, 2)
})

test('a member-only thread never calls the database', async () => {
  const { markRead, calls } = scriptedMarkRead()
  const tracker = createReadReceiptTracker(markRead, () => {})

  assert.equal((await tracker.sync(CONVERSATION, [member('m1')])).status, 'not-needed')
  assert.equal((await tracker.sync(CONVERSATION, [])).status, 'not-needed')
  assert.deepEqual(calls, [])
})

test('a failed call is reported with its conversation, reply and reason, then retried until it succeeds', async () => {
  const reports = []
  const { markRead, calls } = scriptedMarkRead({ error: { message: 'permission denied', code: '42501' } })
  const tracker = createReadReceiptTracker(markRead, (line) => reports.push(line))
  const thread = [member('m1'), staff('s1')]

  const failed = await tracker.sync(CONVERSATION, thread)
  assert.deepEqual(failed, { status: 'failed', replyId: 's1', reason: 'permission denied (code 42501)' })
  assert.equal(reports.length, 1)
  assert.match(reports[0], /aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/)
  assert.match(reports[0], /staff reply s1/)
  assert.match(reports[0], /permission denied \(code 42501\)/)
  assert.match(reports[0], /retried automatically/)

  // The next load (for example the 30-second recovery poll) tries again and succeeds.
  assert.equal((await tracker.sync(CONVERSATION, thread)).status, 'marked')
  assert.equal((await tracker.sync(CONVERSATION, thread)).status, 'not-needed')
  assert.equal(calls.length, 2)
  assert.equal(reports.length, 1, 'only the failed attempt is reported')
})

test('a rejected call (for example a dropped connection) is reported and does not throw', async () => {
  const reports = []
  const { markRead } = scriptedMarkRead(new Error('Failed to fetch'))
  const tracker = createReadReceiptTracker(markRead, (line) => reports.push(line))

  const outcome = await tracker.sync(CONVERSATION, [staff('s1')])

  assert.deepEqual(outcome, { status: 'failed', replyId: 's1', reason: 'Failed to fetch' })
  assert.equal(reports.length, 1)
})

test('overlapping loads for the same reply send one request', async () => {
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const calls = []
  const tracker = createReadReceiptTracker(async (conversationId) => {
    calls.push(conversationId)
    await gate
    return { error: null }
  }, () => {})
  const thread = [staff('s1')]

  const first = tracker.sync(CONVERSATION, thread)
  const second = tracker.sync(CONVERSATION, thread)
  release()

  assert.equal((await first).status, 'marked')
  assert.equal((await second).status, 'not-needed')
  assert.equal(calls.length, 1)
})

test('each conversation is tracked on its own', async () => {
  const { markRead, calls } = scriptedMarkRead()
  const tracker = createReadReceiptTracker(markRead, () => {})

  await tracker.sync(CONVERSATION, [staff('s1')])
  await tracker.sync(OTHER_CONVERSATION, [staff('s1')])
  await tracker.sync(CONVERSATION, [staff('s1')])

  assert.deepEqual(calls, [CONVERSATION, OTHER_CONVERSATION])
})

test('describeReadError keeps the message and code and handles unknown shapes', () => {
  assert.equal(describeReadError({ message: 'boom', code: 'PGRST301' }), 'boom (code PGRST301)')
  assert.equal(describeReadError(new Error('offline')), 'offline')
  assert.equal(describeReadError({}), 'unknown error')
  assert.equal(describeReadError('plain text'), 'plain text')
})
