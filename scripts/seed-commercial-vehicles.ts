#!/usr/bin/env node

/**
 * Ticari Araç Veritabanı Seed Script
 * Kamyonet, Panelvan, Minibüs, Kamyon kategorileri için tüm popüler markalar ve modeller
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

// .env.local dosyasını yükle
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase credentials eksik!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Ticari araç markaları ve modelleri
const COMMERCIAL_VEHICLE_DATA = {
  'Ford': [
    // Transit Serisi
    'Transit', 'Transit Custom', 'Transit Connect', 'Transit Courier',
    'Transit Minibus', 'Transit Kamyonet', 'Transit Panelvan',
    'Transit 350', 'Transit 470',
    // Ranger
    'Ranger', 'Ranger Raptor', 'Ranger Wildtrak', 'Ranger XLT',
    // Cargo
    'Cargo 1833', 'Cargo 2533', 'Cargo 3542'
  ],
  
  'Mercedes-Benz': [
    // Sprinter
    'Sprinter', 'Sprinter 311', 'Sprinter 313', 'Sprinter 315', 'Sprinter 316',
    'Sprinter 319', 'Sprinter 411', 'Sprinter 413', 'Sprinter 416', 'Sprinter 419',
    'Sprinter Panelvan', 'Sprinter Minibus', 'Sprinter Kamyonet',
    // Vito
    'Vito', 'Vito 109', 'Vito 111', 'Vito 114', 'Vito 116', 'Vito 119',
    'Vito Tourer', 'Vito Mixto', 'Vito Panelvan',
    // Citan
    'Citan', 'Citan 108', 'Citan 109', 'Citan 111',
    // X-Class (Pickup)
    'X-Class', 'X 220d', 'X 250d', 'X 350d',
    // Kamyonlar
    'Atego 815', 'Atego 817', 'Atego 1018', 'Atego 1222', 'Atego 1224', 'Atego 1324',
    'Axor 1829', 'Axor 1833', 'Axor 1840', 'Axor 2533', 'Axor 2540', 'Axor 3340',
    'Actros 1841', 'Actros 1843', 'Actros 1845', 'Actros 2541', 'Actros 2543', 'Actros 2545',
    'Arocs 2636', 'Arocs 3340', 'Arocs 3345', 'Arocs 4145'
  ],
  
  'Volkswagen': [
    // Transporter
    'Transporter', 'Transporter T5', 'Transporter T6', 'Transporter T6.1',
    'Transporter Panelvan', 'Transporter Kombi', 'Transporter Kasten',
    'Transporter Caravelle',
    // Caddy
    'Caddy', 'Caddy Cargo', 'Caddy Maxi', 'Caddy Kombi',
    // Crafter
    'Crafter', 'Crafter 35', 'Crafter 50', 'Crafter Panelvan', 'Crafter Minibus',
    // Amarok
    'Amarok', 'Amarok Aventura', 'Amarok Highline', 'Amarok Trendline'
  ],
  
  'Fiat': [
    // Ducato
    'Ducato', 'Ducato 35', 'Ducato 40', 'Ducato Maxi', 'Ducato Minibus',
    'Ducato Panelvan', 'Ducato Kamyonet',
    // Doblo
    'Doblo', 'Doblo Cargo', 'Doblo Maxi', 'Doblo Combi',
    // Fiorino
    'Fiorino', 'Fiorino Cargo',
    // Fullback (Pickup)
    'Fullback', 'Fullback Cross'
  ],
  
  'Renault': [
    // Master
    'Master', 'Master L1H1', 'Master L2H2', 'Master L3H2', 'Master L4H2',
    'Master Panelvan', 'Master Minibus', 'Master Kamyonet',
    // Trafic
    'Trafic', 'Trafic Combi', 'Trafic Panelvan',
    // Kangoo
    'Kangoo', 'Kangoo Express', 'Kangoo Maxi',
    // Alaskan (Pickup)
    'Alaskan'
  ],
  
  'Peugeot': [
    // Boxer
    'Boxer', 'Boxer L1H1', 'Boxer L2H2', 'Boxer L3H2', 'Boxer L4H3',
    'Boxer Panelvan', 'Boxer Minibus',
    // Expert
    'Expert', 'Expert Compact', 'Expert Standard', 'Expert Long',
    // Partner
    'Partner', 'Partner Cargo', 'Partner Tepee'
  ],
  
  'Citroën': [
    // Jumper
    'Jumper', 'Jumper L1H1', 'Jumper L2H2', 'Jumper L3H2', 'Jumper L4H3',
    'Jumper Panelvan', 'Jumper Minibus',
    // Jumpy
    'Jumpy', 'Jumpy Compact', 'Jumpy Standard', 'Jumpy XL',
    // Berlingo
    'Berlingo', 'Berlingo Van', 'Berlingo XL'
  ],
  
  'Opel': [
    // Movano
    'Movano', 'Movano L1H1', 'Movano L2H2', 'Movano L3H2',
    // Vivaro
    'Vivaro', 'Vivaro-e', 'Vivaro Combi', 'Vivaro Panelvan',
    // Combo
    'Combo', 'Combo Cargo', 'Combo-e Cargo'
  ],
  
  'Toyota': [
    // Hiace
    'Hiace', 'Hiace Panelvan', 'Hiace Minibus', 'Hiace Kamyonet',
    // Hilux
    'Hilux', 'Hilux Adventure', 'Hilux Legend', 'Hilux Extra Cabin',
    'Hilux Double Cabin', 'Hilux Single Cabin',
    // Proace
    'Proace', 'Proace City', 'Proace Verso', 'Proace Electric',
    // Dyna (Kamyon)
    'Dyna 150'
  ],
  
  'Nissan': [
    // NV Series
    'NV200', 'NV300', 'NV400',
    'NV200 Combi', 'NV300 Combi', 'NV400 Minibus',
    // Primastar
    'Primastar',
    // Navara
    'Navara', 'Navara Double Cabin', 'Navara King Cab', 'Navara Single Cab',
    // Cabstar
    'Cabstar', 'NT400 Cabstar'
  ],
  
  'Iveco': [
    // Daily
    'Daily', 'Daily 35', 'Daily 50', 'Daily 70',
    'Daily Panelvan', 'Daily Minibus', 'Daily Kamyonet',
    'Daily 35C15', 'Daily 35C17', 'Daily 50C15', 'Daily 50C17', 'Daily 70C17',
    // Eurocargo
    'Eurocargo 75E18', 'Eurocargo 75E21', 'Eurocargo 120E22', 'Eurocargo 120E25',
    'Eurocargo 160E25', 'Eurocargo 160E28',
    // Stralis
    'Stralis 360', 'Stralis 400', 'Stralis 420', 'Stralis 450', 'Stralis 460',
    // Trakker
    'Trakker 380', 'Trakker 410', 'Trakker 450'
  ],
  
  'MAN': [
    // TGE
    'TGE', 'TGE 3.140', 'TGE 3.180', 'TGE 5.180',
    // TGL
    'TGL 8.180', 'TGL 10.180', 'TGL 12.220', 'TGL 12.250',
    // TGM
    'TGM 13.250', 'TGM 15.250', 'TGM 18.280', 'TGM 18.320',
    // TGS
    'TGS 18.360', 'TGS 18.400', 'TGS 26.360', 'TGS 26.400', 'TGS 33.360', 'TGS 33.400',
    // TGX
    'TGX 18.440', 'TGX 18.480', 'TGX 26.440', 'TGX 26.480'
  ],
  
  'Isuzu': [
    // D-Max
    'D-Max', 'D-Max Double Cabin', 'D-Max Extended Cab', 'D-Max Single Cab',
    'D-Max V-Cross',
    // NPR
    'NPR 65', 'NPR 75',
    // NLR
    'NLR 55', 'NLR 85',
    // NMR
    'NMR 85',
    // NQR
    'NQR 70', 'NQR 90'
  ],
  
  'Mitsubishi': [
    // L200
    'L200', 'L200 Double Cabin', 'L200 Club Cabin', 'L200 Single Cabin',
    'L200 Warrior', 'L200 Barbarian',
    // Fuso Canter
    'Fuso Canter', 'Fuso Canter 3S13', 'Fuso Canter 7C15', 'Fuso Canter 9C18'
  ],
  
  'Hyundai': [
    // H350
    'H350', 'H350 Panelvan', 'H350 Minibus',
    // H-1
    'H-1', 'H-1 Travel', 'H-1 Cargo', 'H-1 Minibus',
    // Mighty
    'Mighty', 'Mighty EX6', 'Mighty EX8'
  ],
  
  'Kia': [
    // K2500
    'K2500', 'K2500S',
    // K2700
    'K2700',
    // Bongo
    'Bongo', 'Bongo III'
  ],
  
  'Maxus': [
    // Deliver
    'Deliver 3', 'Deliver 5', 'Deliver 7', 'Deliver 9',
    // eDeliver
    'eDeliver 3', 'eDeliver 9',
    // T60
    'T60 Pickup', 'T60 Double Cabin',
    // V80
    'V80', 'V80 Panelvan', 'V80 Minibus',
    // V90
    'V90', 'V90 Panelvan'
  ],
  
  'Karsan': [
    // Jest
    'Jest', 'Jest Electric',
    // e-ATA
    'e-ATA',
    // Atak
    'Atak', 'Atak Electric'
  ],
  
  'BMC': [
    // Levend
    'Levend', 'Levend Minibus',
    // Procity
    'Procity CNG',
    // Profesyonel
    'Profesyonel 522', 'Profesyonel 622', 'Profesyonel 821'
  ],
  
  'Otokar': [
    // Sultan
    'Sultan 1800', 'Sultan 1900', 'Sultan LF',
    // Doruk
    'Doruk', 'Doruk LE',
    // Kent
    'Kent', 'Kent LF', 'Kent Articulated'
  ],
  
  'Temsa': [
    // Avenue
    'Avenue', 'Avenue EV', 'Avenue Electron',
    // MD9
    'MD9', 'MD9 LE',
    // Maraton
    'Maraton', 'Maraton 9', 'Maraton 13',
    // Safir
    'Safir VIP'
  ],
  
  'Volkswagen Kamyon ve Bus': [
    // Delivery
    'Delivery 6.160', 'Delivery 9.170', 'Delivery 11.180',
    // Constellation
    'Constellation 13.180', 'Constellation 15.190', 'Constellation 17.280'
  ],
  
  'Scania': [
    // P Serisi
    'P 250', 'P 280', 'P 320', 'P 360', 'P 410',
    // G Serisi
    'G 340', 'G 360', 'G 410', 'G 450', 'G 500',
    // R Serisi
    'R 410', 'R 450', 'R 500', 'R 520', 'R 580',
    // S Serisi
    'S 450', 'S 500', 'S 520', 'S 580', 'S 650',
    // Otobüs
    'Interlink', 'Touring', 'Citywide'
  ],
  
  'Volvo': [
    // FE Serisi
    'FE 280', 'FE 320',
    // FL Serisi
    'FL 240', 'FL 280',
    // FM Serisi
    'FM 370', 'FM 410', 'FM 440', 'FM 460',
    // FH Serisi
    'FH 420', 'FH 460', 'FH 500', 'FH 540',
    // Otobüs
    'B8R', 'B11R', 'B13R', '9700', '9900'
  ],
  
  'DAF': [
    // LF Serisi
    'LF 210', 'LF 250', 'LF 280', 'LF 320',
    // CF Serisi
    'CF 340', 'CF 360', 'CF 400', 'CF 440',
    // XF Serisi
    'XF 440', 'XF 460', 'XF 480', 'XF 530'
  ],
  
  'Maxus (Hafif Ticari)': [
    'V80', 'V90', 'Deliver 9', 'T60', 'T70'
  ],
  
  'DFSK': [
    // K Series
    'K01S', 'K02S', 'K05S', 'K07S',
    // C Series
    'C31', 'C32', 'C35', 'C37'
  ],
  
  'Changan': [
    'Star Truck',
    'Hunter Pickup'
  ],
  
  'Great Wall': [
    'Wingle 5', 'Wingle 7', 'Poer'
  ],
  
  'JAC': [
    'X200', 'T6', 'T8'
  ],
  
  'Foton': [
    // Aumark
    'Aumark', 'Aumark S',
    // Auman
    'Auman ETX', 'Auman GTL'
  ],
  
  'Dodge': [
    'Ram 1500', 'Ram 2500', 'Ram 3500',
    'Ram ProMaster'
  ],
  
  'Chevrolet': [
    'Express Cargo', 'Express Passenger',
    'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD'
  ],
  
  'GMC': [
    'Savana Cargo', 'Savana Passenger',
    'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD'
  ]
}

async function main() {
  console.log('🚚 Ticari Araç Veritabanı Seed Başlıyor...\n')

  try {
    // 1. Ticari Araç kategorisini bul
    console.log('📁 Ticari Araç kategorisi kontrol ediliyor...')
    const { data: categories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .eq('name', 'Ticari Araç')
      .single()

    if (!categories) {
      console.error('❌ Ticari Araç kategorisi bulunamadı!')
      process.exit(1)
    }

    const categoryId = categories.id
    console.log(`✅ Kategori bulundu: ${categories.name} (${categoryId})\n`)

    // 2. Her marka için işlem yap
    const brands = Object.keys(COMMERCIAL_VEHICLE_DATA)
    console.log(`📊 Toplam ${brands.length} marka işlenecek\n`)

    let totalBrandsAdded = 0
    let totalModelsAdded = 0

    for (let i = 0; i < brands.length; i++) {
      const brandName = brands[i]
      const models = COMMERCIAL_VEHICLE_DATA[brandName as keyof typeof COMMERCIAL_VEHICLE_DATA]
      
      console.log(`[${i + 1}/${brands.length}] 🏷️  ${brandName} markası işleniyor...`)

      // Markayı upsert et
      const { data: brand, error: brandError } = await supabase
        .from('vehicle_brands')
        .select('id')
        .eq('name', brandName)
        .eq('category_id', categoryId)
        .maybeSingle()

      let brandId: string

      if (brandError) {
        console.error(`   ❌ Marka sorgulanamadı: ${brandName}`, brandError)
        continue
      }

      if (brand) {
        brandId = brand.id
        console.log(`   ↳ Marka zaten var: ${brandName}`)
      } else {
        const { data: newBrand, error: insertError } = await supabase
          .from('vehicle_brands')
          .insert({
            name: brandName,
            category_id: categoryId,
            is_active: true,
          })
          .select('id')
          .single()

        if (insertError || !newBrand) {
          console.error(`   ❌ Marka eklenemedi: ${brandName}`, insertError)
          continue
        }

        brandId = newBrand.id
        totalBrandsAdded++
        console.log(`   ✅ Marka eklendi: ${brandName}`)
      }

      // Modelleri ekle
      let addedCount = 0
      let skippedCount = 0

      for (const modelName of models) {
        // Model var mı kontrol et
        const { data: existingModel } = await supabase
          .from('vehicle_models')
          .select('id')
          .eq('name', modelName)
          .eq('brand_id', brandId)
          .maybeSingle()

        if (existingModel) {
          skippedCount++
          continue
        }

        // Modeli ekle
        const { error: modelError } = await supabase
          .from('vehicle_models')
          .insert({
            name: modelName,
            brand_id: brandId,
            is_active: true,
          })

        if (modelError) {
          console.error(`   ⚠️  Model eklenemedi: ${modelName}`, modelError.message)
        } else {
          addedCount++
          totalModelsAdded++
        }
      }

      console.log(`   📦 ${addedCount} model eklendi, ${skippedCount} model zaten vardı (Toplam: ${models.length})`)
      console.log('')
    }

    // 3. Özet
    console.log('\n' + '='.repeat(60))
    console.log('🎉 TİCARİ ARAÇ SEED İŞLEMİ TAMAMLANDI!')
    console.log('='.repeat(60))
    
    const { count: totalBrands } = await supabase
      .from('vehicle_brands')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    const { count: totalModels } = await supabase
      .from('vehicle_models')
      .select('*, vehicle_brands!inner(*)', { count: 'exact', head: true })
      .eq('vehicle_brands.category_id', categoryId)

    console.log(`\n📊 Veritabanı İstatistikleri:`)
    console.log(`   Toplam Marka: ${totalBrands}`)
    console.log(`   Toplam Model: ${totalModels}`)
    console.log(`   Bu session'da eklenen marka: ${totalBrandsAdded}`)
    console.log(`   Bu session'da eklenen model: ${totalModelsAdded}`)
    console.log('\n✅ Tüm ticari araç markaları ve modelleri başarıyla yüklendi!\n')

    console.log('📋 Kategori Özeti:')
    console.log('   • Hafif Ticari: Ford Transit, VW Caddy, Fiat Doblo, vb.')
    console.log('   • Orta Ticari: Mercedes Sprinter, VW Crafter, Fiat Ducato, vb.')
    console.log('   • Pickup: Ford Ranger, Toyota Hilux, Nissan Navara, vb.')
    console.log('   • Kamyon: Mercedes Actros, MAN TGX, Scania R Serisi, vb.')
    console.log('   • Otobüs: Temsa, Otokar, Mercedes, Scania, vb.')
    console.log('')

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error)
    process.exit(1)
  }
}

main()

