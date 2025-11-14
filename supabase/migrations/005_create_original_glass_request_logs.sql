-- migrate:up
-- Orijinal cam taleplerinin log kayıtları

create type original_glass_request_log_action as enum ('status_change', 'note_added', 'file_upload', 'assignment_change', 'update');

create table if not exists original_glass_request_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  request_id uuid, -- not null references original_glass_requests(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  action original_glass_request_log_action not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ogr_logs_tenant on original_glass_request_logs(tenant_id);
create index if not exists idx_ogr_logs_request on original_glass_request_logs(request_id);
create index if not exists idx_ogr_logs_created_at on original_glass_request_logs(created_at desc);

alter table original_glass_request_logs enable row level security;

-- Adminler tüm logları görebilir
drop policy if exists ogr_logs_admin on original_glass_request_logs;
create policy ogr_logs_admin on original_glass_request_logs
  for all using (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_request_logs.tenant_id
        and ut.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_request_logs.tenant_id
        and ut.role = 'admin'
    )
  );

-- Talep sahibi logları okuyabilir
drop policy if exists ogr_logs_request_owner on original_glass_request_logs;
-- create policy ogr_logs_request_owner on original_glass_request_logs
--   for select using (
--     exists (
--       select 1
--       from original_glass_requests ogr
--       where ogr.id = original_glass_request_logs.request_id
--         and ogr.dealer_user_id = auth.uid()
--     )
--   );

comment on table original_glass_request_logs is 'Orijinal cam taleplerinde yapılan işlemlerin geçmişi';
comment on column original_glass_request_logs.payload is 'İşlemle ilgili ek bilgileri barındıran JSON';

-- migrate:down

drop policy if exists ogr_logs_request_owner on original_glass_request_logs;
drop policy if exists ogr_logs_admin on original_glass_request_logs;

drop index if exists idx_ogr_logs_created_at;
drop index if exists idx_ogr_logs_request;
drop index if exists idx_ogr_logs_tenant;

drop table if exists original_glass_request_logs;

drop type if exists original_glass_request_log_action;
