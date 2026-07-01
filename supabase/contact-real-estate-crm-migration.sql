alter table public.contacts
  add column if not exists zalo text,
  add column if not exists facebook text,
  add column if not exists priority text,
  add column if not exists area_interest text,
  add column if not exists budget_min numeric(14, 2),
  add column if not exists budget_max numeric(14, 2),
  add column if not exists decision_maker text,
  add column if not exists last_contacted_date date,
  add column if not exists next_follow_up_date date,
  add column if not exists post_sale_status text;

create unique index if not exists contacts_user_phone_active_unique
on public.contacts(user_id, phone)
where phone is not null and deleted_at is null;

create unique index if not exists contacts_user_email_active_unique
on public.contacts(user_id, lower(email))
where email is not null and deleted_at is null;
