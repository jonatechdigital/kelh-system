-- Jonatech Production Flow: Hybrid Billing for KELH
-- Run after supa-flow.sql. Adds columns for visits (billing) and patients (phone).

-- 1. Patients: add phone
alter table public.patients
  add column if not exists phone text default '';

-- 2. Visits: Hybrid Billing and triage status
-- Allow status 'triage' (new patient gate), 'active', 'closed'
-- If drop fails, find name: SELECT conname FROM pg_constraint WHERE conrelid = 'public.visits'::regclass AND contype = 'c';
alter table public.visits
  drop constraint if exists visits_status_check;

alter table public.visits
  add constraint visits_status_check
  check (status in ('triage', 'active', 'closed'));

-- New columns for visits (add if not exist)
alter table public.visits
  add column if not exists total_paid numeric not null default 0;

alter table public.visits
  add column if not exists payment_method text not null default '';

alter table public.visits
  add column if not exists referral_source text not null default '';

alter table public.visits
  add column if not exists treatment_category text default '';

alter table public.visits
  add column if not exists treatment_notes text default '';

-- Default consultation_fee for new patients is 80000 (set in app; ensure column allows it)
comment on column public.visits.consultation_fee is 'Gate fee: 80000 for new, 0 for old';
comment on column public.visits.total_paid is 'Amount actually paid this visit';
comment on column public.visits.payment_method is 'Cash, Airtel Money, MoMo, Insurance, Card, Partner';
