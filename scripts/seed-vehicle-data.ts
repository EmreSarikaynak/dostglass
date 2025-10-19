// Araç verileri seed script
// Kategori, Marka ve Model verilerini Supabase'e yükler

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local dosyasını yükle
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE gereklidir!')
  console.error('   .env.local dosyasını kontrol edin.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedVehicleData() {
  console.log('🚗 Araç verileri yükleniyor...\n')

  // 1. Kategorileri ekle/güncelle
  console.log('📁 Kategoriler yükleniyor...')
  
  const categories = [
    { name: 'Binek Araç', is_active: true },
    { name: 'Ticari Araç', is_active: true },
    { name: 'Motosiklet', is_active: true },
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .upsert({ name: cat.name, is_active: cat.is_active }, { onConflict: 'name' })
      .select('id, name')
      .single()

    if (error) {
      console.error(`❌ Kategori hatası (${cat.name}):`, error)
    } else {
      categoryMap[cat.name] = data.id
      console.log(`✅ ${cat.name}`)
    }
  }

  // 2. Markaları ekle/güncelle
  console.log('\n🏢 Markalar yükleniyor...')
  
  const brands = [
    { name: 'Audi', category: 'Binek Araç' },
    { name: 'BMW', category: 'Binek Araç' },
    { name: 'Mercedes-Benz', category: 'Binek Araç' },
    { name: 'Volkswagen', category: 'Binek Araç' },
    { name: 'Toyota', category: 'Binek Araç' },
    { name: 'Honda', category: 'Binek Araç' },
    { name: 'Ford', category: 'Binek Araç' },
    { name: 'Renault', category: 'Binek Araç' },
    { name: 'Fiat', category: 'Binek Araç' },
    { name: 'Peugeot', category: 'Binek Araç' },
    { name: 'Opel', category: 'Binek Araç' },
    { name: 'Hyundai', category: 'Binek Araç' },
    { name: 'Ford (Ticari)', category: 'Ticari Araç' },
    { name: 'Mercedes-Benz (Ticari)', category: 'Ticari Araç' },
    { name: 'Yamaha', category: 'Motosiklet' },
    { name: 'Honda (Motor)', category: 'Motosiklet' },
  ]

  const brandMap: Record<string, string> = {}

  for (const brand of brands) {
    const categoryId = categoryMap[brand.category]
    if (!categoryId) {
      console.error(`❌ Kategori bulunamadı: ${brand.category}`)
      continue
    }

    const { data, error } = await supabase
      .from('vehicle_brands')
      .upsert(
        { name: brand.name, category_id: categoryId, is_active: true },
        { onConflict: 'name' }
      )
      .select('id, name')
      .single()

    if (error) {
      console.error(`❌ Marka hatası (${brand.name}):`, error)
    } else {
      brandMap[brand.name] = data.id
      console.log(`✅ ${brand.name} (${brand.category})`)
    }
  }

  // 3. Audi modelleri ekle
  console.log('\n🚘 Audi modelleri yükleniyor...')
  
  const audiBrandId = brandMap['Audi']
  if (!audiBrandId) {
    console.error('❌ Audi markası bulunamadı!')
    return
  }

  const audiModels = [
    'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'Q2', 'Q3', 'Q5', 'Q7', 'Q8',
    'TT', 'R8',
    'e-tron', 'e-tron GT',
  ]

  for (const model of audiModels) {
    // Önce var mı kontrol et
    const { data: existing } = await supabase
      .from('vehicle_models')
      .select('id')
      .eq('name', model)
      .eq('brand_id', audiBrandId)
      .single()

    if (existing) {
      console.log(`⏭️  Audi ${model} (zaten var)`)
      continue
    }

    const { error } = await supabase
      .from('vehicle_models')
      .insert({ name: model, brand_id: audiBrandId, is_active: true })

    if (error) {
      console.error(`❌ Model hatası (${model}):`, error)
    } else {
      console.log(`✅ Audi ${model}`)
    }
  }

  // 4. Diğer popüler modeller
  console.log('\n🚘 Diğer popüler modeller yükleniyor...')

  const otherModels = [
    { brand: 'BMW', models: ['1 Serisi', '3 Serisi', '5 Serisi', 'X1', 'X3', 'X5'] },
    { brand: 'Mercedes-Benz', models: ['A Serisi', 'C Serisi', 'E Serisi', 'GLA', 'GLC', 'GLE'] },
    { brand: 'Volkswagen', models: ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc'] },
    { brand: 'Toyota', models: ['Corolla', 'Yaris', 'Camry', 'RAV4', 'C-HR'] },
    { brand: 'Renault', models: ['Clio', 'Megane', 'Taliant', 'Captur', 'Kadjar'] },
  ]

  for (const { brand, models } of otherModels) {
    const brandId = brandMap[brand]
    if (!brandId) continue

    for (const model of models) {
      // Önce var mı kontrol et
      const { data: existing } = await supabase
        .from('vehicle_models')
        .select('id')
        .eq('name', model)
        .eq('brand_id', brandId)
        .single()

      if (existing) {
        console.log(`⏭️  ${brand} ${model} (zaten var)`)
        continue
      }

      const { error } = await supabase
        .from('vehicle_models')
        .insert({ name: model, brand_id: brandId, is_active: true })

      if (error) {
        console.error(`❌ Model hatası (${brand} ${model}):`, error)
      } else {
        console.log(`✅ ${brand} ${model}`)
      }
    }
  }

  console.log('\n✅ Araç verileri başarıyla yüklendi! 🎉')
}

// Script çalıştır
seedVehicleData()
  .then(() => {
    console.log('\n🏁 İşlem tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Hata:', error)
    process.exit(1)
  })

