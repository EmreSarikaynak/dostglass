-- Seed default parameter data required by the claims module

-- 1) Insurance companies
insert into insurance_companies (code, name, is_active)
values
  ('AK', 'AK SİGORTA', true),
  ('ALLIANZ', 'ALLIANZ SİGORTA', true),
  ('ANADOLU', 'ANADOLU SİGORTA', true),
  ('ANKARA', 'ANKARA SİGORTA', true),
  ('CORPUS', 'CORPUS SİGORTA', true),
  ('HDI', 'HDI SİGORTA', true),
  ('MAGDEBURGER', 'MAGDEBURGER SİGORTA', true),
  ('ORIENT', 'ORİENT SİGORTA', true),
  ('QUICK', 'QUICK SİGORTA', true),
  ('REFERANS', 'REFERANS SİGORTA', true),
  ('UNICO', 'UNICO SİGORTA', true),
  ('ZURICH', 'ZURICH SİGORTA', true)
on conflict (code) do nothing;

-- 2) Insured types
insert into insured_types (name, is_active)
values
  ('ŞAHIS', true),
  ('ŞİRKET', true)
on conflict (name) do nothing;

-- 3) Incident types
insert into incident_types (name, is_active)
values
  ('Beyanlı', true),
  ('Zabıtlı', true),
  ('Anlaşmalı', true),
  ('Tutanaklı', true)
on conflict (name) do nothing;

-- 4) Damage types
insert into damage_types (name, is_active)
values
  ('Dolu Hasarı', true),
  ('Cisim Düşmesi', true),
  ('Hırsızlığa Teşebbüs', true),
  ('Taş Sıçraması', true),
  ('Trafik Kazası', true),
  ('Üçüncü Şahıs', true)
on conflict (name) do nothing;

-- 5) Vehicle usage types
insert into vehicle_usage_types (name, is_active)
values
  ('Binek', true),
  ('Kamyon', true),
  ('Kamyonet', true),
  ('Çekici', true),
  ('Minibüs', true),
  ('Otobüs', true),
  ('Traktör', true),
  ('İş Makinesi', true),
  ('Motosiklet', true)
on conflict (name) do nothing;

-- 6) Vehicle categories used to group brands
insert into vehicle_categories (name, is_active)
values
  ('BİNEK', true),
  ('KAMYON', true),
  ('KAMYONET', true),
  ('ÇEKİCİ', true),
  ('MİNİBÜS', true),
  ('OTOBÜS', true),
  ('TRAKTÖR', true),
  ('İŞ MAKİNESİ', true),
  ('MOTOSİKLET', true)
on conflict (name) do nothing;

-- 7) Vehicle glass types (Cam Tipi alanı)
insert into vehicle_glass_types (name, is_active)
values
  ('Yerli', true),
  ('Orijinal', true),
  ('İthal', true)
on conflict (name) do nothing;

-- 8) Glass positions (Cam Türü alanı)
insert into glass_positions (name, is_active)
values
  ('ARKA ALT', true),
  ('ARKA CAM', true),
  ('ARKA CAM RZT', true),
  ('ARKA KAPAK', true),
  ('ARKA KAPI', true),
  ('ARKA KELEBEK', true),
  ('ARKA YANCAM', true),
  ('DİĞER', true),
  ('KAPI ARKASI', true),
  ('KAPI CAMI', true),
  ('KELEBEK', true),
  ('KÖŞE CAMI', true),
  ('LAMİNE', true),
  ('ORTA', true),
  ('SABİT', true),
  ('SUNROOF', true),
  ('SÜRGÜ', true),
  ('TAVAN CAMI', true),
  ('YAN CAM', true),
  ('ÖN CAM', true),
  ('ÖN KANAT', true),
  ('ÖN KAPI', true),
  ('ÖN KELEBEK', true)
on conflict (name) do nothing;

-- 9) Glass colors
insert into glass_colors (name, is_active)
values
  ('BEYAZ', true),
  ('TÜM YARIM', true),
  ('ÇİFT RENK', true),
  ('K. YEŞİL - K. GRİ', true)
on conflict (name) do nothing;

-- 10) Service locations
insert into service_locations (name, is_active)
values
  ('Serviste', true),
  ('Mobil', true)
on conflict (name) do nothing;

-- 11) Installation methods
insert into installation_methods (name, is_active)
values
  ('Lastikli', true),
  ('Yapıştırma', true)
on conflict (name) do nothing;

-- 12) Vehicle brands grouped by category
insert into vehicle_brands (name, category_id, is_active)
select v.brand_name, c.id, true
from (values
  ('ALFA ROMEO', 'BİNEK'),
  ('AMERİKAN', 'BİNEK'),
  ('AUDI', 'BİNEK'),
  ('BMW', 'BİNEK'),
  ('BMV', 'BİNEK'),
  ('CADILLAC', 'BİNEK'),
  ('CHERY', 'BİNEK'),
  ('CHEVROLET', 'BİNEK'),
  ('CHRYSLER', 'BİNEK'),
  ('CITROEN', 'BİNEK'),
  ('DACIA', 'BİNEK'),
  ('DAEWOO', 'BİNEK'),
  ('DAIHATSU', 'BİNEK'),
  ('DFM/SUZUKI', 'BİNEK'),
  ('DODGE', 'BİNEK'),
  ('FIAT', 'BİNEK'),
  ('FORD', 'BİNEK'),
  ('GELLY', 'BİNEK'),
  ('HONDA', 'BİNEK'),
  ('HUMMER', 'BİNEK'),
  ('HYUNDAI', 'BİNEK'),
  ('JAGUAR', 'BİNEK'),
  ('JEEP', 'BİNEK'),
  ('KIA', 'BİNEK'),
  ('LADA', 'BİNEK'),
  ('LAND', 'BİNEK'),
  ('LANCIA', 'BİNEK'),
  ('MAHINDRA', 'BİNEK'),
  ('MASERATI', 'BİNEK'),
  ('MAZDA', 'BİNEK'),
  ('MERCEDES', 'BİNEK'),
  ('MINI COOPER', 'BİNEK'),
  ('MITSUBISHI', 'BİNEK'),
  ('MOSKWITCH', 'BİNEK'),
  ('NISSAN', 'BİNEK'),
  ('OPEL', 'BİNEK'),
  ('PEUGEOT', 'BİNEK'),
  ('PORSCHE', 'BİNEK'),
  ('PROTON', 'BİNEK'),
  ('RANGE', 'BİNEK'),
  ('RENAULT', 'BİNEK'),
  ('ROVER', 'BİNEK'),
  ('SAAB', 'BİNEK'),
  ('SAMAND', 'BİNEK'),
  ('SAMSUNG', 'BİNEK'),
  ('SEAT', 'BİNEK'),
  ('SKODA', 'BİNEK'),
  ('SSANG', 'BİNEK'),
  ('SUBARU', 'BİNEK'),
  ('SUZUKI', 'BİNEK'),
  ('TATA', 'BİNEK'),
  ('TESLA', 'BİNEK'),
  ('TOGG', 'BİNEK'),
  ('TOYOTA', 'BİNEK'),
  ('VOLKSWAGEN', 'BİNEK'),
  ('VOLVO', 'BİNEK'),
  ('MC', 'BİNEK'),
  ('GMC', 'BİNEK'),
  ('BMC', 'KAMYON'),
  ('DAF', 'KAMYON'),
  ('HINO', 'KAMYON'),
  ('INTER', 'KAMYON'),
  ('LIAZ', 'KAMYON'),
  ('MAGIRUS', 'KAMYON'),
  ('MAN', 'KAMYON'),
  ('OTOYOL', 'KAMYON'),
  ('SCANIA', 'KAMYON'),
  ('VOLVO', 'KAMYON'),
  ('MERCEDES', 'KAMYON'),
  ('FORD', 'KAMYON'),
  ('CHEVROLET', 'KAMYONET'),
  ('CITROEN', 'KAMYONET'),
  ('DFM/SUZUKI', 'KAMYONET'),
  ('DODGE', 'KAMYONET'),
  ('FARGO', 'KAMYONET'),
  ('FIAT', 'KAMYONET'),
  ('FORD', 'KAMYONET'),
  ('GAZELLE', 'KAMYONET'),
  ('GMC', 'KAMYONET'),
  ('HYUNDAI', 'KAMYONET'),
  ('ISUZU', 'KAMYONET'),
  ('KIA', 'KAMYONET'),
  ('MAZDA', 'KAMYONET'),
  ('MITSUBISHI', 'KAMYONET'),
  ('NISSAN', 'KAMYONET'),
  ('PEUGEOT', 'KAMYONET'),
  ('RENAULT', 'KAMYONET'),
  ('SAMSUNG', 'KAMYONET'),
  ('SSANG', 'KAMYONET'),
  ('SUZUKI', 'KAMYONET'),
  ('TATA', 'KAMYONET'),
  ('TOYOTA', 'KAMYONET'),
  ('VOLKSWAGEN', 'KAMYONET'),
  ('SCANIA', 'ÇEKİCİ'),
  ('MAN', 'ÇEKİCİ'),
  ('VOLVO', 'ÇEKİCİ'),
  ('MERCEDES', 'ÇEKİCİ'),
  ('DAF', 'ÇEKİCİ'),
  ('BMC', 'ÇEKİCİ'),
  ('HINO', 'ÇEKİCİ'),
  ('FORD', 'ÇEKİCİ'),
  ('KARSAN', 'MİNİBÜS'),
  ('OTOKAR', 'MİNİBÜS'),
  ('ISUZU', 'MİNİBÜS'),
  ('FORD', 'MİNİBÜS'),
  ('MERCEDES', 'MİNİBÜS'),
  ('VOLKSWAGEN', 'MİNİBÜS'),
  ('TOYOTA', 'MİNİBÜS'),
  ('HYUNDAI', 'MİNİBÜS'),
  ('FIAT', 'MİNİBÜS'),
  ('PEUGEOT', 'MİNİBÜS'),
  ('CITROEN', 'MİNİBÜS'),
  ('BMC', 'MİNİBÜS'),
  ('TEMSA', 'MİNİBÜS'),
  ('KIA', 'MİNİBÜS'),
  ('GÜLERYÜZ', 'OTOBÜS'),
  ('NEOPLAN', 'OTOBÜS'),
  ('SETRA', 'OTOBÜS'),
  ('TCV', 'OTOBÜS'),
  ('TEMSA', 'OTOBÜS'),
  ('OTOKAR', 'OTOBÜS'),
  ('BMC', 'OTOBÜS'),
  ('KARSAN', 'OTOBÜS'),
  ('MAN', 'OTOBÜS'),
  ('MERCEDES', 'OTOBÜS'),
  ('VOLVO', 'OTOBÜS'),
  ('ISUZU', 'OTOBÜS'),
  ('TUMOSAN', 'TRAKTÖR'),
  ('NEW HOLLAND', 'TRAKTÖR'),
  ('MASSEY FERGUSON', 'TRAKTÖR'),
  ('LS', 'TRAKTÖR'),
  ('VALTRA', 'TRAKTÖR'),
  ('LANDINI', 'TRAKTÖR'),
  ('JOHN DEERE', 'TRAKTÖR'),
  ('DEUTZ', 'TRAKTÖR'),
  ('SAME', 'TRAKTÖR'),
  ('ERKUNT', 'TRAKTÖR'),
  ('CASE IH', 'TRAKTÖR'),
  ('BASAK', 'TRAKTÖR'),
  ('HATTAT', 'TRAKTÖR'),
  ('MC CORMICK', 'TRAKTÖR'),
  ('MAHINDRA', 'TRAKTÖR'),
  ('HIDROMEK', 'İŞ MAKİNESİ'),
  ('JCB', 'İŞ MAKİNESİ'),
  ('CASE IH', 'İŞ MAKİNESİ'),
  ('NEW HOLLAND', 'İŞ MAKİNESİ')
) as v(brand_name, category_name)
join vehicle_categories c on c.name = v.category_name
on conflict (name, category_id) do nothing;
