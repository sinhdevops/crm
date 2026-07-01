alter type public.deal_stage add value if not exists 'CONSULTING';
alter type public.deal_stage add value if not exists 'VIEWING';
alter type public.deal_stage add value if not exists 'NEGOTIATION';
alter type public.deal_stage add value if not exists 'DEPOSIT';

alter table public.deals
  add column if not exists probability int not null default 10,
  add column if not exists priority text,
  add column if not exists lead_source text,
  add column if not exists property_project text,
  add column if not exists property_type text,
  add column if not exists property_code text,
  add column if not exists property_area text,
  add column if not exists appointment_date timestamptz,
  add column if not exists lost_reason text;

update public.deals
set probability = case stage::text
  when 'PROSPECT' then 10
  when 'QUALIFIED' then 25
  when 'PROPOSAL' then 45
  when 'CONSULTING' then 25
  when 'VIEWING' then 45
  when 'NEGOTIATION' then 65
  when 'DEPOSIT' then 90
  when 'CLOSED_WON' then 100
  when 'CLOSED_LOST' then 0
  else probability
end
where probability is null or probability = 10;

notify pgrst, 'reload schema';
