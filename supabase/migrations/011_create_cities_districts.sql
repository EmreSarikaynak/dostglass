-- Şehir ve ilçe tablolarını oluştur

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  plate_code text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  constraint cities_plate_code_unique unique (plate_code)
);

create index if not exists idx_cities_name on cities(name);
create index if not exists idx_cities_plate_code on cities(plate_code);

create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  constraint districts_city_name_unique unique (city_id, name)
);

create index if not exists idx_districts_city_id on districts(city_id);
create index if not exists idx_districts_name on districts(name);

-- RLS tüm kullanıcıların okumasına izin verecek şekilde ayarla
alter table cities enable row level security;
alter table districts enable row level security;

drop policy if exists cities_read on cities;
create policy cities_read on cities for select using (true);

drop policy if exists districts_read on districts;
create policy districts_read on districts for select using (true);
