-- migrate:up
-- Orijinal cam talep sebeplerinin tutulduğu tablo

create table if not exists original_glass_request_reasons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Aynı isimde sebebin aynı tenant için ikinci kez oluşturulmasını engelle
create unique index if not exists idx_original_glass_request_reasons_tenant_name
  on original_glass_request_reasons(tenant_id, name);

create index if not exists idx_original_glass_request_reasons_tenant
  on original_glass_request_reasons(tenant_id);

create index if not exists idx_original_glass_request_reasons_active
  on original_glass_request_reasons(is_active);

-- RLS: tenant bazlı erişim
alter table original_glass_request_reasons enable row level security;

drop policy if exists ogr_reasons_select on original_glass_request_reasons;
create policy ogr_reasons_select on original_glass_request_reasons
  for select using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

drop policy if exists ogr_reasons_insert on original_glass_request_reasons;
create policy ogr_reasons_insert on original_glass_request_reasons
  for insert with check (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

drop policy if exists ogr_reasons_update on original_glass_request_reasons;
create policy ogr_reasons_update on original_glass_request_reasons
  for update using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  )
  with check (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

drop policy if exists ogr_reasons_delete on original_glass_request_reasons;
create policy ogr_reasons_delete on original_glass_request_reasons
  for delete using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

comment on table original_glass_request_reasons is 'Orijinal cam talepleri için sebep listesi (tenant bazlı)';
comment on column original_glass_request_reasons.name is 'Talep sebebi adı';

-- Varsayılan sebep verilerini tüm tenantlar için hazırla
insert into original_glass_request_reasons (tenant_id, name)
select t.id, v.reason
from tenants t
cross join (
  values 
    ('Acenta Talebi'),
    ('Müşteri Talebi'),
    ('Sigorta Talebi'),
    ('Yerli Üretim Stoğunun Bulunmaması'),
    ('Yerli Üretim Olmaması')
) as v(reason)
on conflict do nothing;

-- migrate:down
-- Rollback: policy, index ve tabloyu kaldır

drop policy if exists ogr_reasons_delete on original_glass_request_reasons;
drop policy if exists ogr_reasons_update on original_glass_request_reasons;
drop policy if exists ogr_reasons_insert on original_glass_request_reasons;
drop policy if exists ogr_reasons_select on original_glass_request_reasons;

drop index if exists idx_original_glass_request_reasons_active;
drop index if exists idx_original_glass_request_reasons_tenant;
drop index if exists idx_original_glass_request_reasons_tenant_name;

delete from original_glass_request_reasons
where name in (
  'Acenta Talebi',
  'Müşteri Talebi',
  'Sigorta Talebi',
  'Yerli Üretim Stoğunun Bulunmaması',
  'Yerli Üretim Olmaması'
);

drop table if exists original_glass_request_reasons;
