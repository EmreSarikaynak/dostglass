# Parametrik Veri Sistemi

## Kullanım

Tüm parametrik veriler `/api/parameters/[table]` endpoint'i üzerinden yönetilir.

## API Kullanımı

```typescript
// Veri getirme
fetch('/api/parameters/insurance_companies')

// Yeni kayıt
fetch('/api/parameters/insurance_companies', {
  method: 'POST',
  body: JSON.stringify({ code: 'XX', name: 'Test Sigorta' })
})

// Güncelleme
fetch('/api/parameters/insurance_companies', {
  method: 'PUT',
  body: JSON.stringify({ id: 'uuid', name: 'Yeni İsim' })
})

// Silme
fetch('/api/parameters/insurance_companies?id=uuid', {
  method: 'DELETE'
})
```

## Tablolar

- insurance_companies: Sigorta şirketleri
- insured_types: Sigortalı tipleri
- cities / districts: İl/İlçe
- vehicle_brands / vehicle_models: Marka/Model
- Ve 14 tablo daha...

