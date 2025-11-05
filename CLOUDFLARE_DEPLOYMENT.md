# Cloudflare Pages Deployment Rehberi

## Yapılan Düzeltmeler

### 1. Middleware Güncellemesi ✅
- Edge Runtime desteği eklendi
- Hata yönetimi iyileştirildi
- Asset yolları daha kapsamlı hale getirildi

### 2. Next.js Yapılandırması ✅
- Cloudflare uyumluluğu için optimize edildi
- `output: 'standalone'` eklendi
- Webpack yapılandırması güncellendi

### 3. Build Scriptleri ✅
- Turbopack kullanımı kaldırıldı (Cloudflare uyumluluğu için)
- Standard webpack build kullanılıyor

## Deployment Adımları

### 1. Environment Değişkenlerini Ayarlayın

**ÖNEMLİ:** Bu proje `wrangler.toml` dosyası ile yapılandırılmıştır. Normal environment değişkenleri zaten `wrangler.toml` dosyasına eklenmiştir.

**Sadece Secret Değişken Eklemeniz Gerekiyor:**

Cloudflare Dashboard'a gidin: **Settings > Environment Variables**

**"Encrypt" kutucuğunu AÇIK tutarak** şu değişkeni ekleyin:

```
Variable name: SUPABASE_SERVICE_ROLE
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eGduc2tiZG1vbGJ2YWF0bGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYwMzM5OSwiZXhwIjoyMDc2MTc5Mzk5fQ.9OUoVlkO3Rulr1nkoSnQVOzzMsT-D6RbFM-AetQgwfk
Environment: Production VE Preview (ikisini de seçin)
✅ Encrypt kutucuğunu AÇIK tutun
```

**Neden sadece bu değişken?**
- Normal environment değişkenleri (`NEXT_PUBLIC_*`) `wrangler.toml` dosyasında tanımlıdır
- Cloudflare Dashboard sadece "secret" (şifreli) değişkenler için kullanılır
- `SUPABASE_SERVICE_ROLE` hassas bir key olduğu için Dashboard'dan secret olarak eklenmelidir

### 2. Build Command'ı Güncelleyin

Cloudflare Pages Settings > Builds & Deployments bölümünde:

**Build command:**
```bash
npm run build:cf
```

**Build output directory:**
```
.open-next/assets
```

**Root directory:**
```
/
```


### 4. Compatibility Flags

`wrangler.jsonc` dosyası zaten `nodejs_compat` flag'ini içeriyor. Bu ayar Cloudflare Workers'ın Node.js API'lerini kullanabilmesini sağlar.

### 5. Local Test (Opsiyonel)

Deployment öncesi local'de test etmek için:

```bash
# Build
npm run build:cf

# Preview
npx wrangler pages dev .open-next/assets
```

## Deployment

### Otomatik Deployment (Git Push)

Cloudflare Pages GitHub/GitLab ile entegre edilmişse:
```bash
git add .
git commit -m "Cloudflare uyumluluk düzeltmeleri"
git push origin main
```

### Manuel Deployment (Wrangler CLI)

```bash
# Build
npm run build:cf

# Deploy
npx wrangler pages deploy .open-next/assets --project-name=dostglass
```

## Sorun Giderme

### Internal Server Error

Eğer hala Internal Server Error alıyorsanız:

1. **Environment değişkenlerini kontrol edin** - Cloudflare Dashboard'da doğru şekilde ayarlandığından emin olun
2. **Build loglarını inceleyin** - Cloudflare Dashboard > Deployments bölümünden build loglarına bakın
3. **Function loglarını kontrol edin** - Cloudflare Dashboard > Functions > Real-time Logs
4. **Wrangler.toml vs wrangler.jsonc** - İkisinden sadece biri olmalı. Şu anda `wrangler.jsonc` kullanılıyor.

### Supabase Bağlantı Sorunları

Eğer Supabase bağlantı hataları alıyorsanız:

1. CORS ayarlarını kontrol edin - Supabase Dashboard > Authentication > URL Configuration
2. Allowed Origins'e Cloudflare Pages URL'inizi ekleyin: `https://dostglass.pages.dev`

### Middleware Hataları

Middleware edge runtime'da çalışırken bazı Node.js API'leri kullanılamaz. Eğer hatalar devam ederse:

1. Function loglarında hangi API'nin hata verdiğini bulun
2. O API'yi edge-compatible bir alternatifle değiştirin

## Performans Optimizasyonları

### 1. Static Asset Caching

`public/_routes.json` dosyası static asset'lerin doğru cache'lenmesini sağlar.

### 2. Edge Runtime

Middleware ve bazı API rotaları edge'de çalışacak şekilde optimize edilmiştir.

### 3. Image Optimization

`next.config.ts`'de `unoptimized: true` ayarı Cloudflare'in kendi image optimization'ını kullanmanızı sağlar.

## Yararlı Komutlar

```bash
# Dependencies'leri yükle
npm install

# Local development
npm run dev

# Production build (Cloudflare için)
npm run build:cf

# Wrangler ile preview
npx wrangler pages dev .open-next/assets

# Deploy
npx wrangler pages deploy .open-next/assets --project-name=dostglass

# Logs
npx wrangler pages deployment tail
```

## Ek Kaynaklar

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
