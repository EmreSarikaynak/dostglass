-- Tenants (Firmalar) tablosu
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- User-Tenant ilişkisi ve rol tablosu
create table if not exists user_tenants (
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null check (role in ('admin','bayi')),
  primary key (user_id, tenant_id)
);

-- Row Level Security (RLS) etkinleştir
alter table tenants enable row level security;
alter table user_tenants enable row level security;

-- Tenants okuma politikası: Sadece kendi tenant'ına ait kayıtları görebilir
create policy tenants_read on tenants
  for select using (
    id in (
      select tenant_id 
      from user_tenants 
      where user_id = auth.uid()
    )
  );

-- User_tenants okuma politikası: Kendi kaydını görebilir
create policy ut_read on user_tenants
  for select using (user_id = auth.uid());

-- Not: Insert/Update/Delete işlemleri server-side SERVICE ROLE ile yapılacak,
-- bu yüzden public politika tanımlanmadı.

