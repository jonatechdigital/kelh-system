-- Ensure patients table has all columns required by the app (fix PGRST204 "Could not find 'name' column")
-- Run in Supabase SQL Editor. Safe to run multiple times.

-- If the table doesn't exist, create it with full schema (from supa-schema.sql)
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default '',
  service text not null default '',
  cost numeric not null default 0,
  status text not null default 'pending' check (status in ('paid', 'pending')),
  referral text not null default '',
  doctor text not null default ''
);

-- Add any missing columns (no-op if they already exist)
alter table public.patients add column if not exists name text default '';
alter table public.patients add column if not exists file_number text;
alter table public.patients add column if not exists phone text default '';
alter table public.patients add column if not exists service text default '';
alter table public.patients add column if not exists cost numeric default 0;
alter table public.patients add column if not exists status text default 'pending';
alter table public.patients add column if not exists referral text default '';
alter table public.patients add column if not exists doctor text default '';

-- Backfill and enforce NOT NULL for name (required by app)
update public.patients set name = coalesce(name, '') where name is null;
alter table public.patients alter column name set default '';
alter table public.patients alter column name set not null;

-- Reload schema: in Supabase Dashboard go to Settings → API → "Reload schema cache" (or restart API)
-- Then try registering a patient again.
