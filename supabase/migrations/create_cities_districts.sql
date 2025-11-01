-- İller tablosu
create table if not exists iller (
  id serial primary key,
  il_adi text not null unique,
  created_at timestamptz default now()
);

-- İlçeler tablosu
create table if not exists ilceler (
  id serial primary key,
  ilce_adi text not null,
  il_id integer not null references iller(id) on delete cascade,
  created_at timestamptz default now(),
  unique(ilce_adi, il_id)
);

-- Index'ler
create index if not exists ilceler_il_id_idx on ilceler(il_id);
create index if not exists iller_il_adi_idx on iller(il_adi);
create index if not exists ilceler_ilce_adi_idx on ilceler(ilce_adi);

-- RLS etkinleştir
alter table iller enable row level security;
alter table ilceler enable row level security;

-- Mevcut politikaları sil (varsa)
drop policy if exists iller_read on iller;
drop policy if exists ilceler_read on ilceler;

-- Herkes okuyabilir politikaları
create policy iller_read on iller for select using (true);
create policy ilceler_read on ilceler for select using (true);

-- Türkiye'nin tüm illeri (BÜYÜK HARF)
insert into iller (il_adi) values
('ADANA'), ('ADIYAMAN'), ('AFYONKARAHİSAR'), ('AĞRI'), ('AMASYA'),
('ANKARA'), ('ANTALYA'), ('ARTVİN'), ('AYDIN'), ('BALIKESİR'),
('BİLECİK'), ('BİNGÖL'), ('BİTLİS'), ('BOLU'), ('BURDUR'),
('BURSA'), ('ÇANAKKALE'), ('ÇANKIRI'), ('ÇORUM'), ('DENİZLİ'),
('DİYARBAKIR'), ('EDİRNE'), ('ELAZIĞ'), ('ERZİNCAN'), ('ERZURUM'),
('ESKİŞEHİR'), ('GAZİANTEP'), ('GİRESUN'), ('GÜMÜŞHANE'), ('HAKKARİ'),
('HATAY'), ('ISPARTA'), ('MERSİN'), ('İSTANBUL'), ('İZMİR'),
('KARS'), ('KASTAMONU'), ('KAYSERİ'), ('KIRKLARELİ'), ('KIRŞEHİR'),
('KOCAELİ'), ('KONYA'), ('KÜTAHYA'), ('MALATYA'), ('MANİSA'),
('KAHRAMANMARAŞ'), ('MARDİN'), ('MUĞLA'), ('MUŞ'), ('NEVŞEHİR'),
('NİĞDE'), ('ORDU'), ('RİZE'), ('SAKARYA'), ('SAMSUN'),
('SİİRT'), ('SİNOP'), ('SİVAS'), ('TEKİRDAĞ'), ('TOKAT'),
('TRABZON'), ('TUNCELİ'), ('ŞANLIURFA'), ('UŞAK'), ('VAN'),
('YOZGAT'), ('ZONGULDAK'), ('AKSARAY'), ('BAYBURT'), ('KARAMAN'),
('KIRIKKALE'), ('BATMAN'), ('ŞIRNAK'), ('BARTIN'), ('ARDAHAN'),
('IĞDIR'), ('YALOVA'), ('KARABÜK'), ('KİLİS'), ('OSMANİYE'),
('DÜZCE')
on conflict (il_adi) do nothing;

-- ADANA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALADAĞ'), ('CEYHAN'), ('ÇUKUROVA'), ('FEKE'), ('İMAMOĞLU'),
  ('KARAİSALI'), ('KARATAŞ'), ('KOZAN'), ('POZANTI'), ('SAİMBEYLİ'),
  ('SARIÇAM'), ('SEYHAN'), ('TUFANBEYLİ'), ('YUMURTALIK'), ('YÜREĞİR')
) as t(ilce) where il_adi = 'ADANA'
on conflict (ilce_adi, il_id) do nothing;

-- ADIYAMAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BESNİ'), ('ÇELİKHAN'), ('GERGER'), ('GÖLBAŞI'), ('KAHTA'),
  ('MERKEZ'), ('SAMSAT'), ('SİNCİK'), ('TUT')
) as t(ilce) where il_adi = 'ADIYAMAN'
on conflict (ilce_adi, il_id) do nothing;

-- AFYONKARAHİSAR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAŞMAKÇI'), ('BAYAT'), ('BOLVADİN'), ('ÇAY'), ('ÇOBANLAR'),
  ('DAZKIRI'), ('DİNAR'), ('EMİRDAĞ'), ('EVCİLER'), ('HOCALAR'),
  ('İHSANİYE'), ('İSCEHİSAR'), ('KIZILÖREN'), ('MERKEZ'), ('SANDIKLI'),
  ('SİNANPAŞA'), ('SULTANDAĞI'), ('ŞUHUT')
) as t(ilce) where il_adi = 'AFYONKARAHİSAR'
on conflict (ilce_adi, il_id) do nothing;

-- AĞRI İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('DİYADİN'), ('DOĞUBAYAZIT'), ('ELEŞKİRT'), ('HAMUR'), ('MERKEZ'),
  ('PATNOS'), ('TAŞLIÇAY'), ('TUTAK')
) as t(ilce) where il_adi = 'AĞRI'
on conflict (ilce_adi, il_id) do nothing;

-- AMASYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('GÖYNÜCEK'), ('GÜMÜŞHACIKÖY'), ('HAMAMÖZÜ'), ('MERKEZ'), ('MERZİFON'),
  ('SULUOVA'), ('TAŞOVA')
) as t(ilce) where il_adi = 'AMASYA'
on conflict (ilce_adi, il_id) do nothing;

-- ANKARA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKYURT'), ('ALTINDAĞ'), ('AYAŞ'), ('BALA'), ('BEYPAZARI'),
  ('ÇAMLIDERE'), ('ÇANKAYA'), ('ÇUBUK'), ('ELMADAĞ'), ('ETİMESGUT'),
  ('EVREN'), ('GÖLBAŞI'), ('GÜDÜL'), ('HAYMANA'), ('KAHRAMANKAZAN'),
  ('KALECİK'), ('KEÇİÖREN'), ('KIZILCAHAMAM'), ('MAMAK'), ('NALLIHAN'),
  ('POLATLI'), ('PURSAKLAR'), ('SİNCAN'), ('ŞEREFLİKOÇHİSAR'), ('YENİMAHALLE')
) as t(ilce) where il_adi = 'ANKARA'
on conflict (ilce_adi, il_id) do nothing;

-- ANTALYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKSEKİ'), ('AKSU'), ('ALANYA'), ('DEMRE'), ('DÖŞEMEALTI'),
  ('ELMALI'), ('FİNİKE'), ('GAZİPAŞA'), ('GÜNDOĞMUŞ'), ('İBRADI'),
  ('KAŞ'), ('KEMER'), ('KEPEZ'), ('KONYAALTI'), ('KORKUTELİ'),
  ('KUMLUCA'), ('MANAVGAT'), ('MURATPAŞA'), ('SERİK')
) as t(ilce) where il_adi = 'ANTALYA'
on conflict (ilce_adi, il_id) do nothing;

-- ARTVİN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ARDANUÇ'), ('ARHAVİ'), ('BORÇKA'), ('HOPA'), ('KEMALPAŞA'),
  ('MERKEZ'), ('MURGUL'), ('ŞAVŞAT'), ('YUSUFELİ')
) as t(ilce) where il_adi = 'ARTVİN'
on conflict (ilce_adi, il_id) do nothing;

-- AYDIN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BOZDOĞAN'), ('BUHARKENT'), ('ÇİNE'), ('DİDİM'), ('EFELER'),
  ('GERMENCİK'), ('İNCİRLİOVA'), ('KARACASU'), ('KARPUZLU'), ('KOÇARLI'),
  ('KÖŞK'), ('KUŞADASI'), ('KUYUCAK'), ('NAZİLLİ'), ('SÖKE'),
  ('SULTANHİSAR'), ('YENİPAZAR')
) as t(ilce) where il_adi = 'AYDIN'
on conflict (ilce_adi, il_id) do nothing;

-- BALIKESİR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALTIEYLÜL'), ('AYVALIK'), ('BALYA'), ('BANDIRMA'), ('BİGADİÇ'),
  ('BURHANİYE'), ('DURSUNBEY'), ('EDREMİT'), ('ERDEK'), ('GÖMEÇ'),
  ('GÖNEN'), ('HAVRAN'), ('İVRİNDİ'), ('KARESİ'), ('KEPSUT'),
  ('MANYAS'), ('MARMARA'), ('SAVAŞTEPE'), ('SINDIRGI'), ('SUSURLUK')
) as t(ilce) where il_adi = 'BALIKESİR'
on conflict (ilce_adi, il_id) do nothing;

-- BİLECİK İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BOZÜYÜK'), ('GÖLPAZARI'), ('İNHİSAR'), ('MERKEZ'), ('OSMANELİ'),
  ('PAZARYERİ'), ('SÖĞÜT'), ('YENİPAZAR')
) as t(ilce) where il_adi = 'BİLECİK'
on conflict (ilce_adi, il_id) do nothing;

-- BİNGÖL İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ADAKLI'), ('GENÇ'), ('KARLIOVA'), ('KİĞI'), ('MERKEZ'),
  ('SOLHAN'), ('YAYLADERE'), ('YEDİSU')
) as t(ilce) where il_adi = 'BİNGÖL'
on conflict (ilce_adi, il_id) do nothing;

-- BİTLİS İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ADİLCEVAZ'), ('AHLAT'), ('GÜROYMAK'), ('HİZAN'), ('MERKEZ'),
  ('MUTKİ'), ('TATVAN')
) as t(ilce) where il_adi = 'BİTLİS'
on conflict (ilce_adi, il_id) do nothing;

-- BOLU İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('DÖRTDİVAN'), ('GEREDE'), ('GÖYNÜK'), ('KIBRISCIK'), ('MENGEN'),
  ('MERKEZ'), ('MUDURNU'), ('SEBEN'), ('YENİÇAĞA')
) as t(ilce) where il_adi = 'BOLU'
on conflict (ilce_adi, il_id) do nothing;

-- BURDUR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AĞLASUN'), ('ALTINYAYLA'), ('BUCAK'), ('ÇAVDIR'), ('ÇELTİKÇİ'),
  ('GÖLHİSAR'), ('KARAMANLI'), ('KEMER'), ('MERKEZ'), ('TEFENNİ'),
  ('YEŞİLOVA')
) as t(ilce) where il_adi = 'BURDUR'
on conflict (ilce_adi, il_id) do nothing;

-- BURSA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BÜYÜKORHAN'), ('GEMLİK'), ('GÜRSU'), ('HARMANCIK'), ('İNEGÖL'),
  ('İZNİK'), ('KARACABEY'), ('KELES'), ('KESTEL'), ('MUDANYA'),
  ('MUSTAFAKEMALPAŞA'), ('NİLÜFER'), ('ORHANELİ'), ('ORHANGAZİ'), ('OSMANGAZİ'),
  ('YENİŞEHİR'), ('YILDIRIM')
) as t(ilce) where il_adi = 'BURSA'
on conflict (ilce_adi, il_id) do nothing;

-- ÇANAKKALE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AYVACIK'), ('BAYRAMİÇ'), ('BİGA'), ('BOZCAADA'), ('ÇAN'),
  ('ECEABAT'), ('EZİNE'), ('GELİBOLU'), ('GÖKÇEADA'), ('LAPSEKİ'),
  ('MERKEZ'), ('YENİCE')
) as t(ilce) where il_adi = 'ÇANAKKALE'
on conflict (ilce_adi, il_id) do nothing;

-- ÇANKIRI İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ATKARACALAR'), ('BAYRAMÖREN'), ('ÇERKEŞ'), ('ELDİVAN'), ('ILGAZ'),
  ('KIZILIRMAK'), ('KORGUN'), ('KURŞUNLU'), ('MERKEZ'), ('ORTA'),
  ('ŞABANÖZÜ'), ('YAPRAKLI')
) as t(ilce) where il_adi = 'ÇANKIRI'
on conflict (ilce_adi, il_id) do nothing;

-- ÇORUM İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALACA'), ('BAYAT'), ('BOĞAZKALE'), ('DODURGA'), ('İSKİLİP'),
  ('KARGI'), ('LAÇİN'), ('MECİTÖZÜ'), ('MERKEZ'), ('OĞUZLAR'),
  ('ORTAKÖY'), ('OSMANCIK'), ('SUNGURLU'), ('UĞURLUDAĞ')
) as t(ilce) where il_adi = 'ÇORUM'
on conflict (ilce_adi, il_id) do nothing;

-- DENİZLİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ACIPAYAM'), ('BABADAĞ'), ('BAKLAN'), ('BEKİLLİ'), ('BEYAĞAÇ'),
  ('BOZKURT'), ('BULDAN'), ('ÇAL'), ('ÇAMELİ'), ('ÇARDAK'),
  ('ÇİVRİL'), ('GÜNEY'), ('HONAZ'), ('KALE'), ('MERKEZEFENDİ'),
  ('PAMUKKALE'), ('SARAYKÖY'), ('SERİNHİSAR'), ('TAVAS')
) as t(ilce) where il_adi = 'DENİZLİ'
on conflict (ilce_adi, il_id) do nothing;

-- DİYARBAKIR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAĞLAR'), ('BİSMİL'), ('ÇERMİK'), ('ÇINAR'), ('ÇÜNGÜŞ'),
  ('DİCLE'), ('EĞİL'), ('ERGANİ'), ('HANİ'), ('HAZRO'),
  ('KAYAPINAR'), ('KOCAKÖY'), ('KULP'), ('LİCE'), ('SİLVAN'),
  ('SUR'), ('YENİŞEHİR')
) as t(ilce) where il_adi = 'DİYARBAKIR'
on conflict (ilce_adi, il_id) do nothing;

-- EDİRNE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ENEZ'), ('HAVSA'), ('İPSALA'), ('KEŞAN'), ('LALAPAŞA'),
  ('MERİÇ'), ('MERKEZ'), ('SÜLOĞLU'), ('UZUNKÖPRÜ')
) as t(ilce) where il_adi = 'EDİRNE'
on conflict (ilce_adi, il_id) do nothing;

-- ELAZIĞ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AĞIN'), ('ALACAKAYA'), ('ARICAK'), ('BASKİL'), ('KARAKOÇAN'),
  ('KEBAN'), ('KOVANCILAR'), ('MADEN'), ('MERKEZ'), ('PALU'),
  ('SİVRİCE')
) as t(ilce) where il_adi = 'ELAZIĞ'
on conflict (ilce_adi, il_id) do nothing;

-- ERZİNCAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ÇAYIRLI'), ('İLİÇ'), ('KEMAH'), ('KEMALİYE'), ('MERKEZ'),
  ('OTLUKBELİ'), ('REFAHİYE'), ('TERCAN'), ('ÜZÜMLÜ')
) as t(ilce) where il_adi = 'ERZİNCAN'
on conflict (ilce_adi, il_id) do nothing;

-- ERZURUM İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AŞKALE'), ('AZİZİYE'), ('ÇAT'), ('HINIS'), ('HORASAN'),
  ('İSPİR'), ('KARAÇOBAN'), ('KARAYAZI'), ('KÖPRÜKÖY'), ('NARMAN'),
  ('OLTU'), ('OLUR'), ('PALANDÖKEN'), ('PASİNLER'), ('PAZARYOLU'), ('ŞENKAYA'),
  ('TEKMAN'), ('TORTUM'), ('UZUNDERE'), ('YAKUTİYE')
) as t(ilce) where il_adi = 'ERZURUM'
on conflict (ilce_adi, il_id) do nothing;

-- ESKİŞEHİR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALPU'), ('BEYLİKOVA'), ('ÇİFTELER'), ('GÜNYÜZÜ'), ('HAN'),
  ('İNÖNÜ'), ('MAHMUDİYE'), ('MİHALGAZİ'), ('MİHALIÇÇIK'), ('ODUNPAZARI'),
  ('SARICAKAYA'), ('SEYİTGAZİ'), ('SİVRİHİSAR'), ('TEPEBAŞI')
) as t(ilce) where il_adi = 'ESKİŞEHİR'
on conflict (ilce_adi, il_id) do nothing;

-- GAZİANTEP İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ARABAN'), ('İSLAHİYE'), ('KARKAMIŞ'), ('NİZİP'), ('NURDAĞI'),
  ('OĞUZELİ'), ('ŞAHİNBEY'), ('ŞEHİTKAMİL'), ('YAVUZELİ')
) as t(ilce) where il_adi = 'GAZİANTEP'
on conflict (ilce_adi, il_id) do nothing;

-- GİRESUN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALUCRA'), ('BULANCAK'), ('ÇAMOLUK'), ('ÇANAKÇI'), ('DERELİ'),
  ('DOĞANKENT'), ('ESPİYE'), ('EYNESİL'), ('GÖRELE'), ('GÜCE'),
  ('KEŞAP'), ('MERKEZ'), ('PİRAZİZ'), ('ŞEBİNKARAHİSAR'), ('TİREBOLU'),
  ('YAĞLIDERE')
) as t(ilce) where il_adi = 'GİRESUN'
on conflict (ilce_adi, il_id) do nothing;

-- GÜMÜŞHANE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('KELKİT'), ('KÖSE'), ('KÜRTÜN'), ('MERKEZ'), ('ŞİRAN'),
  ('TORUL')
) as t(ilce) where il_adi = 'GÜMÜŞHANE'
on conflict (ilce_adi, il_id) do nothing;

-- HAKKARİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ÇUKURCA'), ('DERECİK'), ('MERKEZ'), ('ŞEMDİNLİ'), ('YÜKSEKOVA')
) as t(ilce) where il_adi = 'HAKKARİ'
on conflict (ilce_adi, il_id) do nothing;

-- HATAY İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALTINÖZÜ'), ('ANTAKYA'), ('ARSUZ'), ('BELEN'), ('DEFNE'),
  ('DÖRTYOL'), ('ERZİN'), ('HASSA'), ('İSKENDERUN'), ('KIRIKHAN'),
  ('KUMLU'), ('PAYAS'), ('REYHANLI'), ('SAMANDAĞ'), ('YAYLADAĞI')
) as t(ilce) where il_adi = 'HATAY'
on conflict (ilce_adi, il_id) do nothing;

-- ISPARTA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKSU'), ('ATABEY'), ('EĞİRDİR'), ('GELENDOST'), ('GÖNEN'),
  ('KEÇİBORLU'), ('MERKEZ'), ('SENİRKENT'), ('SÜTÇÜLER'), ('ŞARKİKARAAĞAÇ'),
  ('ULUBORLU'), ('YALVAÇ'), ('YENİŞARBADEMLİ')
) as t(ilce) where il_adi = 'ISPARTA'
on conflict (ilce_adi, il_id) do nothing;

-- MERSİN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKDENİZ'), ('ANAMUR'), ('AYDINCIK'), ('BOZYAZI'), ('ÇAMLIYAYLA'),
  ('ERDEMLİ'), ('GÜLNAR'), ('MEZİTLİ'), ('MUT'), ('SİLİFKE'),
  ('TARSUS'), ('TOROSLAR'), ('YENİŞEHİR')
) as t(ilce) where il_adi = 'MERSİN'
on conflict (ilce_adi, il_id) do nothing;

-- İSTANBUL İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ADALAR'), ('ARNAVUTKÖY'), ('ATAŞEHİR'), ('AVCILAR'), ('BAĞCILAR'),
  ('BAHÇELİEVLER'), ('BAKIRKÖY'), ('BAŞAKŞEHİR'), ('BAYRAMPAŞA'), ('BEŞİKTAŞ'),
  ('BEYKOZ'), ('BEYLİKDÜZÜ'), ('BEYOĞLU'), ('BÜYÜKÇEKMECE'), ('ÇATALCA'),
  ('ÇEKMEKÖY'), ('ESENLER'), ('ESENYURT'), ('EYÜPSULTAN'), ('FATİH'),
  ('GAZİOSMANPAŞA'), ('GÜNGÖREN'), ('KADIKÖY'), ('KAĞITHANE'), ('KARTAL'),
  ('KÜÇÜKÇEKMECE'), ('MALTEPE'), ('PENDİK'), ('SANCAKTEPE'), ('SARIYER'),
  ('SİLİVRİ'), ('SULTANBEYLİ'), ('SULTANGAZİ'), ('ŞİLE'), ('ŞİŞLİ'),
  ('TUZLA'), ('ÜMRANİYE'), ('ÜSKÜDAR'), ('ZEYTİNBURNU')
) as t(ilce) where il_adi = 'İSTANBUL'
on conflict (ilce_adi, il_id) do nothing;

-- İZMİR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALİAĞA'), ('BALÇOVA'), ('BAYINDIR'), ('BAYRAKLI'), ('BERGAMA'),
  ('BEYDAĞ'), ('BORNOVA'), ('BUCA'), ('ÇEŞME'), ('ÇİĞLİ'),
  ('DİKİLİ'), ('FOÇA'), ('GAZİEMİR'), ('GÜZELBAHÇE'), ('KARABAĞLAR'),
  ('KARABURUN'), ('KARŞIYAKA'), ('KEMALPAŞA'), ('KINIK'), ('KİRAZ'),
  ('KONAK'), ('MENDERES'), ('MENEMEN'), ('NARLIDERE'), ('ÖDEMİŞ'),
  ('SEFERİHİSAR'), ('SELÇUK'), ('TİRE'), ('TORBALI'), ('URLA')
) as t(ilce) where il_adi = 'İZMİR'
on conflict (ilce_adi, il_id) do nothing;

-- KARS İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKYAKA'), ('ARPAÇAY'), ('DİGOR'), ('KAĞIZMAN'), ('MERKEZ'),
  ('SARIKAMIŞ'), ('SELİM'), ('SUSUZ')
) as t(ilce) where il_adi = 'KARS'
on conflict (ilce_adi, il_id) do nothing;

-- KASTAMONU İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ABANA'), ('AĞLI'), ('ARAÇ'), ('AZDAVAY'), ('BOZKURT'),
  ('CİDE'), ('ÇATALZEYTİN'), ('DADAY'), ('DEVREKANİ'), ('DOĞANYURT'),
  ('HANÖNÜ'), ('İHSANGAZİ'), ('İNEBOLU'), ('KÜRE'), ('MERKEZ'),
  ('PINARBAŞI'), ('SEYDİLER'), ('ŞENPAZAR'), ('TAŞKÖPRÜ'), ('TOSYA')
) as t(ilce) where il_adi = 'KASTAMONU'
on conflict (ilce_adi, il_id) do nothing;

-- KAYSERİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKKIŞLA'), ('BÜNYAN'), ('DEVELİ'), ('FELAHİYE'), ('HACILAR'),
  ('İNCESU'), ('KOCASİNAN'), ('MELİKGAZİ'), ('ÖZVATAN'), ('PINARBAŞI'),
  ('SARIOĞLAN'), ('SARIZ'), ('TALAS'), ('TOMARZA'), ('YAHYALI'),
  ('YEŞİLHİSAR')
) as t(ilce) where il_adi = 'KAYSERİ'
on conflict (ilce_adi, il_id) do nothing;

-- KIRKLARELİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BABAESKİ'), ('DEMİRKÖY'), ('KOFÇAZ'), ('LÜLEBURGAZ'), ('MERKEZ'),
  ('PEHLİVANKÖY'), ('PINARHİSAR'), ('VİZE')
) as t(ilce) where il_adi = 'KIRKLARELİ'
on conflict (ilce_adi, il_id) do nothing;

-- KIRŞEHİR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKÇAKENT'), ('AKPINAR'), ('BOZTEPE'), ('ÇİÇEKDAĞI'), ('KAMAN'),
  ('MERKEZ'), ('MUCUR')
) as t(ilce) where il_adi = 'KIRŞEHİR'
on conflict (ilce_adi, il_id) do nothing;

-- KOCAELİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAŞİSKELE'), ('ÇAYIROVA'), ('DARICA'), ('DERİNCE'), ('DİLOVASI'),
  ('GEBZE'), ('GÖLCÜK'), ('İZMİT'), ('KANDIRA'), ('KARAMÜRSEL'),
  ('KARTEPE'), ('KÖRFEZ')
) as t(ilce) where il_adi = 'KOCAELİ'
on conflict (ilce_adi, il_id) do nothing;

-- KONYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AHIRLI'), ('AKÖREN'), ('AKŞEHİR'), ('ALTINEKİN'), ('BEYŞEHİR'),
  ('BOZKIR'), ('CİHANBEYLİ'), ('ÇELTİK'), ('ÇUMRA'), ('DERBENT'),
  ('DEREBUCAK'), ('DOĞANHİSAR'), ('EMİRGAZİ'), ('EREĞLİ'), ('GÜNEYSINIR'),
  ('HADİM'), ('HALKAPINAR'), ('HÜYÜK'), ('ILGIN'), ('KADINHANI'),
  ('KARAPINAR'), ('KARATAY'), ('KULU'), ('MERAM'), ('SARAYÖNÜ'),
  ('SELÇUKLU'), ('SEYDİŞEHİR'), ('TAŞKENT'), ('TUZLUKÇU'), ('YALIHÜYÜK'),
  ('YUNAK')
) as t(ilce) where il_adi = 'KONYA'
on conflict (ilce_adi, il_id) do nothing;

-- KÜTAHYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALTINTAŞ'), ('ASLANAPA'), ('ÇAVDARHİSAR'), ('DOMANİÇ'), ('DUMLUPINAR'),
  ('EMET'), ('GEDİZ'), ('HİSARCIK'), ('MERKEZ'), ('PAZARLAR'),
  ('SİMAV'), ('ŞAPHANE'), ('TAVŞANLI')
) as t(ilce) where il_adi = 'KÜTAHYA'
on conflict (ilce_adi, il_id) do nothing;

-- MALATYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKÇADAĞ'), ('ARAPGİR'), ('ARGUVAN'), ('BATTALGAZİ'), ('DARENDE'),
  ('DOĞANŞEHİR'), ('DOĞANYOL'), ('HEKİMHAN'), ('KALE'), ('KULUNCAK'),
  ('PÜTÜRGE'), ('YAZIHAN'), ('YEŞİLYURT')
) as t(ilce) where il_adi = 'MALATYA'
on conflict (ilce_adi, il_id) do nothing;

-- MANİSA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AHMETLİ'), ('AKHİSAR'), ('ALAŞEHİR'), ('DEMİRCİ'), ('GÖLMARMARA'),
  ('GÖRDES'), ('KIRKAĞAÇ'), ('KÖPRÜBAŞI'), ('KULA'), ('SALİHLİ'),
  ('SARIGÖL'), ('SARUHANLI'), ('SELENDİ'), ('SOMA'), ('ŞEHZADELER'),
  ('TURGUTLU'), ('YUNUSEMRE')
) as t(ilce) where il_adi = 'MANİSA'
on conflict (ilce_adi, il_id) do nothing;

-- KAHRAMANMARAŞ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AFŞİN'), ('ANDIRIN'), ('ÇAĞLAYANCERİT'), ('DULKADİROĞLU'), ('EKİNÖZÜ'),
  ('ELBİSTAN'), ('GÖKSUN'), ('NURHAK'), ('ONİKİŞUBAT'), ('PAZARCIK'),
  ('TÜRKOĞLU')
) as t(ilce) where il_adi = 'KAHRAMANMARAŞ'
on conflict (ilce_adi, il_id) do nothing;

-- MARDİN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ARTUKLU'), ('DARGEÇİT'), ('DERİK'), ('KIZILTEPE'), ('MAZIDAĞI'),
  ('MİDYAT'), ('NUSAYBİN'), ('ÖMERLİ'), ('SAVUR'), ('YEŞİLLİ')
) as t(ilce) where il_adi = 'MARDİN'
on conflict (ilce_adi, il_id) do nothing;

-- MUĞLA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BODRUM'), ('DALAMAN'), ('DATÇA'), ('FETHİYE'), ('KAVAKLIDERE'),
  ('KÖYCEĞİZ'), ('MARMARİS'), ('MENTEŞE'), ('MİLAS'), ('ORTACA'),
  ('SEYDİKEMER'), ('ULA'), ('YATAĞAN')
) as t(ilce) where il_adi = 'MUĞLA'
on conflict (ilce_adi, il_id) do nothing;

-- MUŞ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BULANIK'), ('HASKÖY'), ('KORKUT'), ('MALAZGİRT'), ('MERKEZ'),
  ('VARTO')
) as t(ilce) where il_adi = 'MUŞ'
on conflict (ilce_adi, il_id) do nothing;

-- NEVŞEHİR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ACIGÖL'), ('AVANOS'), ('DERİNKUYU'), ('GÜLŞEHİR'), ('HACIBEKTAŞ'),
  ('KOZAKLI'), ('MERKEZ'), ('ÜRGÜP')
) as t(ilce) where il_adi = 'NEVŞEHİR'
on conflict (ilce_adi, il_id) do nothing;

-- NİĞDE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALTUNHİSAR'), ('BOR'), ('ÇAMARDI'), ('ÇİFTLİK'), ('MERKEZ'),
  ('ULUKIŞLA')
) as t(ilce) where il_adi = 'NİĞDE'
on conflict (ilce_adi, il_id) do nothing;

-- ORDU İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKKUŞ'), ('ALTINORDU'), ('AYBASTI'), ('ÇAMAŞ'), ('ÇATALPINAR'),
  ('ÇAYBAŞI'), ('FATSA'), ('GÖLKÖY'), ('GÜLYALI'), ('GÜRGENTEPE'),
  ('İKİZCE'), ('KABADÜZ'), ('KABATAŞ'), ('KORGAN'), ('KUMRU'),
  ('MESUDİYE'), ('PERŞEMBE'), ('ULUBEY'), ('ÜNYE')
) as t(ilce) where il_adi = 'ORDU'
on conflict (ilce_adi, il_id) do nothing;

-- RİZE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ARDEŞEN'), ('ÇAMLIHEMŞİN'), ('ÇAYELİ'), ('DEREPAZARI'), ('FINDIKLI'),
  ('GÜNEYSU'), ('HEMŞİN'), ('İKİZDERE'), ('İYİDERE'), ('KALKANDERE'),
  ('MERKEZ'), ('PAZAR')
) as t(ilce) where il_adi = 'RİZE'
on conflict (ilce_adi, il_id) do nothing;

-- SAKARYA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ADAPAZARI'), ('AKYAZI'), ('ARİFİYE'), ('ERENLER'), ('FERİZLİ'),
  ('GEYVE'), ('HENDEK'), ('KARAPÜRÇEK'), ('KARASU'), ('KAYNARCA'),
  ('KOCAALİ'), ('PAMUKOVA'), ('SAPANCA'), ('SERDİVAN'), ('SÖĞÜTLÜ'),
  ('TARAKLI')
) as t(ilce) where il_adi = 'SAKARYA'
on conflict (ilce_adi, il_id) do nothing;

-- SAMSUN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALAÇAM'), ('ASARCIK'), ('ATAKUM'), ('AYVACIK'), ('BAFRA'),
  ('CANİK'), ('ÇARŞAMBA'), ('HAVZA'), ('İLKADIM'), ('KAVAK'),
  ('LADİK'), ('19 MAYIS'), ('SALIPAZARI'), ('TEKKEKÖY'), ('TERME'),
  ('VEZİRKÖPRÜ'), ('YAKAKENT')
) as t(ilce) where il_adi = 'SAMSUN'
on conflict (ilce_adi, il_id) do nothing;

-- SİİRT İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AYDINLAR'), ('BAYKAN'), ('ERUH'), ('KURTALAN'), ('MERKEZ'),
  ('PERVARİ'), ('ŞİRVAN')
) as t(ilce) where il_adi = 'SİİRT'
on conflict (ilce_adi, il_id) do nothing;

-- SİNOP İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AYANCIK'), ('BOYABAT'), ('DİKMEN'), ('DURAĞAN'), ('ERFELEK'),
  ('GERZE'), ('MERKEZ'), ('SARAYDÜZÜ'), ('TÜRKELİ')
) as t(ilce) where il_adi = 'SİNOP'
on conflict (ilce_adi, il_id) do nothing;

-- SİVAS İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKINCILAR'), ('ALTINYAYLA'), ('DİVRİĞİ'), ('DOĞANŞAR'), ('GEMEREK'),
  ('GÖLOVA'), ('GÜRÜN'), ('HAFİK'), ('İMRANLI'), ('KANGAL'),
  ('KOYULHİSAR'), ('MERKEZ'), ('SUŞEHRİ'), ('ŞARKIŞLA'), ('ULAŞ'),
  ('YILDIZELİ'), ('ZARA')
) as t(ilce) where il_adi = 'SİVAS'
on conflict (ilce_adi, il_id) do nothing;

-- TEKİRDAĞ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ÇERKEZKÖY'), ('ÇORLU'), ('ERGENE'), ('HAYRABOLU'), ('KAPAKLI'),
  ('MALKARA'), ('MARMARAEREĞLİSİ'), ('MURATLI'), ('SARAY'), ('SÜLEYMANPAŞA'),
  ('ŞARKÖY')
) as t(ilce) where il_adi = 'TEKİRDAĞ'
on conflict (ilce_adi, il_id) do nothing;

-- TOKAT İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALMUS'), ('ARTOVA'), ('BAŞÇİFTLİK'), ('ERBAA'), ('MERKEZ'),
  ('NİKSAR'), ('PAZAR'), ('REŞADİYE'), ('SULUSARAY'), ('TURHAL'),
  ('YEŞİLYURT'), ('ZİLE')
) as t(ilce) where il_adi = 'TOKAT'
on conflict (ilce_adi, il_id) do nothing;

-- TRABZON İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKÇAABAT'), ('ARAKLI'), ('ARSİN'), ('BEŞİKDÜZÜ'), ('ÇARŞIBAŞI'),
  ('ÇAYKARA'), ('DERNEKPAZARI'), ('DÜZKÖY'), ('HAYRAT'), ('KÖPRÜBAŞI'),
  ('MAÇKA'), ('OF'), ('ORTAHİSAR'), ('SÜRMENE'), ('ŞALPAZARI'),
  ('TONYA'), ('VAKFIKEBİR'), ('YOMRA')
) as t(ilce) where il_adi = 'TRABZON'
on conflict (ilce_adi, il_id) do nothing;

-- TUNCELİ İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ÇEMİŞGEZEK'), ('HOZAT'), ('MAZGİRT'), ('MERKEZ'), ('NAZIMİYE'),
  ('OVACIK'), ('PERTEK'), ('PÜLÜMÜR')
) as t(ilce) where il_adi = 'TUNCELİ'
on conflict (ilce_adi, il_id) do nothing;

-- ŞANLIURFA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKÇAKALE'), ('BİRECİK'), ('BOZOVA'), ('CEYLANPINAR'), ('EYYÜBİYE'),
  ('HALFETİ'), ('HALİLİYE'), ('HARRAN'), ('HİLVAN'), ('KARAKÖPRÜ'),
  ('SİVEREK'), ('SURUÇ'), ('VİRANŞEHİR')
) as t(ilce) where il_adi = 'ŞANLIURFA'
on conflict (ilce_adi, il_id) do nothing;

-- UŞAK İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BANAZ'), ('EŞME'), ('KARAHALLI'), ('MERKEZ'), ('SİVASLI'),
  ('ULUBEY')
) as t(ilce) where il_adi = 'UŞAK'
on conflict (ilce_adi, il_id) do nothing;

-- VAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAHÇESARAY'), ('BAŞKALE'), ('ÇALDIRAN'), ('ÇATAK'), ('EDREMİT'),
  ('ERCİŞ'), ('GEVAŞ'), ('GÜRPINAR'), ('İPEKYOLU'), ('MURADİYE'),
  ('ÖZALP'), ('SARAY'), ('TUŞBA')
) as t(ilce) where il_adi = 'VAN'
on conflict (ilce_adi, il_id) do nothing;

-- YOZGAT İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKDAĞMADENİ'), ('AYDINCIK'), ('BOĞAZLIYAN'), ('ÇANDIR'), ('ÇAYIRALAN'),
  ('ÇEKEREK'), ('KADIŞEHRİ'), ('MERKEZ'), ('SARAYKENT'), ('SARIKAYA'),
  ('SORGUN'), ('ŞEFAATLİ'), ('YENİFAKILI'), ('YERKÖY')
) as t(ilce) where il_adi = 'YOZGAT'
on conflict (ilce_adi, il_id) do nothing;

-- ZONGULDAK İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALAPLI'), ('ÇAYCUMA'), ('DEVREK'), ('EREĞLİ'), ('GÖKÇEBEY'),
  ('KİLİMLİ'), ('KOZLU'), ('MERKEZ')
) as t(ilce) where il_adi = 'ZONGULDAK'
on conflict (ilce_adi, il_id) do nothing;

-- AKSARAY İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AĞAÇÖREN'), ('ESKİL'), ('GÜLAĞAÇ'), ('GÜZELYURT'), ('MERKEZ'),
  ('ORTAKÖY'), ('SARIYAHŞİ'), ('SULTANHANI')
) as t(ilce) where il_adi = 'AKSARAY'
on conflict (ilce_adi, il_id) do nothing;

-- BAYBURT İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AYDINTEPE'), ('DEMİRÖZÜ'), ('MERKEZ')
) as t(ilce) where il_adi = 'BAYBURT'
on conflict (ilce_adi, il_id) do nothing;

-- KARAMAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AYRANCI'), ('BAŞYAYLA'), ('ERMENEK'), ('KAZIMKARABEKİR'), ('MERKEZ'),
  ('SARIVELİLER')
) as t(ilce) where il_adi = 'KARAMAN'
on conflict (ilce_adi, il_id) do nothing;

-- KIRIKKALE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAHŞİLİ'), ('BALIŞEYH'), ('ÇELEBİ'), ('DELİCE'), ('KARAKEÇİLİ'),
  ('KESKİN'), ('MERKEZ'), ('SULAKYURT'), ('YAHŞİHAN')
) as t(ilce) where il_adi = 'KIRIKKALE'
on conflict (ilce_adi, il_id) do nothing;

-- BATMAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BEŞİRİ'), ('GERCÜŞ'), ('HASANKEYF'), ('KOZLUK'), ('MERKEZ'),
  ('SASON')
) as t(ilce) where il_adi = 'BATMAN'
on conflict (ilce_adi, il_id) do nothing;

-- ŞIRNAK İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BEYTÜŞŞEBAP'), ('CİZRE'), ('GÜÇLÜKONAK'), ('İDİL'), ('MERKEZ'),
  ('SİLOPİ'), ('ULUDERE')
) as t(ilce) where il_adi = 'ŞIRNAK'
on conflict (ilce_adi, il_id) do nothing;

-- BARTIN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AMASRA'), ('KURUCAŞİLE'), ('MERKEZ'), ('ULUS')
) as t(ilce) where il_adi = 'BARTIN'
on conflict (ilce_adi, il_id) do nothing;

-- ARDAHAN İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ÇILDIR'), ('DAMAL'), ('GÖLE'), ('HANAK'), ('MERKEZ'),
  ('POSOF')
) as t(ilce) where il_adi = 'ARDAHAN'
on conflict (ilce_adi, il_id) do nothing;

-- IĞDIR İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ARALIK'), ('KARAKOYUNLU'), ('MERKEZ'), ('TUZLUCA')
) as t(ilce) where il_adi = 'IĞDIR'
on conflict (ilce_adi, il_id) do nothing;

-- YALOVA İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ALTINOVA'), ('ARMUTLU'), ('ÇINARCIK'), ('ÇİFTLİKKÖY'), ('MERKEZ'),
  ('TERMAL')
) as t(ilce) where il_adi = 'YALOVA'
on conflict (ilce_adi, il_id) do nothing;

-- KARABÜK İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('EFLANİ'), ('ESKİPAZAR'), ('MERKEZ'), ('OVACIK'), ('SAFRANBOLU'),
  ('YENİCE')
) as t(ilce) where il_adi = 'KARABÜK'
on conflict (ilce_adi, il_id) do nothing;

-- KİLİS İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('ELBEYLİ'), ('MERKEZ'), ('MUSABEYLİ'), ('POLATELİ')
) as t(ilce) where il_adi = 'KİLİS'
on conflict (ilce_adi, il_id) do nothing;

-- OSMANİYE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('BAHÇE'), ('DÜZİÇİ'), ('HASANBEYLİ'), ('KADİRLİ'), ('MERKEZ'),
  ('SUMBAS'), ('TOPRAKKALE')
) as t(ilce) where il_adi = 'OSMANİYE'
on conflict (ilce_adi, il_id) do nothing;

-- DÜZCE İlçeleri
insert into ilceler (ilce_adi, il_id) 
select ilce, id from iller, (values 
  ('AKÇAKOCA'), ('CUMAYERİ'), ('ÇİLİMLİ'), ('GÖLYAKA'), ('GÜMÜŞOVA'),
  ('KAYNAŞLI'), ('MERKEZ'), ('YIĞILCA')
) as t(ilce) where il_adi = 'DÜZCE'
on conflict (ilce_adi, il_id) do nothing;
