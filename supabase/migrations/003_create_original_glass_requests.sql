-- migrate:up
-- Orijinal cam taleplerinin tutulduğu ana tablo

create type original_glass_request_status as enum ('pending', 'processing', 'fulfilled', 'rejected');

create table if not exists original_glass_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_file_id uuid references case_files(id) on delete cascade,
  request_number text not null,
  dealer_user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  assigned_admin_id uuid references auth.users(id),
  status original_glass_request_status not null default 'pending',
  request_reason_id uuid references original_glass_request_reasons(id),
  promised_delivery_days integer,
  promised_delivery_date date,
  termin_date date,
  notes text,
  response_notes text,
  plate text not null,
  chassis_no text,
  model_year integer,
  vehicle_brand_id uuid references vehicle_brands(id),
  vehicle_model_id uuid references vehicle_models(id),
  vehicle_submodel text,
  glass_type_id uuid references vehicle_glass_types(id),
  glass_color_id uuid references glass_colors(id),
  glass_features text,
  euro_code text,
  glass_part_code text,
  glass_price numeric(12,2),
  discount_rate numeric(5,2),
  currency text,
  insurance_company_id uuid references insurance_companies(id),
  policy_number text,
  policy_type text,
  insured_name text,
  insured_phone text not null,
  claim_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Talep numarasının formatını doğrula (ORJ-YYYY-#####)
alter table original_glass_requests
  add constraint original_glass_requests_number_format
  check (request_number ~ '^ORJ-[0-9]{4}-[0-9]{5}$');

-- Sigortalı telefon için basit format kontrolü (en az 10 hane)
alter table original_glass_requests
  add constraint original_glass_requests_insured_phone_check
  check (length(regexp_replace(insured_phone, '\D', '', 'g')) >= 10);

-- İndeksler
create unique index if not exists idx_original_glass_requests_number on original_glass_requests(request_number);
create index if not exists idx_original_glass_requests_tenant on original_glass_requests(tenant_id);
create index if not exists idx_original_glass_requests_dealer on original_glass_requests(dealer_user_id);
create index if not exists idx_original_glass_requests_status on original_glass_requests(status);
create index if not exists idx_original_glass_requests_case_file on original_glass_requests(case_file_id);
create index if not exists idx_original_glass_requests_created_at on original_glass_requests(created_at);
create index if not exists idx_original_glass_requests_assigned_admin on original_glass_requests(assigned_admin_id);

-- RLS etkinleştir ve politikaları tanımla
alter table original_glass_requests enable row level security;

-- Admin kullanıcılar (aynı tenant) tüm kayıtları görebilir
drop policy if exists ogr_requests_select_admin on original_glass_requests;
create policy ogr_requests_select_admin on original_glass_requests
  for select using (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_requests.tenant_id
        and ut.role = 'admin'
    )
  );

-- Bayi/dealer sadece kendi kayıtlarını görebilir
drop policy if exists ogr_requests_select_dealer on original_glass_requests;
create policy ogr_requests_select_dealer on original_glass_requests
  for select using (
    dealer_user_id = auth.uid()
  );

-- Kayıt oluşturma (dealer veya admin kendi tenant'ı için)
drop policy if exists ogr_requests_insert on original_glass_requests;
create policy ogr_requests_insert on original_glass_requests
  for insert with check (
    tenant_id in (
      select ut.tenant_id
      from user_tenants ut
      where ut.user_id = auth.uid()
    )
  );

-- Admin güncelleme politikası
drop policy if exists ogr_requests_update_admin on original_glass_requests;
create policy ogr_requests_update_admin on original_glass_requests
  for update using (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_requests.tenant_id
        and ut.role = 'admin'
    )
  )
  with check (
    tenant_id in (
      select ut.tenant_id
      from user_tenants ut
      where ut.user_id = auth.uid()
    )
  );

-- Dealer güncelleme politikası (sadece kendi kaydı)
drop policy if exists ogr_requests_update_dealer on original_glass_requests;
create policy ogr_requests_update_dealer on original_glass_requests
  for update using (
    dealer_user_id = auth.uid()
  )
  with check (
    dealer_user_id = auth.uid()
  );

-- Silme sadece admin
drop policy if exists ogr_requests_delete on original_glass_requests;
create policy ogr_requests_delete on original_glass_requests
  for delete using (
    exists (
      select 1
      from user_tenants ut
      where ut.user_id = auth.uid()
        and ut.tenant_id = original_glass_requests.tenant_id
        and ut.role = 'admin'
    )
  );

comment on table original_glass_requests is 'Orijinal cam taleplerinin ana kaydı';
comment on column original_glass_requests.request_number is 'Otomatik oluşturulan talep numarası (ORJ-YYYY-#####)';
comment on column original_glass_requests.dealer_user_id is 'Talebi açan bayinin kullanıcı kimliği';
comment on column original_glass_requests.status is 'Talep durumu (pending, processing, fulfilled, rejected)';

-- migrate:down

drop policy if exists ogr_requests_delete on original_glass_requests;
drop policy if exists ogr_requests_update_dealer on original_glass_requests;
drop policy if exists ogr_requests_update_admin on original_glass_requests;
drop policy if exists ogr_requests_insert on original_glass_requests;
drop policy if exists ogr_requests_select_dealer on original_glass_requests;
drop policy if exists ogr_requests_select_admin on original_glass_requests;

drop index if exists idx_original_glass_requests_assigned_admin;
drop index if exists idx_original_glass_requests_created_at;
drop index if exists idx_original_glass_requests_case_file;
drop index if exists idx_original_glass_requests_status;
drop index if exists idx_original_glass_requests_dealer;
drop index if exists idx_original_glass_requests_tenant;
drop index if exists idx_original_glass_requests_number;

alter table original_glass_requests drop constraint if exists original_glass_requests_insured_phone_check;
alter table original_glass_requests drop constraint if exists original_glass_requests_number_format;

drop table if exists original_glass_requests;

drop type if exists original_glass_request_status;
