# 🚀 DostGlass Kurumsal Portal - Hızlı Başlangıç

## ✅ Kurulum Adımları

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Supabase SQL Şemasını Çalıştırın

Supabase Dashboard → SQL Editor'de `supabase/schema.sql` dosyasının içeriğini çalıştırın.

### 3. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun:

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

### 4. İlk Admin Kullanıcısını Oluşturun

```bash
npm run seed:admin
```

Bu komut şu kullanıcıyı oluşturur:
- **Email:** info@secesta.com
- **Password:** Emre%&Sarkay23!
- **Tenant:** Secesta
- **Role:** admin

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda http://localhost:3000/login adresini açın.

## 📦 Build ve Production

```bash
# Build
npm run build

# Production server
npm start
```

## 🎯 Önemli Notlar

✅ **Tamamlandı:**
- Next.js 15 App Router + TypeScript
- Material UI v7 ile Türkçe arayüz
- Supabase email/password auth
- Role-based access control (admin/bayi)
- Row Level Security (RLS)
- Responsive tasarım
- Server-side rendering
- Middleware ile route protection
- Admin kullanıcı oluşturma sistemi
- Seed script

⚠️ **Güvenlik:**
- Production'da admin şifresini mutlaka değiştirin!
- SERVICE ROLE anahtarını asla istemci tarafında kullanmayın
- RLS politikaları tüm tablolarda aktif

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için `README.md` dosyasına bakın.

## 🐛 Sorun mu yaşıyorsunuz?

1. `.env.local` dosyasının doğru olduğundan emin olun
2. SQL şemasının tam olarak çalıştırıldığını kontrol edin
3. Supabase projenizin aktif olduğunu doğrulayın
4. README.md'deki "Sorun Giderme" bölümüne bakın

## 📝 Sonraki Adımlar

1. Login sayfasından giriş yapın: http://localhost:3000/login
2. Admin paneline gidin: http://localhost:3000/admin
3. Yeni kullanıcılar oluşturun: http://localhost:3000/admin/users
4. Vercel'e deploy edin ve production ortamını test edin

---

**DostGlass Kurumsal Portal** - Production Ready ✨

