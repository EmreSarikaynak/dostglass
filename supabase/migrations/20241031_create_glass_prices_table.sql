-- Cam Fiyat Listesi Tablosu (İlişkisel Yapı)
-- Excel fiyat listelerinden import edilecek cam bilgileri ve fiyatları
-- Araçlarla tam ilişkisel bağlantılı

create table if not exists glass_prices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  
  -- Ürün Kodları (farklı tedarikçi kodları)
  product_code text not null, -- Ana ürün kodu (UĞURLU KOD, EURO KOD, vs.)
  alternative_codes text[], -- Alternatif kodlar (array olarak)
  
  -- Ürün Tanımı
  stock_name text not null, -- STOK ADI (tam ürün adı)
  
  -- İLİŞKİSEL BAĞLANTILAR (Araç Bilgileri)
  vehicle_category_id uuid references vehicle_categories(id), -- Binek, Ticari, İş Makinesi
  vehicle_brand_id uuid references vehicle_brands(id), -- YARIŞ, ALFA ROMEO, AUDI, BMW
  vehicle_model_id uuid references vehicle_models(id), -- Corolla, Focus, Passat
  model_year_start text, -- Başlangıç yılı (ör. "88-93" -> "88")
  model_year_end text, -- Bitiş yılı (ör. "88-93" -> "93")
  
  -- Cam Özellikleri (İlişkisel)
  glass_position_id uuid references glass_positions(id), -- ÖN CAM, ARKA CAM, YAN CAM
  glass_type_id uuid references vehicle_glass_types(id), -- LAMİNE, TEMPERE, AKUSTİK
  glass_brand_id uuid references glass_brands(id), -- PİLKİNGTON, ŞİŞECAM
  glass_color_id uuid references glass_colors(id), -- RENKSİZ, YEŞİL, GRİ
  
  -- Metin Bazlı Bilgiler (Excel'den gelen ham veri - backup olarak)
  position_text text, -- KONUM (ÖN LAMİNE, ARKA RZT., YAN CAM)
  features text, -- ÖZELLİK (KAMERA APARATLI, SENSÖR APARATLI, ENKAPSÜL)
  
  -- Teknik Bilgiler
  hole_info text, -- DELİK (8 DL, 4 DL, 2 DL, vs.)
  thickness_mm numeric(5,2), -- MM (kalınlık)
  width_mm integer, -- EN (genişlik mm)
  height_mm integer, -- BOY (yükseklik mm)
  area_m2 numeric(6,3), -- M2 (metrekare)
  
  -- Fiyat Bilgileri (TL)
  price_colorless numeric(10,2) default 0, -- Renksiz fiyat
  price_colored numeric(10,2) default 0, -- Renkli fiyat
  price_double_color numeric(10,2) default 0, -- Çift renk/mavi/koyu gri
  
  -- Kategori ve Sınıflandırma
  category text, -- Hangi listeye ait (Oto Cam, Kabin, Aparatlı Ön Camlar)
  supplier text, -- Tedarikçi (UĞURLU, EURO, OLİMPİA)
  
  -- Özellik Bayrakları (kolay filtreleme için)
  has_camera boolean default false, -- Kamera aparatlı mı?
  has_sensor boolean default false, -- Sensör aparatlı mı?
  is_encapsulated boolean default false, -- Enkapsül mü?
  is_acoustic boolean default false, -- Akustik mi?
  is_heated boolean default false, -- Isıtmalı mı?
  
  -- Diğer
  notes text, -- Ek notlar
  is_active boolean default true,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  
  -- Aynı ürün kodu, aynı tedarikçi, aynı tenant için unique
  unique(product_code, supplier, tenant_id)
);

-- Index'ler (hızlı arama ve filtreleme için)
create index if not exists idx_glass_prices_tenant on glass_prices(tenant_id);
create index if not exists idx_glass_prices_product_code on glass_prices(product_code);
create index if not exists idx_glass_prices_category_id on glass_prices(vehicle_category_id);
create index if not exists idx_glass_prices_brand_id on glass_prices(vehicle_brand_id);
create index if not exists idx_glass_prices_model_id on glass_prices(vehicle_model_id);
create index if not exists idx_glass_prices_glass_position on glass_prices(glass_position_id);
create index if not exists idx_glass_prices_glass_type on glass_prices(glass_type_id);
create index if not exists idx_glass_prices_glass_brand on glass_prices(glass_brand_id);
create index if not exists idx_glass_prices_glass_color on glass_prices(glass_color_id);
create index if not exists idx_glass_prices_category on glass_prices(category);
create index if not exists idx_glass_prices_active on glass_prices(is_active);

-- Composite index (araç seçimi için optimize edilmiş)
create index if not exists idx_glass_prices_vehicle_lookup 
  on glass_prices(vehicle_brand_id, vehicle_model_id, glass_position_id) 
  where is_active = true;

-- Full-text search index (hızlı arama için)
create index if not exists idx_glass_prices_search on glass_prices using gin(
  to_tsvector('turkish', 
    coalesce(stock_name, '') || ' ' || 
    coalesce(position_text, '') || ' ' || 
    coalesce(features, '') || ' ' ||
    coalesce(product_code, '')
  )
);

-- Otomatik güncelleme trigger'ı
drop trigger if exists glass_prices_updated_at on glass_prices;
create trigger glass_prices_updated_at before update on glass_prices
  for each row execute function update_updated_at_column();

-- RLS Politikaları
alter table glass_prices enable row level security;

-- Tenant izolasyonu (sadece kendi tenant'ınızın fiyatlarını görebilirsiniz)
drop policy if exists glass_prices_tenant_isolation on glass_prices;
create policy glass_prices_tenant_isolation on glass_prices
  for all using (
    tenant_id in (
      select tenant_id
      from user_tenants
      where user_id = auth.uid()
    )
  );

-- Yorumlar (dokümantasyon)
comment on table glass_prices is 'Cam fiyat listesi - Excel fiyat listelerinden import edilir, araçlarla tam ilişkisel';
comment on column glass_prices.product_code is 'Ana ürün kodu (UĞURLU KOD, EURO KOD, OLİMPİA KOD) - Unique';
comment on column glass_prices.vehicle_category_id is 'Araç kategorisi (Binek, Ticari, İş Makinesi) - İLİŞKİSEL';
comment on column glass_prices.vehicle_brand_id is 'Araç markası - İLİŞKİSEL';
comment on column glass_prices.vehicle_model_id is 'Araç modeli - İLİŞKİSEL';
comment on column glass_prices.glass_position_id is 'Cam pozisyonu (Ön, Arka, Yan) - İLİŞKİSEL';
comment on column glass_prices.glass_type_id is 'Cam tipi (Lamine, Tempere) - İLİŞKİSEL';
comment on column glass_prices.glass_brand_id is 'Cam markası - İLİŞKİSEL';
comment on column glass_prices.glass_color_id is 'Cam rengi - İLİŞKİSEL';
comment on column glass_prices.position_text is 'Ham konum metni (Excel backup)';
comment on column glass_prices.features is 'Teknik özellikler (KAMERA APARATLI, SENSÖR, ENKAPSÜL)';
comment on column glass_prices.price_colorless is 'Renksiz cam fiyatı (TL)';
comment on column glass_prices.price_colored is 'Renkli cam fiyatı (TL)';
comment on column glass_prices.price_double_color is 'Çift renk/mavi/koyu gri fiyatı (TL)';
comment on column glass_prices.has_camera is 'Kamera aparatlı mı? (TRUE/FALSE)';
comment on column glass_prices.has_sensor is 'Sensör aparatlı mı? (TRUE/FALSE)';
comment on column glass_prices.is_encapsulated is 'Enkapsül mü? (TRUE/FALSE)';


-- Yardımcı VIEW: Kolay Sorgulama İçin
-- Bu view ile tüm ilişkisel bilgileri tek seferde çekebiliriz
create or replace view glass_prices_detailed as
select 
  gp.id,
  gp.tenant_id,
  gp.product_code,
  gp.alternative_codes,
  gp.stock_name,
  
  -- Araç Bilgileri (İlişkisel)
  vc.name as vehicle_category_name,
  vb.name as vehicle_brand_name,
  vm.name as vehicle_model_name,
  gp.model_year_start,
  gp.model_year_end,
  
  -- Cam Bilgileri (İlişkisel)
  gpos.name as glass_position_name,
  gtype.name as glass_type_name,
  gbrand.name as glass_brand_name,
  gcolor.name as glass_color_name,
  
  -- Diğer Bilgiler
  gp.position_text,
  gp.features,
  gp.hole_info,
  gp.thickness_mm,
  gp.width_mm,
  gp.height_mm,
  gp.area_m2,
  
  -- Fiyatlar
  gp.price_colorless,
  gp.price_colored,
  gp.price_double_color,
  
  -- Kategori
  gp.category,
  gp.supplier,
  
  -- Özellikler
  gp.has_camera,
  gp.has_sensor,
  gp.is_encapsulated,
  gp.is_acoustic,
  gp.is_heated,
  
  gp.is_active,
  gp.created_at,
  gp.updated_at,
  
  -- ID'ler (ilişki için)
  gp.vehicle_category_id,
  gp.vehicle_brand_id,
  gp.vehicle_model_id,
  gp.glass_position_id,
  gp.glass_type_id,
  gp.glass_brand_id,
  gp.glass_color_id
  
from glass_prices gp
left join vehicle_categories vc on gp.vehicle_category_id = vc.id
left join vehicle_brands vb on gp.vehicle_brand_id = vb.id
left join vehicle_models vm on gp.vehicle_model_id = vm.id
left join glass_positions gpos on gp.glass_position_id = gpos.id
left join vehicle_glass_types gtype on gp.glass_type_id = gtype.id
left join glass_brands gbrand on gp.glass_brand_id = gbrand.id
left join glass_colors gcolor on gp.glass_color_id = gcolor.id;

comment on view glass_prices_detailed is 'Cam fiyatları ile tüm ilişkisel bilgilerin birleştirilmiş görünümü';
