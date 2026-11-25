import type { SupabaseClient } from '@supabase/supabase-js'

/** Treat realtime inserts as cache invalidations. The authorized read supplies the rows. */
export function subscribeToInbox(client: SupabaseClient, staffId: string, refresh: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let active = true
  const channel = client.channel('staff-inbox-' + staffId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => {
      if (!active) return
      clearTimeout(timer)
      timer = setTimeout(refresh, 150)
    })
    .subscribe()
  return () => {
    active = false
    clearTimeout(timer)
    void client.removeChannel(channel)
  }
}
