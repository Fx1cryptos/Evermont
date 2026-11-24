import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { canManageSupport, canViewSupport } from '../api/_lib/support.ts'

const migration = readFileSync('supabase/migrations/20261124120000_support_staff_reply_permissions.sql', 'utf8')
const api = readFileSync('api/support.ts', 'utf8')
const supportService = readFileSync('src/services/supportService.ts', 'utf8')

test('OPERATIONS can view support but cannot reply', () => {
  const operations = { id: 'operations-user', role: 'OPERATIONS' }
  assert.equal(canViewSupport(operations), true)
  assert.equal(canManageSupport(operations), false)
})

test('only SUPER_ADMIN, ADMIN, and SUPPORT can manage support', () => {
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'SUPPORT']) {
    const staff = { id: `${role.toLowerCase()}-user`, role }
    assert.equal(canViewSupport(staff), true)
    assert.equal(canManageSupport(staff), true)
  }
})

test('COMPLIANCE, READ_ONLY, and non-staff cannot access support', () => {
  for (const role of ['COMPLIANCE', 'READ_ONLY', undefined]) {
    const user = { id: `${role ?? 'member'}-user`, role }
    assert.equal(canViewSupport(user), false)
    assert.equal(canManageSupport(user), false)
  }
})

test('migration replaces broad staff policy with separate read and reply policies', () => {
  assert.match(migration, /drop policy if exists support_messages_staff_all/i)
  assert.match(migration, /create policy support_messages_staff_select[\s\S]*?for select/i)
  assert.match(migration, /create policy support_messages_staff_insert[\s\S]*?for insert/i)
  assert.doesNotMatch(migration, /create policy[\s\S]*?for\s+(?:all|update|delete)\b/i)
  assert.match(migration, /'SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'/)
  assert.match(migration, /'SUPER_ADMIN', 'ADMIN', 'SUPPORT'/)
})

test('customer read receipts are scoped to verified, visible replies supplied by the client', () => {
  assert.match(api, /\.eq\('sender_role', 'support'\)[\s\S]*?\.eq\('is_internal', false\)[\s\S]*?\.in\('id', requestedIds\)/)
  assert.match(api, /\.in\('id', verifiedIds\)/)
  assert.match(api, /conversation\.user_id !== user\.id/)
})

test('handoff updates cannot reopen a closed conversation', () => {
  assert.match(api, /\.update\(\{ status: 'pending_support',[\s\S]*?\.neq\('status', 'closed'\)/)
  assert.match(api, /currentConversation\?\.status === 'closed'/)
})

test('member conversation and message retries reuse caller-provided UUIDs', () => {
  assert.match(supportService, /insert\(\{ id: conversationId, user_id: userId/)
  assert.match(supportService, /insert\(\{\s*id: messageId,[\s\S]*?sender_role: 'member'/)
  assert.match(supportService, /\.eq\('id', conversationId\)[\s\S]*?\.eq\('user_id', userId\)/)
  assert.match(supportService, /\.eq\('id', messageId\)[\s\S]*?\.eq\('sender_id', userId\)/)
})

test('staff reply endpoint binds idempotent IDs to the authenticated sender and ticket', () => {
  assert.match(api, /\.eq\('id', messageId\)[\s\S]*?\.eq\('conversation_id', conversationId\)[\s\S]*?\.eq\('sender_id', user\.id\)/)
  assert.match(api, /This reply request ID was already used for different content/)
})
