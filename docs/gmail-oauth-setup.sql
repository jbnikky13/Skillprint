-- Run once in Supabase SQL Editor for Skillprint Gmail OAuth storage.
-- OAuth tokens are AES-256-GCM encrypted by the API before they are stored.
create table if not exists public.skillprint_gmail_connections (
  account_id uuid primary key references auth.users(id) on delete cascade,
  google_sub text not null,
  email text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text not null,
  history_id text,
  last_sync_at timestamptz,
  status text not null default 'connected' check (status in ('connected','revoked','error')),
  updated_at timestamptz not null default now()
);
create index if not exists skillprint_gmail_connections_google_sub_idx
  on public.skillprint_gmail_connections (google_sub);
alter table public.skillprint_gmail_connections enable row level security;
-- No end-user policies: only server-side service-role code may access encrypted tokens.
revoke all on public.skillprint_gmail_connections from anon, authenticated;
