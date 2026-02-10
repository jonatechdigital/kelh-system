-- Add Doctor column to existing patients table (run if table already exists)
-- Run this in the Supabase SQL Editor.

alter table public.patients
  add column if not exists doctor text default '';
