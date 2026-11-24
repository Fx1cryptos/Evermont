// Regression tests for the support handoff race. A member's "Request a human" must not reopen a ticket
// that a concurrent request closed after the handler's status check. The API handler is bundled with
// esbuild and run against an in-memory fake of the Supabase query builder, so each test decides exactly
// when the concurrent close lands. Run with: npm run test:support
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, rm } from 'node:fs/promises'
import { build } from 'esbuild'

const repoRoot = new URL('../../', import.meta.url)
const outDir = new URL('node_modules/.cache/support-tests/', repoRoot)
// SUPPORT_HANDLER_ENTRY runs the same tests against an older copy of the handler, to confirm they catch the bug.
const handlerEntry = process.env.SUPPORT_HANDLER_ENTRY ?? 'api/support.ts'

const MEMBER = '11111111-1111-4111-8111-111111111111'
const OTHER_MEMBER = '22222222-2222-4222-8222-222222222222'
const CONVERSATION = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

after(() => rm(outDir, { recursive: true, force: true }))

async function loadHandler() {
  await mkdir(outDir, { recursive: true })
  const outfile = new URL(`handler-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`, outDir)
  await build({
    entryPoints: [new URL(handlerEntry, repoRoot).pathname],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: outfile.pathname,
    logLevel: 'silent',
  })
  return (await import(outfile.href)).default
}

// A small in-memory stand-in for the supabase-js query builder (select, eq, neq, update, upsert, and the
// single-row modifiers). A hook runs once, right after a matching select has produced its rows, to model a
// concurrent write that lands between the handler's read and its next statement.
function createFakeDb({ conversations = [], messages = [] }) {
  const db = {
    tables: {
      support_conversations: conversations.map((row) => ({ ...row })),
      support_messages: messages.map((row) => ({ ...row })),
      support_notification_outbox: [],
    },
    hooks: [],
    onceAfterSelect(table, columns, run) {
      db.hooks.push({ table, columns, run })
    },
    from(table) {
      return new QueryBuilder(db, table)
    },
  }
  return db
}

class QueryBuilder {
  constructor(db, table) {
    this.db = db
    this.table = table
    this.filters = []
    this.action = 'select'
    this.columns = null
    this.wantRows = false
    this.mode = 'many'
  }

  select(columns) {
    this.wantRows = true
    if (this.action === 'select') this.columns = columns
    return this
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value)
    return this
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value)
    return this
  }

  order() {
    return this
  }

  limit() {
    return this
  }

  update(values) {
    this.action = 'update'
    this.values = values
    return this
  }

  upsert(values, options = {}) {
    this.action = 'upsert'
    this.values = values
    this.options = options
    return this
  }

  maybeSingle() {
    this.mode = 'maybe'
    return this
  }

  single() {
    this.mode = 'single'
    return this
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  matching() {
    return this.db.tables[this.table].filter((row) => this.filters.every((test) => test(row)))
  }

  shape(rows) {
    if (this.mode === 'maybe') return { data: rows[0] ?? null, error: null }
    if (this.mode === 'single') {
      return rows[0] ? { data: rows[0], error: null } : { data: null, error: { message: 'No rows returned' } }
    }
    return { data: rows, error: null }
  }

  async execute() {
    if (this.action === 'update') {
      const matched = this.matching()
      for (const row of matched) Object.assign(row, this.values)
      if (!this.wantRows) return { data: null, error: null }
      return this.shape(matched.map((row) => ({ ...row })))
    }
    if (this.action === 'upsert') {
      const key = this.options.onConflict
      const rows = this.db.tables[this.table]
      const exists = key && rows.some((row) => row[key] === this.values[key])
      if (!exists) rows.push({ id: `row-${rows.length + 1}`, ...this.values })
      return { data: null, error: null }
    }
    const result = this.shape(this.matching().map((row) => ({ ...row })))
    const index = this.db.hooks.findIndex((hook) => hook.table === this.table && hook.columns === this.columns)
    if (index !== -1) {
      const [hook] = this.db.hooks.splice(index, 1)
      hook.run(this.db)
    }
    return result
  }
}

function fakeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    status(code) {
      this.statusCode = code
      return this
    },
    json(value) {
      this.body = value
      this.ended = true
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
    end() {
      this.ended = true
    },
  }
}

function handoffRequest(conversationId = CONVERSATION) {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer member-token' },
    body: { action: 'handoff', conversationId },
  }
}

function depsFor(db) {
  const notifications = []
  return {
    notifications,
    deps: {
      createClient: () => db,
      authenticate: async () => ({ id: MEMBER, email: 'member@example.test' }),
      processNotification: async (client, conversationId) => {
        notifications.push(conversationId)
        return { sent: 1, failed: 0 }
      },
    },
  }
}

const openTicket = (overrides = {}) => ({
  id: CONVERSATION,
  user_id: MEMBER,
  subject: 'Card limit',
  status: 'open',
  priority: 'normal',
  assigned_to: null,
  last_message_at: '2026-11-24T10:00:00.000Z',
  created_at: '2026-11-24T09:00:00.000Z',
  updated_at: '2026-11-24T10:00:00.000Z',
  ...overrides,
})

const memberMessage = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  conversation_id: CONVERSATION,
  sender_id: MEMBER,
  sender_role: 'member',
  body: 'I need a person to look at this.',
  is_internal: false,
  created_at: '2026-11-24T10:00:00.000Z',
}

test('a close that lands after the status check is not reopened, and the member gets 409', async () => {
  const handler = await loadHandler()
  const db = createFakeDb({ conversations: [openTicket()], messages: [memberMessage] })
  // The handler's status check selects 'status'. Right after that read, a concurrent request closes the ticket.
  db.onceAfterSelect('support_conversations', 'status', (fake) => {
    fake.tables.support_conversations[0].status = 'closed'
  })
  const { deps, notifications } = depsFor(db)
  const response = fakeResponse()

  await handler(handoffRequest(), response, deps)

  assert.equal(response.statusCode, 409)
  assert.deepEqual(response.body, { error: 'This conversation is closed. Start a new request to contact support.' })
  assert.equal(db.tables.support_conversations[0].status, 'closed', 'the closed ticket must stay closed')
  assert.equal(db.tables.support_notification_outbox.length, 0, 'no handoff notification is queued')
  assert.deepEqual(notifications, [], 'no notification is sent')
})

test('a ticket closed before the request is refused before any update', async () => {
  const handler = await loadHandler()
  const db = createFakeDb({ conversations: [openTicket({ status: 'closed' })], messages: [memberMessage] })
  const { deps } = depsFor(db)
  const response = fakeResponse()

  await handler(handoffRequest(), response, deps)

  assert.equal(response.statusCode, 409)
  assert.equal(db.tables.support_conversations[0].status, 'closed')
})

test('a handoff on an open ticket moves it to pending_support and queues one notification', async () => {
  const handler = await loadHandler()
  const db = createFakeDb({ conversations: [openTicket()], messages: [memberMessage] })
  const { deps, notifications } = depsFor(db)
  const response = fakeResponse()

  await handler(handoffRequest(), response, deps)

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.handedOff, true)
  assert.equal(response.body.status, 'pending_support')
  assert.equal(response.body.notificationQueued, true)
  assert.equal(response.body.notificationDelivered, true)
  assert.equal(db.tables.support_conversations[0].status, 'pending_support')
  assert.equal(db.tables.support_notification_outbox.length, 1)
  assert.equal(db.tables.support_notification_outbox[0].dedupe_key, `support-handoff:${CONVERSATION}:${memberMessage.id}`)
  assert.deepEqual(notifications, [CONVERSATION])
})

test('another member cannot hand off a ticket they do not own, and nothing changes', async () => {
  const handler = await loadHandler()
  const db = createFakeDb({ conversations: [openTicket({ user_id: OTHER_MEMBER })], messages: [] })
  const { deps } = depsFor(db)
  const response = fakeResponse()

  await handler(handoffRequest(), response, deps)

  assert.equal(response.statusCode, 403)
  assert.equal(db.tables.support_conversations[0].status, 'open')
})
