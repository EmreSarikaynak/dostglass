#!/usr/bin/env node

/**
 * Kapsamlı Araç Veritabanı Seed Script
 * Binek araç kategorisi için tüm popüler markalar ve modeller
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

// Binek araç markaları ve modelleri (Türkiye pazarında popüler)
const VEHICLE_DATA = {
  'Audi': [
    // A Serisi
    'A1', 'A1 Sportback', 'A3', 'A3 Sedan', 'A3 Sportback', 'A3 Cabriolet',
    'A4', 'A4 Sedan', 'A4 Avant', 'A4 Allroad',
    'A5', 'A5 Coupe', 'A5 Sportback', 'A5 Cabriolet',
    'A6', 'A6 Sedan', 'A6 Avant', 'A6 Allroad',
    'A7 Sportback', 'A8', 'A8 L',
    // Q Serisi (SUV)
    'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q4 Sportback e-tron',
    'Q5', 'Q5 Sportback', 'Q7', 'Q8', 'Q8 e-tron',
    // Spor Modeller
    'TT Coupe', 'TT Roadster', 'R8 Coupe', 'R8 Spyder',
    // Elektrikli
    'e-tron GT', 'RS e-tron GT',
    // RS Serisi
    'RS3', 'RS4 Avant', 'RS5', 'RS6 Avant', 'RS7', 'RS Q3', 'RS Q8'
  ],
  
  'BMW': [
    // Seri 1-8
    '1 Serisi', '116i', '118i', '120i', '120d', 'M135i',
    '2 Serisi', '218i', '220i', '220d', 'M240i',
    '3 Serisi', '318i', '320i', '320d', '330i', '330d', 'M340i',
    '4 Serisi', '420i', '430i', '440i', 'M440i',
    '5 Serisi', '520i', '520d', '530i', '530d', '540i', 'M550i',
    '6 Serisi Gran Turismo', '630i', '640i',
    '7 Serisi', '730d', '740i', '750i', '760Li',
    '8 Serisi', '840i', '850i', 'M850i',
    // X Serisi (SUV)
    'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7',
    'iX1', 'iX3', 'iX',
    // Z Serisi
    'Z4',
    // i Serisi (Elektrikli)
    'i3', 'i4', 'i7', 'iX',
    // M Serisi
    'M2', 'M3', 'M4', 'M5', 'M8'
  ],
  
  'Mercedes-Benz': [
    // A Serisi
    'A 150', 'A 160', 'A 180', 'A 200', 'A 220', 'A 250', 'A 35 AMG', 'A 45 AMG',
    // B Serisi
    'B 180', 'B 200', 'B 220',
    // C Serisi
    'C 180', 'C 200', 'C 220', 'C 250', 'C 300', 'C 350', 'C 43 AMG', 'C 63 AMG',
    // E Serisi
    'E 180', 'E 200', 'E 220', 'E 250', 'E 300', 'E 350', 'E 400', 'E 43 AMG', 'E 53 AMG', 'E 63 AMG',
    // S Serisi
    'S 300', 'S 350', 'S 400', 'S 450', 'S 500', 'S 560', 'S 63 AMG', 'S 65 AMG',
    // CLA
    'CLA 180', 'CLA 200', 'CLA 220', 'CLA 250', 'CLA 35 AMG', 'CLA 45 AMG',
    // CLS
    'CLS 350', 'CLS 400', 'CLS 450', 'CLS 53 AMG',
    // GLA (SUV)
    'GLA 180', 'GLA 200', 'GLA 220', 'GLA 250', 'GLA 35 AMG', 'GLA 45 AMG',
    // GLB (SUV)
    'GLB 180', 'GLB 200', 'GLB 220', 'GLB 250', 'GLB 35 AMG',
    // GLC (SUV)
    'GLC 200', 'GLC 220', 'GLC 250', 'GLC 300', 'GLC 43 AMG', 'GLC 63 AMG',
    // GLE (SUV)
    'GLE 300', 'GLE 350', 'GLE 400', 'GLE 450', 'GLE 53 AMG', 'GLE 63 AMG',
    // GLS (SUV)
    'GLS 350', 'GLS 400', 'GLS 450', 'GLS 500', 'GLS 580', 'GLS 63 AMG',
    // EQ (Elektrikli)
    'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQS SUV',
    // GT
    'AMG GT', 'AMG GT 4-Door', 'AMG GT 43', 'AMG GT 53', 'AMG GT 63'
  ],
  
  'Volkswagen': [
    // Polo
    'Polo', 'Polo Sedan', 'Polo GTI',
    // Golf
    'Golf', 'Golf GTI', 'Golf GTE', 'Golf GTD', 'Golf R',
    // Jetta
    'Jetta', 'Jetta GLI',
    // Passat
    'Passat', 'Passat Variant', 'Passat CC', 'Passat Alltrack',
    // Arteon
    'Arteon', 'Arteon Shooting Brake',
    // SUV
    'T-Cross', 'T-Roc', 'Tiguan', 'Tiguan Allspace', 'Touareg',
    // ID (Elektrikli)
    'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz'
  ],
  
  'Toyota': [
    // Yaris
    'Yaris', 'Yaris Cross', 'GR Yaris',
    // Corolla
    'Corolla', 'Corolla Sedan', 'Corolla Hatchback', 'Corolla Touring Sports', 'Corolla Cross',
    // Camry
    'Camry', 'Camry Hybrid',
    // Prius
    'Prius', 'Prius Plug-in',
    // Avalon
    'Avalon',
    // SUV
    'C-HR', 'RAV4', 'RAV4 Hybrid', 'Highlander', 'Land Cruiser',
    // bZ (Elektrikli)
    'bZ4X',
    // Spor
    'GR86', 'Supra'
  ],
  
  'Renault': [
    // Clio
    'Clio', 'Clio RS',
    // Megane
    'Megane', 'Megane Sedan', 'Megane Hatchback', 'Megane RS', 'Megane E-Tech',
    // Fluence
    'Fluence',
    // Taliant
    'Taliant',
    // Kadjar
    'Kadjar',
    // Captur
    'Captur',
    // Koleos
    'Koleos',
    // Austral
    'Austral',
    // ZOE (Elektrikli)
    'ZOE'
  ],
  
  'Ford': [
    // Fiesta
    'Fiesta', 'Fiesta ST',
    // Focus
    'Focus', 'Focus Sedan', 'Focus Hatchback', 'Focus ST', 'Focus RS',
    // Mondeo
    'Mondeo', 'Mondeo Sedan', 'Mondeo Wagon',
    // Mustang
    'Mustang', 'Mustang Mach-E',
    // SUV
    'Puma', 'Kuga', 'Explorer', 'Edge'
  ],
  
  'Opel': [
    // Corsa
    'Corsa', 'Corsa-e',
    // Astra
    'Astra', 'Astra Sedan', 'Astra Sports Tourer',
    // Insignia
    'Insignia', 'Insignia Grand Sport', 'Insignia Sports Tourer',
    // SUV
    'Crossland', 'Grandland', 'Mokka', 'Mokka-e'
  ],
  
  'Peugeot': [
    // 208
    '208', 'e-208',
    // 308
    '308', '308 SW',
    // 508
    '508', '508 SW',
    // SUV
    '2008', 'e-2008', '3008', '5008'
  ],
  
  'Citroën': [
    // C3
    'C3', 'C3 Aircross',
    // C4
    'C4', 'ë-C4', 'C4 Cactus',
    // C5
    'C5 Aircross', 'C5 X'
  ],
  
  'Fiat': [
    // 500
    '500', '500e', '500X', '500L',
    // Tipo
    'Tipo', 'Tipo Sedan', 'Tipo Hatchback', 'Tipo Cross',
    // Egea
    'Egea', 'Egea Sedan', 'Egea Hatchback', 'Egea Cross'
  ],
  
  'Honda': [
    // Civic
    'Civic', 'Civic Sedan', 'Civic Hatchback', 'Civic Type R',
    // Accord
    'Accord',
    // SUV
    'HR-V', 'CR-V', 'e:Ny1'
  ],
  
  'Hyundai': [
    // i10
    'i10',
    // i20
    'i20', 'i20 N',
    // i30
    'i30', 'i30 Fastback', 'i30 N',
    // Elantra
    'Elantra',
    // Sonata
    'Sonata',
    // SUV
    'Bayon', 'Kona', 'Kona Electric', 'Tucson', 'Santa Fe', 'Nexo',
    // IONIQ
    'IONIQ 5', 'IONIQ 6'
  ],
  
  'Kia': [
    // Picanto
    'Picanto',
    // Rio
    'Rio',
    // Ceed
    'Ceed', 'Ceed SW', 'Ceed GT',
    // Stinger
    'Stinger',
    // K5
    'K5',
    // SUV
    'Stonic', 'Niro', 'Sportage', 'Sorento', 'EV6', 'EV9'
  ],
  
  'Mazda': [
    // 2
    'Mazda2',
    // 3
    'Mazda3', 'Mazda3 Sedan', 'Mazda3 Hatchback',
    // 6
    'Mazda6', 'Mazda6 Sedan', 'Mazda6 Wagon',
    // SUV
    'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-30'
  ],
  
  'Nissan': [
    // Micra
    'Micra',
    // Note
    'Note',
    // Juke
    'Juke',
    // Qashqai
    'Qashqai',
    // X-Trail
    'X-Trail',
    // Ariya
    'Ariya',
    // Leaf
    'Leaf',
    // 370Z
    '370Z'
  ],
  
  'Seat': [
    // Ibiza
    'Ibiza',
    // Leon
    'Leon', 'Leon Sportstourer', 'Leon Cupra',
    // SUV
    'Arona', 'Ateca', 'Tarraco'
  ],
  
  'Skoda': [
    // Fabia
    'Fabia',
    // Scala
    'Scala',
    // Octavia
    'Octavia', 'Octavia Combi', 'Octavia RS',
    // Superb
    'Superb', 'Superb Combi',
    // SUV
    'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq iV'
  ],
  
  'Volvo': [
    // S Serisi (Sedan)
    'S60', 'S90',
    // V Serisi (Wagon)
    'V60', 'V60 Cross Country', 'V90', 'V90 Cross Country',
    // XC Serisi (SUV)
    'XC40', 'XC40 Recharge', 'XC60', 'XC90',
    // C40
    'C40 Recharge'
  ],
  
  'Alfa Romeo': [
    // Giulietta
    'Giulietta',
    // Giulia
    'Giulia', 'Giulia Quadrifoglio',
    // Stelvio
    'Stelvio', 'Stelvio Quadrifoglio',
    // Tonale
    'Tonale'
  ],
  
  'Mini': [
    // Cooper
    'Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW',
    // Countryman
    'Countryman', 'Countryman ALL4',
    // Clubman
    'Clubman'
  ],
  
  'Porsche': [
    // 718
    '718 Boxster', '718 Cayman',
    // 911
    '911 Carrera', '911 Carrera S', '911 Turbo', '911 GT3',
    // Panamera
    'Panamera', 'Panamera 4', 'Panamera Turbo',
    // SUV
    'Macan', 'Cayenne', 'Cayenne Coupe',
    // Elektrikli
    'Taycan', 'Taycan Cross Turismo'
  ],
  
  'Dacia': [
    'Sandero', 'Sandero Stepway', 'Logan', 'Duster', 'Jogger', 'Spring'
  ],
  
  'Suzuki': [
    'Swift', 'Swift Sport', 'Baleno', 'Vitara', 'S-Cross', 'Ignis', 'Jimny'
  ],
  
  'Mitsubishi': [
    'Mirage', 'Lancer', 'Eclipse Cross', 'Outlander', 'Outlander PHEV', 'ASX'
  ],
  
  'Subaru': [
    'Impreza', 'WRX', 'BRZ', 'Legacy', 'Outback', 'Forester', 'XV', 'Solterra'
  ],
  
  'Lexus': [
    'CT', 'IS', 'ES', 'LS', 'UX', 'NX', 'RX', 'LX', 'LC', 'RC'
  ],
  
  'Infiniti': [
    'Q30', 'Q50', 'Q60', 'QX30', 'QX50', 'QX55', 'QX60'
  ],
  
  'Tesla': [
    'Model 3', 'Model S', 'Model X', 'Model Y'
  ],
  
  'Jaguar': [
    'XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'
  ],
  
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'
  ],
  
  'Jeep': [
    'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Avenger'
  ],
  
  'Dodge': [
    'Charger', 'Challenger'
  ],
  
  'Chevrolet': [
    'Spark', 'Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette'
  ],
  
  'Cadillac': [
    'CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'
  ],
  
  'Genesis': [
    'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'
  ],
  
  'DS': [
    'DS 3', 'DS 3 Crossback', 'DS 4', 'DS 7 Crossback', 'DS 9'
  ],
  
  'Lynk & Co': [
    '01', '02', '03'
  ]
}

async function main() {
  console.log('🚗 Kapsamlı Araç Veritabanı Seed Başlıyor...\n')

  try {
    // 1. Binek Araç kategorisini bul
    console.log('📁 Binek Araç kategorisi kontrol ediliyor...')
    const { data: categories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .eq('name', 'Binek Araç')
      .single()

    if (!categories) {
      console.error('❌ Binek Araç kategorisi bulunamadı!')
      process.exit(1)
    }

    const categoryId = categories.id
    console.log(`✅ Kategori bulundu: ${categories.name} (${categoryId})\n`)

    // 2. Her marka için işlem yap
    const brands = Object.keys(VEHICLE_DATA)
    console.log(`📊 Toplam ${brands.length} marka işlenecek\n`)

    for (let i = 0; i < brands.length; i++) {
      const brandName = brands[i]
      const models = VEHICLE_DATA[brandName as keyof typeof VEHICLE_DATA]
      
      console.log(`[${i + 1}/${brands.length}] 🏷️  ${brandName} markası işleniyor...`)

      // Markayı upsert et
      const { data: brand, error: brandError } = await supabase
        .from('vehicle_brands')
        .select('id')
        .eq('name', brandName)
        .eq('category_id', categoryId)
        .maybeSingle()

      let brandId: string

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
          console.error(`   ⚠️  Model eklenemedi: ${modelName}`, modelError)
        } else {
          addedCount++
        }
      }

      console.log(`   📦 ${addedCount} model eklendi, ${skippedCount} model zaten vardı (Toplam: ${models.length})`)
      console.log('')
    }

    // 3. Özet
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SEED İŞLEMİ TAMAMLANDI!')
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
    console.log('\n✅ Tüm markalar ve modeller başarıyla yüklendi!\n')

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error)
    process.exit(1)
  }
}

main()

