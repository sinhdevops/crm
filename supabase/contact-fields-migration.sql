alter table public.contacts
  add column if not exists customer_type text,
  add column if not exists gender text,
  add column if not exists birthday date,
  add column if not exists residence text,
  add column if not exists interest_type text,
  add column if not exists purchase_need text,
  add column if not exists work_date date,
  add column if not exists payment_date date,
  add column if not exists note text,
  add column if not exists solution_plan text,
  add column if not exists assigned_staff text not null default 'Văn Sinh',
  add column if not exists source text,
  add column if not exists next_payment_date date;
