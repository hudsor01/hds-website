-- Supporting tables for cron processing and webhooks

create table if not exists public.cron_logs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.processing_queue (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  triggered_at timestamptz default now()
);

-- Placeholder analytics RPC used by the GraphQL endpoint
create or replace function public.query_analytics(query_text text, vars jsonb)
returns jsonb
language sql
as $$
  select '{}'::jsonb;
$$;
