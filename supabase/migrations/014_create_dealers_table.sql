-- Bayiler tablosu oluştur
create table if not exists dealers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text not null,
  contact_person text,
  phone text,
  mobile text,
  email text,
  address text,
  city text,
  district text,
  postal_code text,
  tax_office text not null,
  tax_number text not null,
  iban text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS etkinleştir
alter table dealers enable row level security;

-- Bayiler kendi bilgilerini okuyabilir
create policy dealers_read_own on dealers
  for select using (user_id = auth.uid());

-- Adminler tüm bayileri görebilir
create policy dealers_read_admin on dealers
  for select using (
    exists (
      select 1 from user_tenants ut
      where ut.user_id = auth.uid()
      and ut.role = 'admin'
    )
  );

-- Bayiler kendi bilgilerini güncelleyebilir
create policy dealers_update_own on dealers
  for update using (user_id = auth.uid());

-- Index'ler
create index if not exists dealers_user_id_idx on dealers(user_id);
create index if not exists dealers_company_name_idx on dealers(company_name);

-- Updated_at için trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger dealers_updated_at
  before update on dealers
  for each row
  execute function update_updated_at_column();

