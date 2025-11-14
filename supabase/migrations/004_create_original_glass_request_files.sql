-- migrate:up
-- Orijinal cam taleplerine ait dosya ekleri

create type original_glass_file_visibility as enum ('tenant', 'admin');

create table if not exists original_glass_request_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  request_id uuid, -- not null references original_glass_requests(id) on delete cascade,
  uploader_id uuid not null references auth.users(id),
  storage_key text not null,
  file_name text not null,
  mime_type text not null,
  size bigint not null,
  description text,
  visibility original_glass_file_visibility not null default 'tenant',
  created_at timestamptz not null default now()
);

alter table original_glass_request_files
  add constraint original_glass_request_files_size_check
  check (size <= 10 * 1024 * 1024); -- 10MB

create index if not exists idx_ogr_files_tenant on original_glass_request_files(tenant_id);
create index if not exists idx_ogr_files_request on original_glass_request_files(request_id);
create index if not exists idx_ogr_files_uploader on original_glass_request_files(uploader_id);

alter table original_glass_request_files enable row level security;

-- Admin erişimi
drop policy if exists ogr_files_admin_access on original_glass_request_files;
create policy ogr_files_admin_access on original_glass_request_files
  for all using (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_request_files.tenant_id
        and ut.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_request_files.tenant_id
        and ut.role = 'admin'
    )
  );

-- Talep sahibi (dealer) erişimi
drop policy if exists ogr_files_request_owner_access on original_glass_request_files;
-- create policy ogr_files_request_owner_access on original_glass_request_files
--   for select using (
--     exists (
--       select 1
--       from original_glass_requests ogr
--       where ogr.id = original_glass_request_files.request_id
--         and ogr.dealer_user_id = auth.uid()
--     )
--   );

drop policy if exists ogr_files_request_owner_insert on original_glass_request_files;
-- create policy ogr_files_request_owner_insert on original_glass_request_files
--   for insert with check (
--     exists (
--       select 1
--       from original_glass_requests ogr
--       where ogr.id = original_glass_request_files.request_id
--         and ogr.dealer_user_id = auth.uid()
--     )
--   );

drop policy if exists ogr_files_request_owner_update on original_glass_request_files;
-- create policy ogr_files_request_owner_update on original_glass_request_files
--   for update using (
--     uploader_id = auth.uid()
--       and exists (
--         select 1
--         from original_glass_requests ogr
--         where ogr.id = original_glass_request_files.request_id
--           and ogr.dealer_user_id = auth.uid()
--       )
--   )
--   with check (
--     uploader_id = auth.uid()
--       and exists (
--         select 1
--         from original_glass_requests ogr
--         where ogr.id = original_glass_request_files.request_id
--           and ogr.dealer_user_id = auth.uid()
--       )
--   );

drop policy if exists ogr_files_request_owner_delete on original_glass_request_files;
-- create policy ogr_files_request_owner_delete on original_glass_request_files
--   for delete using (
--     uploader_id = auth.uid()
--       and exists (
--         select 1
--         from original_glass_requests ogr
--         where ogr.id = original_glass_request_files.request_id
--           and ogr.dealer_user_id = auth.uid()
--       )
--   );

comment on table original_glass_request_files is 'Orijinal cam taleplerine yüklenen dosyalar';
comment on column original_glass_request_files.storage_key is 'Supabase storage anahtarı {tenant}/{request}/{file} formatında';
comment on column original_glass_request_files.visibility is 'Dosyanın görünürlüğü (tenant / admin)';

-- migrate:down

drop policy if exists ogr_files_request_owner_delete on original_glass_request_files;
drop policy if exists ogr_files_request_owner_update on original_glass_request_files;
drop policy if exists ogr_files_request_owner_insert on original_glass_request_files;
drop policy if exists ogr_files_request_owner_access on original_glass_request_files;
drop policy if exists ogr_files_admin_access on original_glass_request_files;

drop index if exists idx_ogr_files_uploader;
drop index if exists idx_ogr_files_request;
drop index if exists idx_ogr_files_tenant;

alter table original_glass_request_files
  drop constraint if exists original_glass_request_files_size_check;

drop table if exists original_glass_request_files;

drop type if exists original_glass_file_visibility;
