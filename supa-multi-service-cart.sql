-- Multi-Service Cart: replace single treatment with services (JSONB) and total_amount
-- Run after supa-production-flow.sql.

-- visits: add services (cart items) and total_amount (sum of service prices)
alter table public.visits
  add column if not exists services jsonb not null default '[]'::jsonb;

alter table public.visits
  add column if not exists total_amount numeric not null default 0;

comment on column public.visits.services is 'Cart: [{ id, category, name, price }]';
comment on column public.visits.total_amount is 'Sum of all service prices (Total Due)';
