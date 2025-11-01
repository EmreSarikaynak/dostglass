-- user_tenants tablosuna timestamp alanları ekle
alter table user_tenants 
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

-- Mevcut kayıtlar için tarihleri güncelle
update user_tenants 
set created_at = now(), updated_at = now()
where created_at is null;

-- Updated_at için trigger
create or replace function update_user_tenants_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_tenants_updated_at on user_tenants;
create trigger user_tenants_updated_at
  before update on user_tenants
  for each row
  execute function update_user_tenants_updated_at();

