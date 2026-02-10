-- KELH Reception Terminal: patients table
-- Run this in the Supabase SQL Editor to create the table.

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  service text not null,
  cost numeric not null,
  status text not null check (status in ('paid', 'pending')),
  referral text not null,
  doctor text not null default ''
);

-- Optional: enable RLS and add policies as needed later
-- alter table public.patients enable row level security;
