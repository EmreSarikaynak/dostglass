# DostGlass - Kurumsal Portal

Next.js (App Router, TypeScript) + Material UI + Supabase ile geliştirilmiş production-ready kurumsal portal.

## 🚀 Özellikler

- **Next.js 15** App Router ile modern React yapısı
- **Material UI (MUI)** ile profesyonel ve responsive arayüz
- **🌙 Dark Mode** - Otomatik sistem tercihi algılama ve manuel toggle
- **Supabase** ile güvenli kimlik doğrulama ve veritabanı
- **TypeScript** ile tip güvenli kod
- **Role-based Access Control (RBAC)** - Admin ve Bayi rolleri
- **Row Level Security (RLS)** ile güvenli veri erişimi
- **Email/Password Authentication** - Magic link yok
- **Multi-tenant Architecture** - Firma bazlı izolasyon

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı ve projesi
- Vercel hesabı (deployment için)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd dostglass
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Veritabanını Yapılandırın

Supabase Dashboard'da SQL Editor'ü açın ve `supabase/schema.sql` dosyasındaki SQL kodunu çalıştırın:

```sql
-- supabase/schema.sql dosyasının içeriğini buraya kopyalayın ve çalıştırın
```

Bu işlem şu tabloları oluşturur:
- `tenants` - Firma/tenant bilgileri
- `user_tenants` - Kullanıcı-tenant ilişkileri ve roller

### 4. Environment Variables

`.env.local.example` dosyasını kopyalayarak `.env.local` oluşturun:

```bash
cp .env.local.example .env.local
```

Supabase projenizden gerekli bilgileri alıp `.env.local` dosyasına ekleyin:

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

Seed script'i çalıştırarak ilk admin kullanıcısını oluşturun:

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

#### 🚗 Binek Araç Veritabanı

Kapsamlı binek araç veritabanını (38 marka, 535 model) yüklemek için:


**Eklenen Markalar:**
- Premium: Audi (44), BMW (66), Mercedes-Benz (87)
- Lüks: Porsche (14), Lexus (10), Tesla (4), Jaguar (7)
- Japon: Toyota (21), Honda (8), Nissan (8), Mazda (12)
- Kore: Hyundai (16), Kia (13), Genesis (6)
- Alman: Volkswagen (26), Opel (12)
- Fransız: Renault (14), Peugeot (10), Citroën (7)
- Amerikan: Ford (16), Chevrolet (6), Jeep (7)
- İtalyan: Fiat (12), Alfa Romeo (6)
- Ve daha fazlası...

#### 🚚 Ticari Araç Veritabanı

Kapsamlı ticari araç veritabanını (20 marka, 172 model) yüklemek için:


**Eklenen Markalar:**
- Hafif Ticari: Ford Transit, VW Caddy, Fiat Doblo, Renault Kangoo
- Orta Ticari: Mercedes Sprinter, VW Crafter, Fiat Ducato, Renault Master
- Pickup: Ford Ranger, Toyota Hilux, Nissan Navara, Isuzu D-Max, Mitsubishi L200
- Kamyon: Iveco (26), MAN (22), Scania (23), DAF (12), Mercedes, Volvo
- Otobüs: Temsa (9), Otokar (8), Karsan (5), BMC (6)
- Çin Markaları: Maxus (13), DFSK (8), Changan, Great Wall, JAC, Foton
- Amerikan: Dodge Ram, Chevrolet, GMC

#### 🎯 Tüm Araçları Yükle

Her iki kategoriyi birden yüklemek için:

```bash
npm run seed:all-vehicles
```

**Toplam:**
- **~58 Marka** (bazı markalar her iki kategoride)
- **~707 Model** (Binek: 535, Ticari: 172)
- ✅ Scriptler idempotent'tir (tekrar çalıştırılabilir, duplicate oluşturmaz)

### 7. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
dostglass/
├── src/
│   ├── app/                    # Next.js App Router sayfaları
│   │   ├── admin/              # Admin sayfaları
│   │   │   ├── users/          # Kullanıcı yönetimi
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── api/                # API routes
│   │   │   └── admin/
│   │   │       └── create-user/ # Kullanıcı oluşturma endpoint'i
│   │   ├── login/              # Login sayfası
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Ana sayfa (bayi)
│   │   └── providers.tsx       # MUI Theme Provider
│   ├── components/             # React bileşenleri
│   │   └── AppBar.tsx          # Navigation bar
│   ├── lib/                    # Yardımcı fonksiyonlar
│   │   ├── auth.ts             # Auth helper'ları
│   │   ├── supabaseAdmin.ts    # Admin client
│   │   ├── supabaseClient.ts   # Browser client
│   │   └── supabaseServer.ts   # Server client
│   ├── middleware.ts           # Route protection
│   └── theme.ts                # MUI tema yapılandırması
├── scripts/
│   └── seed-admin.ts           # Admin seed script
├── supabase/
│   └── schema.sql              # Veritabanı şeması
└── package.json
```

## 👥 Roller ve Yetkiler

### Admin
- Tüm sayfalara erişim
- Yeni kullanıcı (admin/bayi) oluşturabilir
- Tenant yönetimi yapabilir
- `/admin` ve alt sayfalarına erişebilir

### Bayi
- Sadece kendi sayfalarına erişim
- Kendi tenant'ına ait verileri görebilir
- `/admin` sayfalarına erişemez

## 🔐 Güvenlik

- **RLS (Row Level Security):** Tüm tablolarda aktif
- **Middleware Protection:** Tüm route'lar korunuyor
- **Service Role:** Sadece server-side işlemlerde kullanılıyor
- **Email Confirmation:** Otomatik olarak aktif
- **Session Management:** Cookie-based, güvenli

## 🚀 Deployment (Vercel)

### 1. Vercel'e Deploy Edin

```bash
vercel
```

veya GitHub repository'nizi Vercel'e bağlayın.

### 2. Environment Variables'ı Ekleyin

Vercel Dashboard → Settings → Environment Variables bölümünden şu değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE
NEXT_PUBLIC_APP_NAME
```

### 3. İlk Admin Kullanıcısını Oluşturun

Local'de veya Vercel CLI ile:

```bash
npm run seed:admin
```

## 📝 Önemli Notlar

1. **Şifre Değiştirme:** İlk admin şifresini mutlaka değiştirin
2. **Service Role:** `SUPABASE_SERVICE_ROLE` anahtarını asla istemci tarafında kullanmayın
3. **RLS:** Tüm public işlemler RLS politikaları ile korunuyor
4. **Seed Script:** İdempotent - Birden fazla çalıştırılabilir

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm start

# Admin seed
npm run seed:admin

# Linting
npm run lint
```

## 📚 Kullanılan Teknolojiler

- **Frontend Framework:** Next.js 15 (App Router)
- **UI Library:** Material UI (MUI) v6
- **Backend/Auth:** Supabase
- **Language:** TypeScript
- **Form Validation:** Zod + React Hook Form
- **Date Utils:** date-fns
- **Styling:** MUI Emotion

## 🐛 Sorun Giderme

### "Invalid JWT" hatası alıyorum
- `.env.local` dosyasındaki Supabase anahtarlarını kontrol edin
- Supabase Dashboard'dan anahtarları yeniden kopyalayın

### Login sonrası yönlendirme çalışmıyor
- Supabase'de email confirmation'ın açık olduğundan emin olun
- `user_tenants` tablosunda kullanıcı kaydı olduğunu kontrol edin

### Admin kullanıcısı oluşturamıyorum
- `SUPABASE_SERVICE_ROLE` anahtarının doğru olduğundan emin olun
- SQL schema'nın doğru şekilde çalıştırıldığını kontrol edin

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

DostGlass Kurumsal Portal - 2025
