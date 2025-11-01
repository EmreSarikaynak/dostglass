# 🚗 DostGlass - Otomotiv Cam Sigorta Yönetim Sistemi

Next.js 15 (App Router, TypeScript) + Material UI v7 + Supabase ile geliştirilmiş production-ready kurumsal portal.

## 🚀 Özellikler

### Temel Özellikler
- **Next.js 15** App Router ile modern React yapısı
- **Material UI (MUI) v7** ile profesyonel ve responsive arayüz
- **🌙 Dark Mode** - Otomatik sistem tercihi algılama ve manuel toggle
- **TypeScript** ile tip güvenli kod
- **Supabase** ile güvenli kimlik doğrulama ve veritabanı
- **Role-based Access Control (RBAC)** - Admin ve Bayi rolleri
- **Row Level Security (RLS)** ile güvenli veri erişimi
- **Multi-tenant Architecture** - Firma bazlı izolasyon

### Modüller

#### 📊 Dashboard Modülü
- **Dinamik İstatistikler**: Gerçek zamanlı veriler (kullanıcılar, ihbarlar, araçlar, işlemler)
- **Karşılaştırmalı Analiz**: Değişim yüzdeleri, trend ikonları, dönemsel karşılaştırma
- **Grafikler (Recharts)**: İhbar trendi, durum dağılımı, aylık istatistikler, top listeler
- **Dönem Filtreleme**: Son 7 gün / Son 30 gün toggle seçimi
- **Export Özelliği**: CSV formatında veri aktarımı

#### 🔍 Fiyat Sorgulama Modülü
- **Hızlı Arama**: Stok kodu ile anında fiyat sorgulama
- **Gelişmiş Filtreleme**: Araç bilgisi, cam tipi, özellikler (kamera, sensör, enkapsül)
- **Autocomplete**: Akıllı arama önerileri
- **Detaylı Sonuçlar**: Ürün bilgileri, fiyatlar, teknik özellikler
- **CSV Export**: Sonuçları dışa aktarma
- **Rol Bazlı Erişim**: Hem admin hem de bayi kullanıcıları için

#### 📢 Duyuru Sistemi
- **Zengin Metin Editörü**: HTML tabanlı duyuru oluşturma
- **Breaking News Carousel**: Ana sayfada otomatik duyuru gösterimi
- **Öncelik Sıralaması**: Önemli duyurular öne çıkar
- **Tarih Aralığı**: Geçerlilik başlangıç ve bitiş tarihleri

#### 🚙 İhbar Yönetimi
- **Yeni İhbar Oluşturma**: Kapsamlı form yapısı
- **İhbar Listesi**: Filtreleme, sıralama, arama
- **İhbar Detay**: Tüm bilgilerin görüntülenmesi
- **Durum Takibi**: Draft, Submitted, In Progress, Completed, Cancelled

#### 💰 Cam Fiyat Listesi
- **Excel Import**: Toplu fiyat yükleme
- **İlişkisel Yapı**: Araç markaları, modeller, cam tipleri ile tam entegre
- **Filtreleme**: Kategori, marka, model, cam pozisyonu bazlı
- **Özellik Bayrakları**: Kamera, sensör, enkapsül, akustik, ısıtmalı

#### 🔧 Ayarlar ve Parametreler
- **Genel Ayarlar**: Logo, site başlığı, tema ayarları
- **Parametrik Veriler**: 14+ tablo yönetimi
- **Araç Yönetimi**: Marka ve model ekleme/düzenleme
- **Kullanıcı Yönetimi**: Admin ve bayi kullanıcı oluşturma

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı ve projesi
- Vercel hesabı (deployment için - opsiyonel)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd dostlarglass
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Veritabanını Yapılandırın

Supabase Dashboard → SQL Editor'de aşağıdaki migration dosyalarını sırayla çalıştırın:

1. `supabase/schema.sql` - Ana şema (tenants, user_tenants)
2. `supabase/migrations/create_parameter_tables.sql` - Parametrik tablolar
3. `supabase/migrations/create_cities_districts.sql` - İl/İlçe tabloları
4. `supabase/migrations/populate_cities_districts.sql` - İl/İlçe verileri
5. `supabase/migrations/create_claims_tables.sql` - İhbar tabloları
6. `supabase/migrations/create_dealers_table.sql` - Bayi tablosu
7. `supabase/migrations/20241031_create_glass_prices_table.sql` - Cam fiyat listesi
8. `supabase/migrations/create_system_settings.sql` - Sistem ayarları
9. `supabase/migrations/create_announcements_table.sql` - Duyurular tablosu
10. `supabase/migrations/20241031_add_user_tenants_timestamps.sql` - User_tenants tarihleri
11. `supabase/migrations/20241031_alter_claim_items_additional_materials.sql` - Claim items ek alanlar

### 4. Environment Variables

`.env.local.example` dosyasını kopyalayarak `.env.local` oluşturun:

```bash
cp .env.local.example .env.local
```

Supabase bilgilerinizi ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
NEXT_PUBLIC_APP_NAME=DostGlass
```

**Supabase bilgilerinizi nereden bulabilirsiniz:**
1. Supabase Dashboard → Settings → API
2. `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `service_role` → `SUPABASE_SERVICE_ROLE` (⚠️ Bu anahtarı asla istemci tarafında kullanmayın!)

### 5. İlk Admin Kullanıcısını Oluşturun

```bash
npm run seed:admin
```

Bu komut şu kullanıcıyı oluşturur:
- **Email:** info@secesta.com
- **Password:** Emre%&Sarkay23!
- **Tenant:** Secesta
- **Role:** admin

⚠️ **Önemli:** Production'da bu şifreyi mutlaka değiştirin!

### 6. Araç Veritabanını Doldurun (Opsiyonel)

```bash
# Tüm araçları yükle (Binek + Ticari + Diğer)
npm run seed:all-vehicles
```

**Toplam:**
- **~98 Marka**
- **~1348 Model**
- Binek, Kamyon, Kamyonet, Motosiklet, İş Makinesi kategorileri

### 7. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000/login](http://localhost:3000/login) adresini açın.

## 📁 Proje Yapısı

```
dostlarglass/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── admin/                  # Admin sayfaları
│   │   │   ├── page.tsx           # Dashboard (dinamik istatistikler)
│   │   │   ├── price-query/       # Fiyat sorgulama
│   │   │   ├── glass-prices/      # Cam fiyat listesi
│   │   │   ├── users/             # Kullanıcı yönetimi
│   │   │   ├── claims/            # İhbar yönetimi
│   │   │   ├── announcements/     # Duyuru yönetimi
│   │   │   ├── vehicles/          # Araç kayıtları
│   │   │   └── settings/          # Ayarlar
│   │   ├── bayi/
│   │   │   └── price-query/       # Bayi fiyat sorgulama
│   │   ├── api/                    # API Routes
│   │   │   ├── dashboard/          # Dashboard API
│   │   │   ├── price-query/        # Fiyat sorgulama API
│   │   │   ├── claims/             # İhbar API
│   │   │   ├── glass-prices/       # Cam fiyat API
│   │   │   └── parameters/         # Parametrik veri API
│   │   ├── login/                  # Login sayfası
│   │   └── providers.tsx           # Theme & Context Providers
│   ├── components/                 # React Bileşenleri
│   │   ├── dashboard/              # Dashboard bileşenleri
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── ClaimsTrendChart.tsx
│   │   │   ├── StatusDistributionChart.tsx
│   │   │   ├── MonthlyStatsChart.tsx
│   │   │   └── TopListsChart.tsx
│   │   ├── price-query/            # Fiyat sorgulama bileşenleri
│   │   │   └── PriceQueryClient.tsx
│   │   ├── AdminLayout.tsx         # Admin layout ve menü
│   │   └── BreakingNewsCarousel.tsx # Duyuru carousel'i
│   ├── lib/                        # Yardımcı fonksiyonlar
│   │   ├── auth.ts                 # Auth helper'ları
│   │   ├── supabaseAdmin.ts        # Admin client (SERVICE_ROLE)
│   │   ├── supabaseClient.ts       # Browser client
│   │   └── supabaseServer.ts       # Server client
│   ├── types/                      # TypeScript tipleri
│   │   ├── claim.ts
│   │   └── glass-price.ts
│   ├── middleware.ts               # Route protection
│   └── theme.ts                    # MUI tema
├── scripts/                        # Seed scriptleri
│   ├── seed-admin.ts
│   ├── seed-complete-vehicles.ts
│   └── seed-all-vehicles.ts
├── supabase/
│   ├── schema.sql                  # Ana şema
│   └── migrations/                 # Migration dosyaları
└── package.json
```

## 👥 Roller ve Yetkiler

### Admin
- ✅ Tüm sayfalara erişim
- ✅ Kullanıcı yönetimi (admin/bayi oluşturma)
- ✅ Fiyat listesi yönetimi
- ✅ Duyuru yönetimi
- ✅ Parametrik veri yönetimi
- ✅ İhbar yönetimi
- ✅ Dashboard ve raporlar
- ✅ Fiyat sorgulama

### Bayi
- ✅ Fiyat sorgulama
- ✅ Cam fiyat listesi görüntüleme
- ✅ İhbar oluşturma ve görüntüleme
- ✅ Kendi verilerini görme (tenant izolasyonu)
- ✅ Duyuruları görüntüleme
- ❌ Kullanıcı yönetimi
- ❌ Sistem ayarları
- ❌ Parametrik veri yönetimi

## 📡 API Endpoints

### Dashboard API
- `GET /api/dashboard/stats?period=30` - İstatistikler
- `GET /api/dashboard/charts?period=7` - Grafik verileri

### Fiyat Sorgulama API
- `GET /api/price-query/search?stock_code=XXX` - Detaylı arama
- `GET /api/price-query/quick-search?q=XXX` - Hızlı autocomplete

### İhbar API
- `GET /api/claims` - İhbar listesi
- `POST /api/claims` - Yeni ihbar
- `GET /api/claims/[id]` - İhbar detayı
- `PUT /api/claims/[id]` - İhbar güncelleme

### Cam Fiyat API
- `GET /api/glass-prices` - Fiyat listesi
- `POST /api/glass-prices` - Yeni fiyat
- `POST /api/glass-prices/import` - Excel import

### Parametrik Veri API
- `GET /api/parameters/[table]` - Parametrik veri listesi
- `POST /api/parameters/[table]` - Yeni kayıt
- `PUT /api/parameters/[table]` - Güncelleme
- `DELETE /api/parameters/[table]?id=xxx` - Silme

**Desteklenen Tablolar:**
- `insurance_companies` - Sigorta şirketleri
- `vehicle_categories` - Araç kategorileri
- `vehicle_brands` - Araç markaları
- `vehicle_models` - Araç modelleri
- `glass_positions` - Cam pozisyonları
- `vehicle_glass_types` - Cam tipleri
- `glass_brands` - Cam markaları
- `glass_colors` - Cam renkleri
- ve 6 tablo daha...

## 🔐 Güvenlik

- **RLS (Row Level Security):** Tüm tablolarda aktif, tenant bazlı izolasyon
- **Middleware Protection:** Tüm route'lar korunuyor
- **Service Role:** Sadece server-side işlemlerde kullanılıyor
- **Email Confirmation:** Supabase auth ile entegre
- **Session Management:** Cookie-based, güvenli
- **XSS Protection:** React'in built-in koruması
- **CSRF Protection:** Next.js middleware ile korunuyor

## 🚀 Deployment (Vercel)

### 1. Vercel'e Deploy Edin

```bash
vercel
```

veya GitHub repository'nizi Vercel'e bağlayın.

### 2. Environment Variables Ekleyin

Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE
NEXT_PUBLIC_APP_NAME
```

### 3. İlk Admin Kullanıcısını Oluşturun

```bash
npm run seed:admin
```

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm start

# Linting
npm run lint

# Admin seed
npm run seed:admin

# Araç veritabanı seed
npm run seed:vehicles           # Binek araçlar
npm run seed:commercial         # Ticari araçlar  
npm run seed:remaining          # Diğer kategoriler
npm run seed:all-vehicles       # Tümü
```

## 📚 Kullanılan Teknolojiler

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** Material UI (MUI) v7
- **Language:** TypeScript
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Date Utils:** date-fns
- **Styling:** MUI Emotion
- **Rich Text Editor:** React Quill

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes
- **ORM:** Supabase Client

### DevOps
- **Hosting:** Vercel (önerilen)
- **Database:** Supabase Cloud
- **Version Control:** Git

## 🐛 Sorun Giderme

### "Invalid JWT" hatası
- `.env.local` dosyasındaki Supabase anahtarlarını kontrol edin
- Supabase Dashboard'dan anahtarları yeniden kopyalayın
- Tarayıcı cache'ini temizleyin

### Login sonrası yönlendirme çalışmıyor
- Supabase'de email confirmation'ın açık olduğundan emin olun
- `user_tenants` tablosunda kullanıcı kaydı olduğunu kontrol edin
- Migration'ların tamamının çalıştırıldığını doğrulayın

### Admin kullanıcısı oluşturamıyorum
- `SUPABASE_SERVICE_ROLE` anahtarının doğru olduğundan emin olun
- SQL schema'nın doğru şekilde çalıştırıldığını kontrol edin
- Supabase projesinin aktif olduğunu doğrulayın

### Build hataları
- `node_modules` klasörünü silin ve `npm install` çalıştırın
- `.next` klasörünü silin ve tekrar build edin
- TypeScript hatalarını düzeltin

### Fiyat sorgulama çalışmıyor
- Cam fiyat listesi migration'ının çalıştırıldığını kontrol edin
- En az bir fiyat kaydı olduğundan emin olun
- API endpoint'lerinin erişilebilir olduğunu test edin

## 📊 Veritabanı Şeması

### Ana Tablolar
- `tenants` - Firma/tenant bilgileri
- `user_tenants` - Kullanıcı-tenant ilişkileri ve roller
- `claims` - İhbar ana tablosu
- `claim_items` - İhbar cam kalemleri
- `glass_prices` - Cam fiyat listesi (ilişkisel)
- `dealers` - Bayi bilgileri
- `announcements` - Duyurular
- `system_settings` - Sistem ayarları

### Parametrik Tablolar (14 adet)
- Sigorta şirketleri, araç kategorileri, markalar, modeller
- Cam pozisyonları, tipleri, markaları, renkleri
- Hasar/olay şekilleri, ehliyet sınıfları
- İl/ilçeler, montaj şekilleri, işlem yerleri

### View'ler
- `glass_prices_detailed` - Cam fiyatları ile tüm ilişkisel bilgilerin birleştirilmiş görünümü

## 📝 Önemli Notlar

1. **Şifre Güvenliği:** İlk admin şifresini production'da mutlaka değiştirin
2. **Service Role:** `SUPABASE_SERVICE_ROLE` anahtarını asla istemci tarafında kullanmayın
3. **RLS Politikaları:** Tüm tablolarda aktif, manuel devre dışı bırakmayın
4. **Tenant İzolasyonu:** Her kullanıcı sadece kendi tenant'ına ait verileri görebilir
5. **Migration Sırası:** Migration dosyalarını mutlaka sırayla çalıştırın
6. **Seed Scriptleri:** İdempotent tasarlanmıştır, birden fazla çalıştırılabilir

## 🎯 Gelecek Geliştirmeler

- [ ] PDF/Excel export (detaylı raporlar)
- [ ] Email bildirimleri
- [ ] Real-time updates (WebSocket)
- [ ] Mobil uygulama (React Native)
- [ ] Dashboard widget özelleştirme
- [ ] Gelişmiş filtreleme ve arama
- [ ] Bulk operations (toplu işlemler)
- [ ] Audit log (işlem geçmişi)
- [ ] Multi-language support
- [ ] SMS entegrasyonu

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

**DostGlass Otomotiv Cam Sigorta Yönetim Sistemi** - 2025

---

**Production Ready** ✨ | **Enterprise Grade** 🏢 | **Fully Responsive** 📱
