-- Gerekli unique constraint ve index'leri güvenli şekilde oluştur
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cities_plate_code_unique'
  ) then
    alter table cities
      add constraint cities_plate_code_unique unique (plate_code);
  end if;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'districts_city_name_unique'
  ) then
    alter table districts
      add constraint districts_city_name_unique unique (city_id, name);
  end if;
end;
$$ language plpgsql;

create index if not exists idx_cities_plate_code on cities(plate_code);
create index if not exists idx_districts_city_id on districts(city_id);

-- Türkiye'nin 81 ilini cities tablosuna ekle (plaka kodu ile birlikte)
insert into cities (name, plate_code, is_active) values
('ADANA', '01', true),
('ADIYAMAN', '02', true),
('AFYONKARAHİSAR', '03', true),
('AĞRI', '04', true),
('AMASYA', '05', true),
('ANKARA', '06', true),
('ANTALYA', '07', true),
('ARTVİN', '08', true),
('AYDIN', '09', true),
('BALIKESİR', '10', true),
('BİLECİK', '11', true),
('BİNGÖL', '12', true),
('BİTLİS', '13', true),
('BOLU', '14', true),
('BURDUR', '15', true),
('BURSA', '16', true),
('ÇANAKKALE', '17', true),
('ÇANKIRI', '18', true),
('ÇORUM', '19', true),
('DENİZLİ', '20', true),
('DİYARBAKIR', '21', true),
('EDİRNE', '22', true),
('ELAZIĞ', '23', true),
('ERZİNCAN', '24', true),
('ERZURUM', '25', true),
('ESKİŞEHİR', '26', true),
('GAZİANTEP', '27', true),
('GİRESUN', '28', true),
('GÜMÜŞHANE', '29', true),
('HAKKARİ', '30', true),
('HATAY', '31', true),
('ISPARTA', '32', true),
('MERSİN', '33', true),
('İSTANBUL', '34', true),
('İZMİR', '35', true),
('KARS', '36', true),
('KASTAMONU', '37', true),
('KAYSERİ', '38', true),
('KIRKLARELİ', '39', true),
('KIRŞEHİR', '40', true),
('KOCAELİ', '41', true),
('KONYA', '42', true),
('KÜTAHYA', '43', true),
('MALATYA', '44', true),
('MANİSA', '45', true),
('KAHRAMANMARAŞ', '46', true),
('MARDİN', '47', true),
('MUĞLA', '48', true),
('MUŞ', '49', true),
('NEVŞEHİR', '50', true),
('NİĞDE', '51', true),
('ORDU', '52', true),
('RİZE', '53', true),
('SAKARYA', '54', true),
('SAMSUN', '55', true),
('SİİRT', '56', true),
('SİNOP', '57', true),
('SİVAS', '58', true),
('TEKİRDAĞ', '59', true),
('TOKAT', '60', true),
('TRABZON', '61', true),
('TUNCELİ', '62', true),
('ŞANLIURFA', '63', true),
('UŞAK', '64', true),
('VAN', '65', true),
('YOZGAT', '66', true),
('ZONGULDAK', '67', true),
('AKSARAY', '68', true),
('BAYBURT', '69', true),
('KARAMAN', '70', true),
('KIRIKKALE', '71', true),
('BATMAN', '72', true),
('ŞIRNAK', '73', true),
('BARTIN', '74', true),
('ARDAHAN', '75', true),
('IĞDIR', '76', true),
('YALOVA', '77', true),
('KARABÜK', '78', true),
('KİLİS', '79', true),
('OSMANİYE', '80', true),
('DÜZCE', '81', true)
on conflict (plate_code) do nothing;

-- ADANA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALADAĞ'),
  ('CEYHAN'),
  ('ÇUKUROVA'),
  ('FEKE'),
  ('İMAMOĞLU'),
  ('KARAİSALI'),
  ('KARATAŞ'),
  ('KOZAN'),
  ('POZANTI'),
  ('SAİMBEYLİ'),
  ('SARIÇAM'),
  ('SEYHAN'),
  ('TUFANBEYLİ'),
  ('YUMURTALIK'),
  ('YÜREĞİR')
) as t(district_name)
where cities.name = 'ADANA'
on conflict (city_id, name) do nothing;

-- ADIYAMAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BESNİ'),
  ('ÇELİKHAN'),
  ('GERGER'),
  ('GÖLBAŞI'),
  ('KAHTA'),
  ('MERKEZ'),
  ('SAMSAT'),
  ('SİNCİK'),
  ('TUT')
) as t(district_name)
where cities.name = 'ADIYAMAN'
on conflict (city_id, name) do nothing;

-- AFYONKARAHİSAR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAŞMAKÇI'),
  ('BAYAT'),
  ('BOLVADİN'),
  ('ÇAY'),
  ('ÇOBANLAR'),
  ('DAZKIRI'),
  ('DİNAR'),
  ('EMİRDAĞ'),
  ('EVCİLER'),
  ('HOCALAR'),
  ('İHSANİYE'),
  ('İSCEHİSAR'),
  ('KIZILÖREN'),
  ('MERKEZ'),
  ('SANDIKLI'),
  ('SİNANPAŞA'),
  ('SULTANDAĞI'),
  ('ŞUHUT')
) as t(district_name)
where cities.name = 'AFYONKARAHİSAR'
on conflict (city_id, name) do nothing;

-- AĞRI İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('DİYADİN'),
  ('DOĞUBAYAZIT'),
  ('ELEŞKİRT'),
  ('HAMUR'),
  ('MERKEZ'),
  ('PATNOS'),
  ('TAŞLIÇAY'),
  ('TUTAK')
) as t(district_name)
where cities.name = 'AĞRI'
on conflict (city_id, name) do nothing;

-- AMASYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('GÖYNÜCEK'),
  ('GÜMÜŞHACIKÖY'),
  ('HAMAMÖZÜ'),
  ('MERKEZ'),
  ('MERZİFON'),
  ('SULUOVA'),
  ('TAŞOVA')
) as t(district_name)
where cities.name = 'AMASYA'
on conflict (city_id, name) do nothing;

-- ANKARA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKYURT'),
  ('ALTINDAĞ'),
  ('AYAŞ'),
  ('BALA'),
  ('BEYPAZARI'),
  ('ÇAMLIDERE'),
  ('ÇANKAYA'),
  ('ÇUBUK'),
  ('ELMADAĞ'),
  ('ETİMESGUT'),
  ('EVREN'),
  ('GÖLBAŞI'),
  ('GÜDÜL'),
  ('HAYMANA'),
  ('KAHRAMANKAZAN'),
  ('KALECİK'),
  ('KEÇİÖREN'),
  ('KIZILCAHAMAM'),
  ('MAMAK'),
  ('NALLIHAN'),
  ('POLATLI'),
  ('PURSAKLAR'),
  ('SİNCAN'),
  ('ŞEREFLİKOÇHİSAR'),
  ('YENİMAHALLE')
) as t(district_name)
where cities.name = 'ANKARA'
on conflict (city_id, name) do nothing;

-- ANTALYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKSEKİ'),
  ('AKSU'),
  ('ALANYA'),
  ('DEMRE'),
  ('DÖŞEMEALTI'),
  ('ELMALI'),
  ('FİNİKE'),
  ('GAZİPAŞA'),
  ('GÜNDOĞMUŞ'),
  ('İBRADI'),
  ('KAŞ'),
  ('KEMER'),
  ('KEPEZ'),
  ('KONYAALTI'),
  ('KORKUTELİ'),
  ('KUMLUCA'),
  ('MANAVGAT'),
  ('MURATPAŞA'),
  ('SERİK')
) as t(district_name)
where cities.name = 'ANTALYA'
on conflict (city_id, name) do nothing;

-- ARTVİN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ARDANUÇ'),
  ('ARHAVİ'),
  ('BORÇKA'),
  ('HOPA'),
  ('KEMALPAŞA'),
  ('MERKEZ'),
  ('MURGUL'),
  ('ŞAVŞAT'),
  ('YUSUFELİ')
) as t(district_name)
where cities.name = 'ARTVİN'
on conflict (city_id, name) do nothing;

-- AYDIN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BOZDOĞAN'),
  ('BUHARKENT'),
  ('ÇİNE'),
  ('DİDİM'),
  ('EFELER'),
  ('GERMENCİK'),
  ('İNCİRLİOVA'),
  ('KARACASU'),
  ('KARPUZLU'),
  ('KOÇARLI'),
  ('KÖŞK'),
  ('KUŞADASI'),
  ('KUYUCAK'),
  ('NAZİLLİ'),
  ('SÖKE'),
  ('SULTANHİSAR'),
  ('YENİPAZAR')
) as t(district_name)
where cities.name = 'AYDIN'
on conflict (city_id, name) do nothing;

-- BALIKESİR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALTIEYLÜL'),
  ('AYVALIK'),
  ('BALYA'),
  ('BANDIRMA'),
  ('BİGADİÇ'),
  ('BURHANİYE'),
  ('DURSUNBEY'),
  ('EDREMİT'),
  ('ERDEK'),
  ('GÖMEÇ'),
  ('GÖNEN'),
  ('HAVRAN'),
  ('İVRİNDİ'),
  ('KARESİ'),
  ('KEPSUT'),
  ('MANYAS'),
  ('MARMARA'),
  ('SAVAŞTEPE'),
  ('SINDIRGI'),
  ('SUSURLUK')
) as t(district_name)
where cities.name = 'BALIKESİR'
on conflict (city_id, name) do nothing;

-- BİLECİK İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BOZÜYÜK'),
  ('GÖLPAZARI'),
  ('İNHİSAR'),
  ('MERKEZ'),
  ('OSMANELİ'),
  ('PAZARYERİ'),
  ('SÖĞÜT'),
  ('YENİPAZAR')
) as t(district_name)
where cities.name = 'BİLECİK'
on conflict (city_id, name) do nothing;

-- BİNGÖL İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ADAKLI'),
  ('GENÇ'),
  ('KARLIOVA'),
  ('KİĞI'),
  ('MERKEZ'),
  ('SOLHAN'),
  ('YAYLADERE'),
  ('YEDİSU')
) as t(district_name)
where cities.name = 'BİNGÖL'
on conflict (city_id, name) do nothing;

-- BİTLİS İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ADİLCEVAZ'),
  ('AHLAT'),
  ('GÜROYMAK'),
  ('HİZAN'),
  ('MERKEZ'),
  ('MUTKİ'),
  ('TATVAN')
) as t(district_name)
where cities.name = 'BİTLİS'
on conflict (city_id, name) do nothing;

-- BOLU İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('DÖRTDİVAN'),
  ('GEREDE'),
  ('GÖYNÜK'),
  ('KIBRISCIK'),
  ('MENGEN'),
  ('MERKEZ'),
  ('MUDURNU'),
  ('SEBEN'),
  ('YENİÇAĞA')
) as t(district_name)
where cities.name = 'BOLU'
on conflict (city_id, name) do nothing;

-- BURDUR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AĞLASUN'),
  ('ALTINYAYLA'),
  ('BUCAK'),
  ('ÇAVDIR'),
  ('ÇELTİKÇİ'),
  ('GÖLHİSAR'),
  ('KARAMANLI'),
  ('KEMER'),
  ('MERKEZ'),
  ('TEFENNİ'),
  ('YEŞİLOVA')
) as t(district_name)
where cities.name = 'BURDUR'
on conflict (city_id, name) do nothing;

-- BURSA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BÜYÜKORHAN'),
  ('GEMLİK'),
  ('GÜRSU'),
  ('HARMANCIK'),
  ('İNEGÖL'),
  ('İZNİK'),
  ('KARACABEY'),
  ('KELES'),
  ('KESTEL'),
  ('MUDANYA'),
  ('MUSTAFAKEMALPAŞA'),
  ('NİLÜFER'),
  ('ORHANELİ'),
  ('ORHANGAZİ'),
  ('OSMANGAZİ'),
  ('YENİŞEHİR'),
  ('YILDIRIM')
) as t(district_name)
where cities.name = 'BURSA'
on conflict (city_id, name) do nothing;

-- ÇANAKKALE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AYVACIK'),
  ('BAYRAMİÇ'),
  ('BİGA'),
  ('BOZCAADA'),
  ('ÇAN'),
  ('ECEABAT'),
  ('EZİNE'),
  ('GELİBOLU'),
  ('GÖKÇEADA'),
  ('LAPSEKİ'),
  ('MERKEZ'),
  ('YENİCE')
) as t(district_name)
where cities.name = 'ÇANAKKALE'
on conflict (city_id, name) do nothing;

-- ÇANKIRI İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ATKARACALAR'),
  ('BAYRAMÖREN'),
  ('ÇERKEŞ'),
  ('ELDİVAN'),
  ('ILGAZ'),
  ('KIZILIRMAK'),
  ('KORGUN'),
  ('KURŞUNLU'),
  ('MERKEZ'),
  ('ORTA'),
  ('ŞABANÖZÜ'),
  ('YAPRAKLI')
) as t(district_name)
where cities.name = 'ÇANKIRI'
on conflict (city_id, name) do nothing;

-- ÇORUM İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALACA'),
  ('BAYAT'),
  ('BOĞAZKALE'),
  ('DODURGA'),
  ('İSKİLİP'),
  ('KARGI'),
  ('LAÇİN'),
  ('MECİTÖZÜ'),
  ('MERKEZ'),
  ('OĞUZLAR'),
  ('ORTAKÖY'),
  ('OSMANCIK'),
  ('SUNGURLU'),
  ('UĞURLUDAĞ')
) as t(district_name)
where cities.name = 'ÇORUM'
on conflict (city_id, name) do nothing;

-- DENİZLİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ACIPAYAM'),
  ('BABADAĞ'),
  ('BAKLAN'),
  ('BEKİLLİ'),
  ('BEYAĞAÇ'),
  ('BOZKURT'),
  ('BULDAN'),
  ('ÇAL'),
  ('ÇAMELİ'),
  ('ÇARDAK'),
  ('ÇİVRİL'),
  ('GÜNEY'),
  ('HONAZ'),
  ('KALE'),
  ('MERKEZEFENDİ'),
  ('PAMUKKALE'),
  ('SARAYKÖY'),
  ('SERİNHİSAR'),
  ('TAVAS')
) as t(district_name)
where cities.name = 'DENİZLİ'
on conflict (city_id, name) do nothing;

-- DİYARBAKIR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAĞLAR'),
  ('BİSMİL'),
  ('ÇERMİK'),
  ('ÇINAR'),
  ('ÇÜNGÜŞ'),
  ('DİCLE'),
  ('EĞİL'),
  ('ERGANİ'),
  ('HANİ'),
  ('HAZRO'),
  ('KAYAPINAR'),
  ('KOCAKÖY'),
  ('KULP'),
  ('LİCE'),
  ('SİLVAN'),
  ('SUR'),
  ('YENİŞEHİR')
) as t(district_name)
where cities.name = 'DİYARBAKIR'
on conflict (city_id, name) do nothing;

-- EDİRNE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ENEZ'),
  ('HAVSA'),
  ('İPSALA'),
  ('KEŞAN'),
  ('LALAPAŞA'),
  ('MERİÇ'),
  ('MERKEZ'),
  ('SÜLOĞLU'),
  ('UZUNKÖPRÜ')
) as t(district_name)
where cities.name = 'EDİRNE'
on conflict (city_id, name) do nothing;

-- ELAZIĞ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AĞIN'),
  ('ALACAKAYA'),
  ('ARICAK'),
  ('BASKİL'),
  ('KARAKOÇAN'),
  ('KEBAN'),
  ('KOVANCILAR'),
  ('MADEN'),
  ('MERKEZ'),
  ('PALU'),
  ('SİVRİCE')
) as t(district_name)
where cities.name = 'ELAZIĞ'
on conflict (city_id, name) do nothing;

-- ERZİNCAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ÇAYIRLI'),
  ('İLİÇ'),
  ('KEMAH'),
  ('KEMALİYE'),
  ('MERKEZ'),
  ('OTLUKBELİ'),
  ('REFAHİYE'),
  ('TERCAN'),
  ('ÜZÜMLÜ')
) as t(district_name)
where cities.name = 'ERZİNCAN'
on conflict (city_id, name) do nothing;

-- ERZURUM İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AŞKALE'),
  ('AZİZİYE'),
  ('ÇAT'),
  ('HINIS'),
  ('HORASAN'),
  ('İSPİR'),
  ('KARAÇOBAN'),
  ('KARAYAZI'),
  ('KÖPRÜKÖY'),
  ('NARMAN'),
  ('OLTU'),
  ('OLUR'),
  ('PALANDÖKEN'),
  ('PASİNLER'),
  ('PAZARYOLU'),
  ('ŞENKAYA'),
  ('TEKMAN'),
  ('TORTUM'),
  ('UZUNDERE'),
  ('YAKUTİYE')
) as t(district_name)
where cities.name = 'ERZURUM'
on conflict (city_id, name) do nothing;

-- ESKİŞEHİR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALPU'),
  ('BEYLİKOVA'),
  ('ÇİFTELER'),
  ('GÜNYÜZÜ'),
  ('HAN'),
  ('İNÖNÜ'),
  ('MAHMUDİYE'),
  ('MİHALGAZİ'),
  ('MİHALIÇÇIK'),
  ('ODUNPAZARI'),
  ('SARICAKAYA'),
  ('SEYİTGAZİ'),
  ('SİVRİHİSAR'),
  ('TEPEBAŞI')
) as t(district_name)
where cities.name = 'ESKİŞEHİR'
on conflict (city_id, name) do nothing;

-- GAZİANTEP İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ARABAN'),
  ('İSLAHİYE'),
  ('KARKAMIŞ'),
  ('NİZİP'),
  ('NURDAĞI'),
  ('OĞUZELİ'),
  ('ŞAHİNBEY'),
  ('ŞEHİTKAMİL'),
  ('YAVUZELİ')
) as t(district_name)
where cities.name = 'GAZİANTEP'
on conflict (city_id, name) do nothing;

-- GİRESUN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALUCRA'),
  ('BULANCAK'),
  ('ÇAMOLUK'),
  ('ÇANAKÇI'),
  ('DERELİ'),
  ('DOĞANKENT'),
  ('ESPİYE'),
  ('EYNESİL'),
  ('GÖRELE'),
  ('GÜCE'),
  ('KEŞAP'),
  ('MERKEZ'),
  ('PİRAZİZ'),
  ('ŞEBİNKARAHİSAR'),
  ('TİREBOLU'),
  ('YAĞLIDERE')
) as t(district_name)
where cities.name = 'GİRESUN'
on conflict (city_id, name) do nothing;

-- GÜMÜŞHANE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('KELKİT'),
  ('KÖSE'),
  ('KÜRTÜN'),
  ('MERKEZ'),
  ('ŞİRAN'),
  ('TORUL')
) as t(district_name)
where cities.name = 'GÜMÜŞHANE'
on conflict (city_id, name) do nothing;

-- HAKKARİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ÇUKURCA'),
  ('DERECİK'),
  ('MERKEZ'),
  ('ŞEMDİNLİ'),
  ('YÜKSEKOVA')
) as t(district_name)
where cities.name = 'HAKKARİ'
on conflict (city_id, name) do nothing;

-- HATAY İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALTINÖZÜ'),
  ('ANTAKYA'),
  ('ARSUZ'),
  ('BELEN'),
  ('DEFNE'),
  ('DÖRTYOL'),
  ('ERZİN'),
  ('HASSA'),
  ('İSKENDERUN'),
  ('KIRIKHAN'),
  ('KUMLU'),
  ('PAYAS'),
  ('REYHANLI'),
  ('SAMANDAĞ'),
  ('YAYLADAĞI')
) as t(district_name)
where cities.name = 'HATAY'
on conflict (city_id, name) do nothing;

-- ISPARTA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKSU'),
  ('ATABEY'),
  ('EĞİRDİR'),
  ('GELENDOST'),
  ('GÖNEN'),
  ('KEÇİBORLU'),
  ('MERKEZ'),
  ('SENİRKENT'),
  ('SÜTÇÜLER'),
  ('ŞARKİKARAAĞAÇ'),
  ('ULUBORLU'),
  ('YALVAÇ'),
  ('YENİŞARBADEMLİ')
) as t(district_name)
where cities.name = 'ISPARTA'
on conflict (city_id, name) do nothing;

-- MERSİN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKDENİZ'),
  ('ANAMUR'),
  ('AYDINCIK'),
  ('BOZYAZI'),
  ('ÇAMLIYAYLA'),
  ('ERDEMLİ'),
  ('GÜLNAR'),
  ('MEZİTLİ'),
  ('MUT'),
  ('SİLİFKE'),
  ('TARSUS'),
  ('TOROSLAR'),
  ('YENİŞEHİR')
) as t(district_name)
where cities.name = 'MERSİN'
on conflict (city_id, name) do nothing;

-- İSTANBUL İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ADALAR'),
  ('ARNAVUTKÖY'),
  ('ATAŞEHİR'),
  ('AVCILAR'),
  ('BAĞCILAR'),
  ('BAHÇELİEVLER'),
  ('BAKIRKÖY'),
  ('BAŞAKŞEHİR'),
  ('BAYRAMPAŞA'),
  ('BEŞİKTAŞ'),
  ('BEYKOZ'),
  ('BEYLİKDÜZÜ'),
  ('BEYOĞLU'),
  ('BÜYÜKÇEKMECE'),
  ('ÇATALCA'),
  ('ÇEKMEKÖY'),
  ('ESENLER'),
  ('ESENYURT'),
  ('EYÜPSULTAN'),
  ('FATİH'),
  ('GAZİOSMANPAŞA'),
  ('GÜNGÖREN'),
  ('KADIKÖY'),
  ('KAĞITHANE'),
  ('KARTAL'),
  ('KÜÇÜKÇEKMECE'),
  ('MALTEPE'),
  ('PENDİK'),
  ('SANCAKTEPE'),
  ('SARIYER'),
  ('SİLİVRİ'),
  ('SULTANBEYLİ'),
  ('SULTANGAZİ'),
  ('ŞİLE'),
  ('ŞİŞLİ'),
  ('TUZLA'),
  ('ÜMRANİYE'),
  ('ÜSKÜDAR'),
  ('ZEYTİNBURNU')
) as t(district_name)
where cities.name = 'İSTANBUL'
on conflict (city_id, name) do nothing;

-- İZMİR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALİAĞA'),
  ('BALÇOVA'),
  ('BAYINDIR'),
  ('BAYRAKLI'),
  ('BERGAMA'),
  ('BEYDAĞ'),
  ('BORNOVA'),
  ('BUCA'),
  ('ÇEŞME'),
  ('ÇİĞLİ'),
  ('DİKİLİ'),
  ('FOÇA'),
  ('GAZİEMİR'),
  ('GÜZELBAHÇE'),
  ('KARABAĞLAR'),
  ('KARABURUN'),
  ('KARŞIYAKA'),
  ('KEMALPAŞA'),
  ('KINIK'),
  ('KİRAZ'),
  ('KONAK'),
  ('MENDERES'),
  ('MENEMEN'),
  ('NARLIDERE'),
  ('ÖDEMİŞ'),
  ('SEFERİHİSAR'),
  ('SELÇUK'),
  ('TİRE'),
  ('TORBALI'),
  ('URLA')
) as t(district_name)
where cities.name = 'İZMİR'
on conflict (city_id, name) do nothing;

-- KARS İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKYAKA'),
  ('ARPAÇAY'),
  ('DİGOR'),
  ('KAĞIZMAN'),
  ('MERKEZ'),
  ('SARIKAMIŞ'),
  ('SELİM'),
  ('SUSUZ')
) as t(district_name)
where cities.name = 'KARS'
on conflict (city_id, name) do nothing;

-- KASTAMONU İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ABANA'),
  ('AĞLI'),
  ('ARAÇ'),
  ('AZDAVAY'),
  ('BOZKURT'),
  ('CİDE'),
  ('ÇATALZEYTİN'),
  ('DADAY'),
  ('DEVREKANİ'),
  ('DOĞANYURT'),
  ('HANÖNÜ'),
  ('İHSANGAZİ'),
  ('İNEBOLU'),
  ('KÜRE'),
  ('MERKEZ'),
  ('PINARBAŞI'),
  ('SEYDİLER'),
  ('ŞENPAZAR'),
  ('TAŞKÖPRÜ'),
  ('TOSYA')
) as t(district_name)
where cities.name = 'KASTAMONU'
on conflict (city_id, name) do nothing;

-- KAYSERİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKKIŞLA'),
  ('BÜNYAN'),
  ('DEVELİ'),
  ('FELAHİYE'),
  ('HACILAR'),
  ('İNCESU'),
  ('KOCASİNAN'),
  ('MELİKGAZİ'),
  ('ÖZVATAN'),
  ('PINARBAŞI'),
  ('SARIOĞLAN'),
  ('SARIZ'),
  ('TALAS'),
  ('TOMARZA'),
  ('YAHYALI'),
  ('YEŞİLHİSAR')
) as t(district_name)
where cities.name = 'KAYSERİ'
on conflict (city_id, name) do nothing;

-- KIRKLARELİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BABAESKİ'),
  ('DEMİRKÖY'),
  ('KOFÇAZ'),
  ('LÜLEBURGAZ'),
  ('MERKEZ'),
  ('PEHLİVANKÖY'),
  ('PINARHİSAR'),
  ('VİZE')
) as t(district_name)
where cities.name = 'KIRKLARELİ'
on conflict (city_id, name) do nothing;

-- KIRŞEHİR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKÇAKENT'),
  ('AKPINAR'),
  ('BOZTEPE'),
  ('ÇİÇEKDAĞI'),
  ('KAMAN'),
  ('MERKEZ'),
  ('MUCUR')
) as t(district_name)
where cities.name = 'KIRŞEHİR'
on conflict (city_id, name) do nothing;

-- KOCAELİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAŞİSKELE'),
  ('ÇAYIROVA'),
  ('DARICA'),
  ('DERİNCE'),
  ('DİLOVASI'),
  ('GEBZE'),
  ('GÖLCÜK'),
  ('İZMİT'),
  ('KANDIRA'),
  ('KARAMÜRSEL'),
  ('KARTEPE'),
  ('KÖRFEZ')
) as t(district_name)
where cities.name = 'KOCAELİ'
on conflict (city_id, name) do nothing;

-- KONYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AHIRLI'),
  ('AKÖREN'),
  ('AKŞEHİR'),
  ('ALTINEKİN'),
  ('BEYŞEHİR'),
  ('BOZKIR'),
  ('CİHANBEYLİ'),
  ('ÇELTİK'),
  ('ÇUMRA'),
  ('DERBENT'),
  ('DEREBUCAK'),
  ('DOĞANHİSAR'),
  ('EMİRGAZİ'),
  ('EREĞLİ'),
  ('GÜNEYSINIR'),
  ('HADİM'),
  ('HALKAPINAR'),
  ('HÜYÜK'),
  ('ILGIN'),
  ('KADINHANI'),
  ('KARAPINAR'),
  ('KARATAY'),
  ('KULU'),
  ('MERAM'),
  ('SARAYÖNÜ'),
  ('SELÇUKLU'),
  ('SEYDİŞEHİR'),
  ('TAŞKENT'),
  ('TUZLUKÇU'),
  ('YALIHÜYÜK'),
  ('YUNAK')
) as t(district_name)
where cities.name = 'KONYA'
on conflict (city_id, name) do nothing;

-- KÜTAHYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALTINTAŞ'),
  ('ASLANAPA'),
  ('ÇAVDARHİSAR'),
  ('DOMANİÇ'),
  ('DUMLUPINAR'),
  ('EMET'),
  ('GEDİZ'),
  ('HİSARCIK'),
  ('MERKEZ'),
  ('PAZARLAR'),
  ('SİMAV'),
  ('ŞAPHANE'),
  ('TAVŞANLI')
) as t(district_name)
where cities.name = 'KÜTAHYA'
on conflict (city_id, name) do nothing;

-- MALATYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKÇADAĞ'),
  ('ARAPGİR'),
  ('ARGUVAN'),
  ('BATTALGAZİ'),
  ('DARENDE'),
  ('DOĞANŞEHİR'),
  ('DOĞANYOL'),
  ('HEKİMHAN'),
  ('KALE'),
  ('KULUNCAK'),
  ('PÜTÜRGE'),
  ('YAZIHAN'),
  ('YEŞİLYURT')
) as t(district_name)
where cities.name = 'MALATYA'
on conflict (city_id, name) do nothing;

-- MANİSA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AHMETLİ'),
  ('AKHİSAR'),
  ('ALAŞEHİR'),
  ('DEMİRCİ'),
  ('GÖLMARMARA'),
  ('GÖRDES'),
  ('KIRKAĞAÇ'),
  ('KÖPRÜBAŞI'),
  ('KULA'),
  ('SALİHLİ'),
  ('SARIGÖL'),
  ('SARUHANLI'),
  ('SELENDİ'),
  ('SOMA'),
  ('ŞEHZADELER'),
  ('TURGUTLU'),
  ('YUNUSEMRE')
) as t(district_name)
where cities.name = 'MANİSA'
on conflict (city_id, name) do nothing;

-- KAHRAMANMARAŞ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AFŞİN'),
  ('ANDIRIN'),
  ('ÇAĞLAYANCERİT'),
  ('DULKADİROĞLU'),
  ('EKİNÖZÜ'),
  ('ELBİSTAN'),
  ('GÖKSUN'),
  ('NURHAK'),
  ('ONİKİŞUBAT'),
  ('PAZARCIK'),
  ('TÜRKOĞLU')
) as t(district_name)
where cities.name = 'KAHRAMANMARAŞ'
on conflict (city_id, name) do nothing;

-- MARDİN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ARTUKLU'),
  ('DARGEÇİT'),
  ('DERİK'),
  ('KIZILTEPE'),
  ('MAZIDAĞI'),
  ('MİDYAT'),
  ('NUSAYBİN'),
  ('ÖMERLİ'),
  ('SAVUR'),
  ('YEŞİLLİ')
) as t(district_name)
where cities.name = 'MARDİN'
on conflict (city_id, name) do nothing;

-- MUĞLA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BODRUM'),
  ('DALAMAN'),
  ('DATÇA'),
  ('FETHİYE'),
  ('KAVAKLIDERE'),
  ('KÖYCEĞİZ'),
  ('MARMARİS'),
  ('MENTEŞE'),
  ('MİLAS'),
  ('ORTACA'),
  ('SEYDİKEMER'),
  ('ULA'),
  ('YATAĞAN')
) as t(district_name)
where cities.name = 'MUĞLA'
on conflict (city_id, name) do nothing;

-- MUŞ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BULANIK'),
  ('HASKÖY'),
  ('KORKUT'),
  ('MALAZGİRT'),
  ('MERKEZ'),
  ('VARTO')
) as t(district_name)
where cities.name = 'MUŞ'
on conflict (city_id, name) do nothing;

-- NEVŞEHİR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ACIGÖL'),
  ('AVANOS'),
  ('DERİNKUYU'),
  ('GÜLŞEHİR'),
  ('HACIBEKTAŞ'),
  ('KOZAKLI'),
  ('MERKEZ'),
  ('ÜRGÜP')
) as t(district_name)
where cities.name = 'NEVŞEHİR'
on conflict (city_id, name) do nothing;

-- NİĞDE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALTUNHİSAR'),
  ('BOR'),
  ('ÇAMARDI'),
  ('ÇİFTLİK'),
  ('MERKEZ'),
  ('ULUKIŞLA')
) as t(district_name)
where cities.name = 'NİĞDE'
on conflict (city_id, name) do nothing;

-- ORDU İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKKUŞ'),
  ('ALTINORDU'),
  ('AYBASTI'),
  ('ÇAMAŞ'),
  ('ÇATALPINAR'),
  ('ÇAYBAŞI'),
  ('FATSA'),
  ('GÖLKÖY'),
  ('GÜLYALI'),
  ('GÜRGENTEPE'),
  ('İKİZCE'),
  ('KABADÜZ'),
  ('KABATAŞ'),
  ('KORGAN'),
  ('KUMRU'),
  ('MESUDİYE'),
  ('PERŞEMBE'),
  ('ULUBEY'),
  ('ÜNYE')
) as t(district_name)
where cities.name = 'ORDU'
on conflict (city_id, name) do nothing;

-- RİZE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ARDEŞEN'),
  ('ÇAMLIHEMŞİN'),
  ('ÇAYELİ'),
  ('DEREPAZARI'),
  ('FINDIKLI'),
  ('GÜNEYSU'),
  ('HEMŞİN'),
  ('İKİZDERE'),
  ('İYİDERE'),
  ('KALKANDERE'),
  ('MERKEZ'),
  ('PAZAR')
) as t(district_name)
where cities.name = 'RİZE'
on conflict (city_id, name) do nothing;

-- SAKARYA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ADAPAZARI'),
  ('AKYAZI'),
  ('ARİFİYE'),
  ('ERENLER'),
  ('FERİZLİ'),
  ('GEYVE'),
  ('HENDEK'),
  ('KARAPÜRÇEK'),
  ('KARASU'),
  ('KAYNARCA'),
  ('KOCAALİ'),
  ('PAMUKOVA'),
  ('SAPANCA'),
  ('SERDİVAN'),
  ('SÖĞÜTLÜ'),
  ('TARAKLI')
) as t(district_name)
where cities.name = 'SAKARYA'
on conflict (city_id, name) do nothing;

-- SAMSUN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('19 MAYIS'),
  ('ALAÇAM'),
  ('ASARCIK'),
  ('ATAKUM'),
  ('AYVACIK'),
  ('BAFRA'),
  ('CANİK'),
  ('ÇARŞAMBA'),
  ('HAVZA'),
  ('İLKADIM'),
  ('KAVAK'),
  ('LADİK'),
  ('SALIPAZARI'),
  ('TEKKEKÖY'),
  ('TERME'),
  ('VEZİRKÖPRÜ'),
  ('YAKAKENT')
) as t(district_name)
where cities.name = 'SAMSUN'
on conflict (city_id, name) do nothing;

-- SİİRT İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAYKAN'),
  ('ERUH'),
  ('KURTALAN'),
  ('MERKEZ'),
  ('PERVARİ'),
  ('ŞİRVAN'),
  ('TİLLO')
) as t(district_name)
where cities.name = 'SİİRT'
on conflict (city_id, name) do nothing;

-- SİNOP İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AYANCIK'),
  ('BOYABAT'),
  ('DİKMEN'),
  ('DURAĞAN'),
  ('ERFELEK'),
  ('GERZE'),
  ('MERKEZ'),
  ('SARAYDÜZÜ'),
  ('TÜRKELİ')
) as t(district_name)
where cities.name = 'SİNOP'
on conflict (city_id, name) do nothing;

-- SİVAS İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKINCILAR'),
  ('ALTINYAYLA'),
  ('DİVRİĞİ'),
  ('DOĞANŞAR'),
  ('GEMEREK'),
  ('GÖLOVA'),
  ('GÜRÜN'),
  ('HAFİK'),
  ('İMRANLI'),
  ('KANGAL'),
  ('KOYULHİSAR'),
  ('MERKEZ'),
  ('SUŞEHRİ'),
  ('ŞARKIŞLA'),
  ('ULAŞ'),
  ('YILDIZELİ'),
  ('ZARA')
) as t(district_name)
where cities.name = 'SİVAS'
on conflict (city_id, name) do nothing;

-- TEKİRDAĞ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ÇERKEZKÖY'),
  ('ÇORLU'),
  ('ERGENE'),
  ('HAYRABOLU'),
  ('KAPAKLI'),
  ('MALKARA'),
  ('MARMARAEREĞLİSİ'),
  ('MURATLI'),
  ('SARAY'),
  ('SÜLEYMANPAŞA'),
  ('ŞARKÖY')
) as t(district_name)
where cities.name = 'TEKİRDAĞ'
on conflict (city_id, name) do nothing;

-- TOKAT İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALMUS'),
  ('ARTOVA'),
  ('BAŞÇİFTLİK'),
  ('ERBAA'),
  ('MERKEZ'),
  ('NİKSAR'),
  ('PAZAR'),
  ('REŞADİYE'),
  ('SULUSARAY'),
  ('TURHAL'),
  ('YEŞİLYURT'),
  ('ZİLE')
) as t(district_name)
where cities.name = 'TOKAT'
on conflict (city_id, name) do nothing;

-- TRABZON İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKÇAABAT'),
  ('ARAKLI'),
  ('ARSİN'),
  ('BEŞİKDÜZÜ'),
  ('ÇARŞIBAŞI'),
  ('ÇAYKARA'),
  ('DERNEKPAZARI'),
  ('DÜZKÖY'),
  ('HAYRAT'),
  ('KÖPRÜBAŞI'),
  ('MAÇKA'),
  ('OF'),
  ('ORTAHİSAR'),
  ('SÜRMENE'),
  ('ŞALPAZARI'),
  ('TONYA'),
  ('VAKFIKEBİR'),
  ('YOMRA')
) as t(district_name)
where cities.name = 'TRABZON'
on conflict (city_id, name) do nothing;

-- TUNCELİ İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ÇEMİŞGEZEK'),
  ('HOZAT'),
  ('MAZGİRT'),
  ('MERKEZ'),
  ('NAZIMİYE'),
  ('OVACIK'),
  ('PERTEK'),
  ('PÜLÜMÜR')
) as t(district_name)
where cities.name = 'TUNCELİ'
on conflict (city_id, name) do nothing;

-- ŞANLIURFA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKÇAKALE'),
  ('BİRECİK'),
  ('BOZOVA'),
  ('CEYLANPINAR'),
  ('EYYÜBİYE'),
  ('HALFETİ'),
  ('HALİLİYE'),
  ('HARRAN'),
  ('HİLVAN'),
  ('KARAKÖPRÜ'),
  ('SİVEREK'),
  ('SURUÇ'),
  ('VİRANŞEHİR')
) as t(district_name)
where cities.name = 'ŞANLIURFA'
on conflict (city_id, name) do nothing;

-- UŞAK İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BANAZ'),
  ('EŞME'),
  ('KARAHALLI'),
  ('MERKEZ'),
  ('SİVASLI'),
  ('ULUBEY')
) as t(district_name)
where cities.name = 'UŞAK'
on conflict (city_id, name) do nothing;

-- VAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAHÇESARAY'),
  ('BAŞKALE'),
  ('ÇALDIRAN'),
  ('ÇATAK'),
  ('EDREMİT'),
  ('ERCİŞ'),
  ('GEVAŞ'),
  ('GÜRPINAR'),
  ('İPEKYOLU'),
  ('MURADİYE'),
  ('ÖZALP'),
  ('SARAY'),
  ('TUŞBA')
) as t(district_name)
where cities.name = 'VAN'
on conflict (city_id, name) do nothing;

-- YOZGAT İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKDAĞMADENİ'),
  ('AYDINCIK'),
  ('BOĞAZLIYAN'),
  ('ÇANDIR'),
  ('ÇAYIRALAN'),
  ('ÇEKEREK'),
  ('KADIŞEHRİ'),
  ('MERKEZ'),
  ('SARAYKENT'),
  ('SARIKAYA'),
  ('SORGUN'),
  ('ŞEFAATLİ'),
  ('YENİFAKILI'),
  ('YERKÖY')
) as t(district_name)
where cities.name = 'YOZGAT'
on conflict (city_id, name) do nothing;

-- ZONGULDAK İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALAPLI'),
  ('ÇAYCUMA'),
  ('DEVREK'),
  ('EREĞLİ'),
  ('GÖKÇEBEY'),
  ('KİLİMLİ'),
  ('KOZLU'),
  ('MERKEZ')
) as t(district_name)
where cities.name = 'ZONGULDAK'
on conflict (city_id, name) do nothing;

-- AKSARAY İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AĞAÇÖREN'),
  ('ESKİL'),
  ('GÜLAĞAÇ'),
  ('GÜZELYURT'),
  ('MERKEZ'),
  ('ORTAKÖY'),
  ('SARIYAHŞİ'),
  ('SULTANHANI')
) as t(district_name)
where cities.name = 'AKSARAY'
on conflict (city_id, name) do nothing;

-- BAYBURT İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AYDINTEPE'),
  ('DEMİRÖZÜ'),
  ('MERKEZ')
) as t(district_name)
where cities.name = 'BAYBURT'
on conflict (city_id, name) do nothing;

-- KARAMAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AYRANCI'),
  ('BAŞYAYLA'),
  ('ERMENEK'),
  ('KAZIMKARABEKİR'),
  ('MERKEZ'),
  ('SARIVELİLER')
) as t(district_name)
where cities.name = 'KARAMAN'
on conflict (city_id, name) do nothing;

-- KIRIKKALE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAHŞİLİ'),
  ('BALIŞEYH'),
  ('ÇELEBİ'),
  ('DELİCE'),
  ('KARAKEÇİLİ'),
  ('KESKİN'),
  ('MERKEZ'),
  ('SULAKYURT'),
  ('YAHŞİHAN')
) as t(district_name)
where cities.name = 'KIRIKKALE'
on conflict (city_id, name) do nothing;

-- BATMAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BEŞİRİ'),
  ('GERCÜŞ'),
  ('HASANKEYF'),
  ('KOZLUK'),
  ('MERKEZ'),
  ('SASON')
) as t(district_name)
where cities.name = 'BATMAN'
on conflict (city_id, name) do nothing;

-- ŞIRNAK İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BEYTÜŞŞEBAP'),
  ('CİZRE'),
  ('GÜÇLÜKONAK'),
  ('İDİL'),
  ('MERKEZ'),
  ('SİLOPİ'),
  ('ULUDERE')
) as t(district_name)
where cities.name = 'ŞIRNAK'
on conflict (city_id, name) do nothing;

-- BARTIN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AMASRA'),
  ('KURUCAŞİLE'),
  ('MERKEZ'),
  ('ULUS')
) as t(district_name)
where cities.name = 'BARTIN'
on conflict (city_id, name) do nothing;

-- ARDAHAN İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ÇILDIR'),
  ('DAMAL'),
  ('GÖLE'),
  ('HANAK'),
  ('MERKEZ'),
  ('POSOF')
) as t(district_name)
where cities.name = 'ARDAHAN'
on conflict (city_id, name) do nothing;

-- IĞDIR İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ARALIK'),
  ('KARAKOYUNLU'),
  ('MERKEZ'),
  ('TUZLUCA')
) as t(district_name)
where cities.name = 'IĞDIR'
on conflict (city_id, name) do nothing;

-- YALOVA İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ALTINOVA'),
  ('ARMUTLU'),
  ('ÇINARCIK'),
  ('ÇİFTLİKKÖY'),
  ('MERKEZ'),
  ('TERMAL')
) as t(district_name)
where cities.name = 'YALOVA'
on conflict (city_id, name) do nothing;

-- KARABÜK İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('EFLANİ'),
  ('ESKİPAZAR'),
  ('MERKEZ'),
  ('OVACIK'),
  ('SAFRANBOLU'),
  ('YENİCE')
) as t(district_name)
where cities.name = 'KARABÜK'
on conflict (city_id, name) do nothing;

-- KİLİS İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('ELBEYLİ'),
  ('MERKEZ'),
  ('MUSABEYLİ'),
  ('POLATELİ')
) as t(district_name)
where cities.name = 'KİLİS'
on conflict (city_id, name) do nothing;

-- OSMANİYE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('BAHÇE'),
  ('DÜZİÇİ'),
  ('HASANBEYLİ'),
  ('KADİRLİ'),
  ('MERKEZ'),
  ('SUMBAS'),
  ('TOPRAKKALE')
) as t(district_name)
where cities.name = 'OSMANİYE'
on conflict (city_id, name) do nothing;

-- DÜZCE İlçeleri
insert into districts (city_id, name, is_active)
select id, district_name, true
from cities, (values 
  ('AKÇAKOCA'),
  ('CUMAYERİ'),
  ('ÇİLİMLİ'),
  ('GÖLYAKA'),
  ('GÜMÜŞOVA'),
  ('KAYNAŞLI'),
  ('MERKEZ'),
  ('YIĞILCA')
) as t(district_name)
where cities.name = 'DÜZCE'
on conflict (city_id, name) do nothing;
