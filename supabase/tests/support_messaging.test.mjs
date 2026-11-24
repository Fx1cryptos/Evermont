// Database tests for member-to-support messaging. They run the repo migrations in an
// empty Postgres (PGlite) on top of supabase/tests/fixtures/support_base_schema.sql,
// which approximates production. Run with: npm run test:db
import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const MIGRATION_FILES = {
  outbox: '20261121120000_support_outbox_worker.sql',
  scopedClaim: '20261121123000_support_notification_scoped_claim.sql',
  gmail: '20261121130000_support_gmail_inbox.sql',
  repair: '20261124120000_support_member_messaging_repair.sql',
}
const ALL_MIGRATIONS = ['outbox', 'scopedClaim', 'gmail', 'repair']

const MEMBER_A = '11111111-1111-4111-8111-111111111111'
const MEMBER_B = '22222222-2222-4222-8222-222222222222'
const SUPPORT_USER = '33333333-3333-4333-8333-333333333333'
const OPERATIONS_USER = '44444444-4444-4444-8444-444444444444'

const readText = (url) => readFile(url, 'utf8')

// Each PGlite instance is a wasm Postgres; they are closed after every test so memory stays bounded.
const openDatabases = []

// Tests may already have closed their own database, so failures here are ignored.
afterEach(async () => {
  await Promise.allSettled(openDatabases.splice(0).map((db) => db.close()))
})

async function openDb(migrationKeys = []) {
  const db = await PGlite.create()
  openDatabases.push(db)
  await db.exec(await readText(new URL('./fixtures/support_base_schema.sql', import.meta.url)))
  await db.query(
    'insert into public.admin_roles (user_id, role) values ($1, $2), ($3, $4)',
    [SUPPORT_USER, 'SUPPORT', OPERATIONS_USER, 'OPERATIONS'],
  )
  for (const key of migrationKeys) {
    await db.exec(await readText(new URL(`../migrations/${MIGRATION_FILES[key]}`, import.meta.url)))
  }
  return db
}

// Runs `run` as a Supabase-style role with auth.uid() set to userId, then resets the role.
async function asUser(db, userId, run, role = 'authenticated') {
  await db.exec(`set role ${role}`)
  try {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ''])
    return await run()
  } finally {
    await db.exec('reset role')
  }
}

async function createAsMember(db, userId, subject = 'Test subject') {
  const { rows } = await asUser(db, userId, () =>
    db.query('insert into public.support_conversations (user_id, subject) values ($1, $2) returning id', [userId, subject]))
  return rows[0].id
}

async function setStatus(db, conversationId, status) {
  await db.query('update public.support_conversations set status = $1 where id = $2', [status, conversationId])
}

async function statusOf(db, conversationId) {
  const { rows } = await db.query('select status from public.support_conversations where id = $1', [conversationId])
  return rows[0].status
}

async function memberPost(db, userId, conversationId, body = 'Hello') {
  return asUser(db, userId, () => db.query(
    `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
     values ($1, $2, 'member', $3, false)`,
    [conversationId, userId, body],
  ))
}

async function staffPost(db, conversationId, { body = 'Staff reply', isInternal = false } = {}) {
  return asUser(db, SUPPORT_USER, () => db.query(
    `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
     values ($1, $2, 'support', $3, $4)`,
    [conversationId, SUPPORT_USER, body, isInternal],
  ))
}

test('root cause: a staff reply that sets delivery_status fails before the gmail migration', async () => {
  const db = await openDb(['outbox', 'scopedClaim'])
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await assert.rejects(
      asUser(db, SUPPORT_USER, () => db.query(
        `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal, delivery_status)
         values ($1, $2, 'support', 'Reply', false, 'queued') returning id`,
        [conversationId, SUPPORT_USER],
      ), 'service_role'),
      /delivery_status/,
    )
  } finally {
    await db.close()
  }
})

test('admin shell: staff read their own admin role only after the outbox migration', async () => {
  const before = await openDb([])
  try {
    await assert.rejects(
      asUser(before, SUPPORT_USER, () => before.query('select role from public.admin_roles')),
      /permission denied/,
    )
  } finally {
    await before.close()
  }
  const after = await openDb(['outbox'])
  try {
    const { rows } = await asUser(after, SUPPORT_USER, () => after.query('select role from public.admin_roles'))
    assert.deepEqual(rows.map(row => row.role), ['SUPPORT'])
  } finally {
    await after.close()
  }
})

test('the repair migration stops before changing anything when the gmail columns are missing', async () => {
  const db = await openDb(['outbox', 'scopedClaim'])
  try {
    await assert.rejects(
      db.exec(await readText(new URL(`../migrations/${MIGRATION_FILES.repair}`, import.meta.url))),
      /apply 20261121130000_support_gmail_inbox\.sql/,
    )
  } finally {
    await db.close()
  }
})

test('a member starts a conversation and its first message in one call', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const { rows } = await asUser(db, MEMBER_A, () =>
      db.query('select public.create_support_conversation($1, $2) as id', ['  Card query ', '  Hello  ']))
    const conversationId = rows[0].id
    const conversation = await db.query('select subject, status, user_id from public.support_conversations where id = $1', [conversationId])
    assert.deepEqual(conversation.rows, [{ subject: 'Card query', status: 'open', user_id: MEMBER_A }])
    const messages = await db.query('select body, sender_role, is_internal from public.support_messages where conversation_id = $1', [conversationId])
    assert.deepEqual(messages.rows, [{ body: 'Hello', sender_role: 'member', is_internal: false }])
  } finally {
    await db.close()
  }
})

test('a failing first message leaves no empty conversation behind', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    await db.exec(`
      create function public.test_fail_on_marker() returns trigger language plpgsql as $$
      begin if new.body = 'FAIL_ME' then raise exception 'boom'; end if; return new; end $$;
      create trigger test_fail_on_marker before insert on public.support_messages
        for each row execute function public.test_fail_on_marker();`)
    await assert.rejects(
      asUser(db, MEMBER_A, () => db.query('select public.create_support_conversation($1, $2)', ['Subject', 'FAIL_ME'])),
      /boom/,
    )
    const { rows } = await db.query('select count(*)::int as n from public.support_conversations where user_id = $1', [MEMBER_A])
    assert.equal(rows[0].n, 0)
  } finally {
    await db.close()
  }
})

test('create_support_conversation rejects empty and over-long bodies', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    for (const body of ['   ', 'x'.repeat(4001)]) {
      await assert.rejects(
        asUser(db, MEMBER_A, () => db.query('select public.create_support_conversation($1, $2)', ['Subject', body])),
        /1 to 4,000 characters/,
      )
    }
  } finally {
    await db.close()
  }
})

test('a member cannot set status, assignee or another owner when starting a conversation', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      "insert into public.support_conversations (user_id, subject, status) values ($1, 'x', 'closed')", [MEMBER_A])), /permission denied/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      'insert into public.support_conversations (user_id, subject, assigned_to) values ($1, $2, $3)', [MEMBER_A, 'x', SUPPORT_USER])), /permission denied/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      "insert into public.support_conversations (user_id, subject) values ($1, 'x')", [MEMBER_B])), /row-level security/)
  } finally {
    await db.close()
  }
})

test('a member cannot post internal notes, other senders, staff roles or gmail-sourced rows', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
       values ($1, $2, 'member', 'note', true)`, [conversationId, MEMBER_A])), /row-level security/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
       values ($1, $2, 'member', 'hi', false)`, [conversationId, MEMBER_B])), /row-level security/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
       values ($1, $2, 'support', 'hi', false)`, [conversationId, MEMBER_A])), /row-level security/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal, source)
       values ($1, $2, 'member', 'hi', false, 'gmail')`, [conversationId, MEMBER_A])), /permission denied/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal, delivery_status)
       values ($1, $2, 'member', 'hi', false, 'sent')`, [conversationId, MEMBER_A])), /permission denied/)
  } finally {
    await db.close()
  }
})

test('members can post on open, pending, and resolved conversations, but not closed ones', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    for (const status of ['open', 'pending_member', 'pending_support', 'resolved']) {
      const conversationId = await createAsMember(db, MEMBER_A)
      await setStatus(db, conversationId, status)
      await memberPost(db, MEMBER_A, conversationId)
    }
    const closedId = await createAsMember(db, MEMBER_A)
    await setStatus(db, closedId, 'closed')
    await assert.rejects(memberPost(db, MEMBER_A, closedId), /row-level security/)
    const { rows } = await db.query('select count(*)::int as n from public.support_messages where conversation_id = $1', [closedId])
    assert.equal(rows[0].n, 0)
  } finally {
    await db.close()
  }
})

test('a member reply moves resolved and pending_member conversations to pending_support, and leaves open ones alone', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const expectations = { resolved: 'pending_support', pending_member: 'pending_support', open: 'open' }
    for (const [start, end] of Object.entries(expectations)) {
      const conversationId = await createAsMember(db, MEMBER_A)
      await setStatus(db, conversationId, start)
      await memberPost(db, MEMBER_A, conversationId)
      assert.equal(await statusOf(db, conversationId), end, `from ${start}`)
    }
  } finally {
    await db.close()
  }
})

test('members see only their own conversations and never internal notes', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await memberPost(db, MEMBER_A, conversationId, 'Question')
    await staffPost(db, conversationId, { body: 'Answer' })
    await staffPost(db, conversationId, { body: 'Internal only', isInternal: true })

    const otherSees = await asUser(db, MEMBER_B, () => db.query('select id from public.support_conversations where id = $1', [conversationId]))
    assert.equal(otherSees.rows.length, 0)
    const otherMessages = await asUser(db, MEMBER_B, () => db.query('select id from public.support_messages where conversation_id = $1', [conversationId]))
    assert.equal(otherMessages.rows.length, 0)

    const { rows } = await asUser(db, MEMBER_A, () => db.query(
      'select body, is_internal from public.support_messages where conversation_id = $1 order by created_at, id', [conversationId]))
    assert.deepEqual(rows.map(row => row.body).sort(), ['Answer', 'Question'])
    assert.ok(rows.every(row => row.is_internal === false))
  } finally {
    await db.close()
  }
})

test('support_mark_member_read: the owner marks staff replies read, others are refused', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await staffPost(db, conversationId, { body: 'Answer' })
    await staffPost(db, conversationId, { body: 'Internal only', isInternal: true })

    await assert.rejects(
      asUser(db, MEMBER_B, () => db.query('select public.support_mark_member_read($1)', [conversationId])),
      /Conversation not found/,
    )
    const { rows } = await asUser(db, MEMBER_A, () => db.query('select public.support_mark_member_read($1) as n', [conversationId]))
    assert.equal(rows[0].n, 1)
    const flags = await db.query('select body, read_by_member from public.support_messages where conversation_id = $1 order by body', [conversationId])
    assert.deepEqual(flags.rows, [
      { body: 'Answer', read_by_member: true },
      { body: 'Internal only', read_by_member: false },
    ])
  } finally {
    await db.close()
  }
})

test('members cannot update or delete support rows directly', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await memberPost(db, MEMBER_A, conversationId)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      "update public.support_conversations set status = 'resolved' where id = $1", [conversationId])), /permission denied/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      "update public.support_messages set body = 'changed' where conversation_id = $1", [conversationId])), /permission denied/)
    await assert.rejects(asUser(db, MEMBER_A, () => db.query(
      'delete from public.support_messages where conversation_id = $1', [conversationId])), /permission denied/)
  } finally {
    await db.close()
  }
})

test('direct member inserts must have a body of 1 to 4,000 characters', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await assert.rejects(memberPost(db, MEMBER_A, conversationId, ''), /row-level security/)
    await assert.rejects(memberPost(db, MEMBER_A, conversationId, 'x'.repeat(4001)), /row-level security/)
  } finally {
    await db.close()
  }
})

test('staff replies insert with delivery_status once the gmail migration is applied', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    const { rows } = await asUser(db, SUPPORT_USER, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal, read_by_member, delivery_status)
       values ($1, $2, 'support', 'Reply', false, false, 'queued') returning id, delivery_status`,
      [conversationId, SUPPORT_USER]), 'service_role')
    assert.equal(rows[0].delivery_status, 'queued')
  } finally {
    await db.close()
  }
})

test('current behaviour, not changed here: an OPERATIONS admin can insert support messages directly', async () => {
  const db = await openDb(ALL_MIGRATIONS)
  try {
    const conversationId = await createAsMember(db, MEMBER_A)
    await asUser(db, OPERATIONS_USER, () => db.query(
      `insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
       values ($1, $2, 'support', 'Direct insert', false)`, [conversationId, OPERATIONS_USER]))
    const { rows } = await db.query('select count(*)::int as n from public.support_messages where conversation_id = $1', [conversationId])
    assert.equal(rows[0].n, 1)
  } finally {
    await db.close()
  }
})
