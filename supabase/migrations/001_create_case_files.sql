-- migrate:up
-- Original cam süreçleri için davaların tutulduğu case_files tablosu

create table if not exists case_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_number text not null,
  section text not null default 'original_glass',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id)
);

-- Case numarası format kontrolü (DOS-YYYY-#####)
alter table case_files
  add constraint case_files_case_number_format
  check (case_number ~ '^DOS-[0-9]{4}-[0-9]{5}$');

-- Indexler
create index if not exists idx_case_files_tenant_id on case_files(tenant_id);
create unique index if not exists idx_case_files_case_number on case_files(case_number);
create index if not exists idx_case_files_created_at on case_files(created_at);

-- RLS kuralları: kullanıcı sadece kendi tenant'ına ait kayıtları görebilsin
alter table case_files enable row level security;

drop policy if exists case_files_tenant_select on case_files;
create policy case_files_tenant_select on case_files
  for select using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

drop policy if exists case_files_tenant_insert on case_files;
create policy case_files_tenant_insert on case_files
  for insert with check (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

drop policy if exists case_files_tenant_update on case_files;
create policy case_files_tenant_update on case_files
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

drop policy if exists case_files_tenant_delete on case_files;
create policy case_files_tenant_delete on case_files
  for delete using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

comment on table case_files is 'Original cam süreçlerine ait vaka dosyaları';
comment on column case_files.case_number is 'Otomatik üretilen dosya numarası (format: DOS-YYYY-#####)';
comment on column case_files.section is 'Modül bilgisi; varsayılan original_glass';
comment on column case_files.status is 'Vaka durum bilgisi (open vb.)';

-- migrate:down
-- Rollback: ilgili policy, index ve tabloyu kaldır

drop policy if exists case_files_tenant_delete on case_files;
drop policy if exists case_files_tenant_update on case_files;
drop policy if exists case_files_tenant_insert on case_files;
drop policy if exists case_files_tenant_select on case_files;

drop index if exists idx_case_files_created_at;
drop index if exists idx_case_files_case_number;
drop index if exists idx_case_files_tenant_id;

alter table case_files drop constraint if exists case_files_case_number_format;

drop table if exists case_files;
