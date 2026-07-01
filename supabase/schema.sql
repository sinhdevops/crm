create extension if not exists "pgcrypto";

create type public.app_role as enum ('ADMIN', 'MANAGER', 'SALES_REP');
create type public.deal_stage as enum ('PROSPECT', 'CONSULTING', 'VIEWING', 'NEGOTIATION', 'DEPOSIT', 'CLOSED_WON', 'CLOSED_LOST');
create type public.activity_type as enum ('CALL', 'EMAIL', 'MEETING', 'NOTE');
create type public.ai_suggestion_type as enum ('TASK_LIST', 'EMAIL_DRAFT', 'SUMMARY');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role public.app_role not null default 'ADMIN',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  zalo text,
  facebook text,
  company text,
  position text,
  customer_type text,
  priority text,
  gender text,
  birthday date,
  residence text,
  area_interest text,
  interest_type text,
  purchase_need text,
  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  decision_maker text,
  work_date date,
  last_contacted_date date,
  next_follow_up_date date,
  payment_date date,
  note text,
  solution_plan text,
  assigned_staff text not null default 'Văn Sinh',
  source text,
  next_payment_date date,
  post_sale_status text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  title text not null,
  value numeric(14, 2) not null default 0,
  stage public.deal_stage not null default 'PROSPECT',
  probability int not null default 10,
  priority text,
  lead_source text,
  property_project text,
  property_type text,
  property_code text,
  property_area text,
  appointment_date timestamptz,
  lost_reason text,
  close_date timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  type public.activity_type not null default 'NOTE',
  title text,
  note text not null,
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  type public.ai_suggestion_type not null,
  content text not null,
  source_note text,
  job_id text,
  created_at timestamptz not null default now()
);

create index contacts_user_id_idx on public.contacts(user_id);
create unique index contacts_user_phone_active_unique on public.contacts(user_id, phone)
where phone is not null and deleted_at is null;
create unique index contacts_user_email_active_unique on public.contacts(user_id, lower(email))
where email is not null and deleted_at is null;
create index deals_user_id_stage_idx on public.deals(user_id, stage);
create index activities_user_id_date_idx on public.activities(user_id, date desc);
create index tasks_user_id_deal_id_idx on public.tasks(user_id, deal_id);
create index ai_suggestions_user_id_deal_id_idx on public.ai_suggestions(user_id, deal_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();
create trigger deals_set_updated_at before update on public.deals
for each row execute function public.set_updated_at();
create trigger activities_set_updated_at before update on public.activities
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.ai_suggestions enable row level security;

create policy "profiles own rows" on public.profiles
for all using (id = auth.uid()) with check (id = auth.uid());

create policy "contacts own rows" on public.contacts
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "deals own rows" on public.deals
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "activities own rows" on public.activities
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tasks own rows" on public.tasks
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai suggestions own rows" on public.ai_suggestions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter publication supabase_realtime add table public.contacts;
alter publication supabase_realtime add table public.deals;
alter publication supabase_realtime add table public.activities;
