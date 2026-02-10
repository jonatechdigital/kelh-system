-- Jonatech 5-Step Patient Flow: visits table + patients.file_number
-- Run in Supabase SQL Editor (after supa-schema.sql).

-- Add file_number to patients (run if column does not exist)
alter table public.patients
  add column if not exists file_number text unique;

-- Backfill existing rows with a placeholder; new patients get KELH-XXXX from app
update public.patients
set file_number = 'KELH-' || lpad(floor(random() * 10000)::text, 4, '0')
where file_number is null;

-- Visits table: one row per visit (active until closed)
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_fee numeric not null default 0,
  consultation_status text not null default 'pending' check (consultation_status in ('pending', 'paid', 'waived')),
  treatment_cost numeric not null default 0,
  doctor text default '',
  findings text default '',
  status text not null default 'active' check (status in ('active', 'closed'))
);

create index if not exists idx_visits_patient_id on public.visits(patient_id);
create index if not exists idx_visits_status_created on public.visits(status, created_at desc);
