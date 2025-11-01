-- Parametrik Tablolar Migration
-- Tüm parametrik tabloları oluşturur

-- Sigorta Şirketleri
create table if not exists insurance_companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sigortalı Tipleri
create table if not exists insured_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Olay Şekilleri
create table if not exists incident_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Hasar Şekilleri
create table if not exists damage_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Ehliyet Sınıfları
create table if not exists license_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Araç Kategorileri (Binek, Ticari, Motosiklet vb.)
create table if not exists vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Araç Kullanım Tipleri
create table if not exists vehicle_usage_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Araç Markaları
create table if not exists vehicle_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references vehicle_categories(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(name, category_id)
);

-- Araç Modelleri
create table if not exists vehicle_models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_id uuid not null references vehicle_brands(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(name, brand_id)
);

-- Cam Markaları
create table if not exists glass_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Cam Pozisyonları (Ön Cam, Yan Cam, Arka Cam vb.)
create table if not exists glass_positions (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Cam İşlemleri
create table if not exists glass_operations (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Cam Renkleri
create table if not exists glass_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Araç Cam Tipleri
create table if not exists vehicle_glass_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Montaj Şekilleri
create table if not exists installation_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- İşlem Yerleri
create table if not exists service_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Index'ler
create index if not exists idx_vehicle_brands_category on vehicle_brands(category_id);
create index if not exists idx_vehicle_models_brand on vehicle_models(brand_id);
create index if not exists idx_insurance_companies_active on insurance_companies(is_active);

-- RLS Politikaları - Herkes okuyabilir (parametrik veriler)
alter table insurance_companies enable row level security;
alter table insured_types enable row level security;
alter table incident_types enable row level security;
alter table damage_types enable row level security;
alter table license_classes enable row level security;
alter table vehicle_categories enable row level security;
alter table vehicle_usage_types enable row level security;
alter table vehicle_brands enable row level security;
alter table vehicle_models enable row level security;
alter table glass_brands enable row level security;
alter table glass_positions enable row level security;
alter table glass_operations enable row level security;
alter table glass_colors enable row level security;
alter table vehicle_glass_types enable row level security;
alter table installation_methods enable row level security;
alter table service_locations enable row level security;

-- Okuma politikaları (önce varsa sil, sonra oluştur)
drop policy if exists insurance_companies_read on insurance_companies;
drop policy if exists insured_types_read on insured_types;
drop policy if exists incident_types_read on incident_types;
drop policy if exists damage_types_read on damage_types;
drop policy if exists license_classes_read on license_classes;
drop policy if exists vehicle_categories_read on vehicle_categories;
drop policy if exists vehicle_usage_types_read on vehicle_usage_types;
drop policy if exists vehicle_brands_read on vehicle_brands;
drop policy if exists vehicle_models_read on vehicle_models;
drop policy if exists glass_brands_read on glass_brands;
drop policy if exists glass_positions_read on glass_positions;
drop policy if exists glass_operations_read on glass_operations;
drop policy if exists glass_colors_read on glass_colors;
drop policy if exists vehicle_glass_types_read on vehicle_glass_types;
drop policy if exists installation_methods_read on installation_methods;
drop policy if exists service_locations_read on service_locations;

create policy insurance_companies_read on insurance_companies for select using (true);
create policy insured_types_read on insured_types for select using (true);
create policy incident_types_read on incident_types for select using (true);
create policy damage_types_read on damage_types for select using (true);
create policy license_classes_read on license_classes for select using (true);
create policy vehicle_categories_read on vehicle_categories for select using (true);
create policy vehicle_usage_types_read on vehicle_usage_types for select using (true);
create policy vehicle_brands_read on vehicle_brands for select using (true);
create policy vehicle_models_read on vehicle_models for select using (true);
create policy glass_brands_read on glass_brands for select using (true);
create policy glass_positions_read on glass_positions for select using (true);
create policy glass_operations_read on glass_operations for select using (true);
create policy glass_colors_read on glass_colors for select using (true);
create policy vehicle_glass_types_read on vehicle_glass_types for select using (true);
create policy installation_methods_read on installation_methods for select using (true);
create policy service_locations_read on service_locations for select using (true);

