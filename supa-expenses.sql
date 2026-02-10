-- KELH Management System: expenses table
-- Run this in the Supabase SQL Editor.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  amount numeric not null,
  category text not null
);

-- RLS disabled for now (same as patients). Enable when ready:
-- alter table public.expenses enable row level security;
