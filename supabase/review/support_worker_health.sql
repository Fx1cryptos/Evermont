-- Review only. Apply to the approved staging project before enabling --record-health.
begin;
create table public.support_worker_health (
  id uuid primary key,
  started_at timestamptz not null,
  finished_at timestamptz not null check (finished_at >= started_at),
  failed_checks text[] not null check (
    failed_checks <@ array['gemini','gmail','authentication','database','outbox','mailbox_sync']::text[]
    and array_position(failed_checks, null) is null
  ),
  healthy boolean generated always as (cardinality(failed_checks) = 0) stored
);
create index support_worker_health_recent on public.support_worker_health (finished_at desc);
create index support_worker_health_outcome on public.support_worker_health (healthy, finished_at desc);
alter table public.support_worker_health enable row level security;
revoke all on public.support_worker_health from public, anon, authenticated, service_role;
grant select, insert on public.support_worker_health to service_role;
commit;
