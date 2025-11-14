-- İhbar Tabloları Migration
-- Hasar ihbarları ve cam detayları tabloları

-- İhbar Ana Tablosu
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  claim_number text unique, -- Otomatik oluşturulacak ihbar numarası
  
  -- Sigorta ve Poliçe Bilgileri
  insurance_company_id uuid references insurance_companies(id),
  agency_code text,
  agency_name text,
  policy_number text,
  policy_start_date date,
  policy_end_date date,
  
  -- Hasar Bilgileri
  incident_type_id uuid references incident_types(id),
  damage_type_id uuid references damage_types(id),
  incident_city_id uuid references cities(id),
  incident_district_id uuid references districts(id),
  incident_date date,
  
  -- Sigortalı Bilgileri
  insured_type_id uuid references insured_types(id),
  insured_name text,
  insured_tax_office text,
  insured_tax_number text,
  insured_phone text,
  insured_mobile text,
  
  -- Sürücü Bilgileri
  driver_same_as_insured boolean default false,
  driver_name text,
  driver_tc_number text,
  driver_phone text,
  driver_birth_date date,
  driver_license_class_id uuid references license_classes(id),
  driver_license_date date,
  driver_license_place text,
  driver_license_number text,
  
  -- Araç Bilgileri
  vehicle_plate text,
  vehicle_model_year integer,
  vehicle_usage_type_id uuid references vehicle_usage_types(id),
  vehicle_category_id uuid references vehicle_categories(id),
  vehicle_brand_id uuid references vehicle_brands(id),
  vehicle_model_id uuid references vehicle_models(id),
  
  -- Notlar
  notes text,
  
  -- Durum
  status text default 'draft' check (status in ('draft', 'submitted', 'in_progress', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  submitted_at timestamptz
);

-- İhbar Cam Kalemleri Tablosu
create table if not exists claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims(id) on delete cascade,
  
  -- Cam Bilgileri
  glass_position_id uuid references glass_positions(id),  -- Cam Türü (Ön Cam, Yan Cam vb.)
  glass_type_id uuid references vehicle_glass_types(id),  -- Cam Tipi
  glass_brand_id uuid references glass_brands(id),        -- Cam Marka
  glass_code text,                                         -- Cam Kod
  glass_color_id uuid references glass_colors(id),        -- Cam Renk
  glass_operation_id uuid references glass_operations(id), -- Cam İşlemi
  installation_method_id uuid references installation_methods(id), -- Montaj Şekli
  service_location_id uuid references service_locations(id), -- İşlem Yeri
  
  -- Fiyat Bilgileri
  unit_price numeric(10,2),
  quantity integer default 1,
  subtotal numeric(10,2),
  vat_rate numeric(5,2) default 20,
  vat_amount numeric(10,2),
  total_amount numeric(10,2),
  
  -- Ek Bilgiler
  customer_contribution boolean default false, -- Müşteriye kullandırılmış mı
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index'ler
create index if not exists idx_claims_tenant on claims(tenant_id);
create index if not exists idx_claims_created_by on claims(created_by);
create index if not exists idx_claims_status on claims(status);
create index if not exists idx_claims_claim_number on claims(claim_number);
create index if not exists idx_claims_vehicle_plate on claims(vehicle_plate);
create index if not exists idx_claims_incident_date on claims(incident_date);
create index if not exists idx_claim_items_claim on claim_items(claim_id);

-- Otomatik güncellenme trigger'ı
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists claims_updated_at on claims;
create trigger claims_updated_at before update on claims
  for each row execute function update_updated_at_column();

drop trigger if exists claim_items_updated_at on claim_items;
create trigger claim_items_updated_at before update on claim_items
  for each row execute function update_updated_at_column();

-- İhbar numarası otomatik oluşturma fonksiyonu
create or replace function generate_claim_number()
returns trigger as $$
declare
  year_prefix text;
  sequence_num integer;
  new_claim_number text;
begin
  -- Yıl prefix'i (örn: 2024)
  year_prefix := to_char(now(), 'YYYY');
  
  -- Bu yıl için son sıra numarasını bul
  select coalesce(max(
    case 
      when claim_number ~ ('^' || year_prefix || '-[0-9]+$')
      then cast(substring(claim_number from '[0-9]+$') as integer)
      else 0
    end
  ), 0) + 1
  into sequence_num
  from claims
  where claim_number like year_prefix || '-%';
  
  -- Yeni ihbar numarası (örn: 2024-00001)
  new_claim_number := year_prefix || '-' || lpad(sequence_num::text, 5, '0');
  
  new.claim_number := new_claim_number;
  return new;
end;
$$ language plpgsql;

drop trigger if exists generate_claim_number_trigger on claims;
create trigger generate_claim_number_trigger
  before insert on claims
  for each row
  when (new.claim_number is null)
  execute function generate_claim_number();

-- RLS Politikaları
alter table claims enable row level security;
alter table claim_items enable row level security;

-- İhbarları sadece kendi tenant'ına ait olanları görebilir
drop policy if exists claims_tenant_isolation on claims;
create policy claims_tenant_isolation on claims
  for all using (
    tenant_id in (
      select tenant_id 
      from user_tenants 
      where user_id = auth.uid()
    )
  );

-- İhbar kalemlerini sadece kendi tenant'ına ait ihbarlara bağlı olanları görebilir
drop policy if exists claim_items_tenant_isolation on claim_items;
create policy claim_items_tenant_isolation on claim_items
  for all using (
    claim_id in (
      select id from claims
      where tenant_id in (
        select tenant_id 
        from user_tenants 
        where user_id = auth.uid()
      )
    )
  );

