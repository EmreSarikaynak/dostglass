#!/usr/bin/env node

/**
 * Kalan Araç Kategorileri Seed Script
 * Çekici, Minibüs, Traktör, İş Makinesi, Motosiklet
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase credentials eksik!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Çekici kamyon markaları ve modelleri
const CEKICI_DATA = {
  'Mercedes-Benz': [
    'Actros 1841 LS', 'Actros 1843 LS', 'Actros 1845 LS', 'Actros 1851 LS',
    'Actros 2041 AS', 'Actros 2043 AS', 'Actros 2045 AS', 'Actros 2051 AS',
    'Actros 2541 LS', 'Actros 2543 LS', 'Actros 2545 LS', 'Actros 2551 LS'
  ],
  'Scania': [
    'R 410 LA', 'R 450 LA', 'R 500 LA', 'R 520 LA', 'R 580 LA',
    'S 450 LA', 'S 500 LA', 'S 520 LA', 'S 580 LA', 'S 650 LA',
    'G 410 LA', 'G 450 LA', 'G 500 LA'
  ],
  'MAN': [
    'TGX 18.440', 'TGX 18.480', 'TGX 18.500', 'TGX 18.560',
    'TGX 26.440', 'TGX 26.480', 'TGX 26.500', 'TGX 26.560',
    'TGS 18.440', 'TGS 18.480'
  ],
  'Volvo': [
    'FH 420', 'FH 460', 'FH 500', 'FH 540', 'FH 580',
    'FH16 750', 'FH16 600', 'FM 440', 'FM 500'
  ],
  'DAF': [
    'XF 440 FT', 'XF 480 FT', 'XF 530 FT',
    'CF 440 FT', 'CF 480 FT'
  ],
  'Iveco': [
    'Stralis Hi-Way 440', 'Stralis Hi-Way 460', 'Stralis Hi-Way 500',
    'S-Way 440', 'S-Way 460', 'S-Way 510'
  ],
  'Renault Trucks': [
    'T 440', 'T 460', 'T 480', 'T 520',
    'C 440', 'C 460'
  ],
  'Ford Trucks': [
    'F-MAX 420', 'F-MAX 460', 'F-MAX 500'
  ]
}

// Minibüs markaları ve modelleri
const MINIBUS_DATA = {
  'Mercedes-Benz': [
    'Sprinter 516', 'Sprinter 519', 'Sprinter 524',
    'Vito Tourer Pro', 'Vito Tourer Select'
  ],
  'Ford': [
    'Transit 460 L', 'Transit 460 EL',
    'Transit Custom Kombi', 'Transit Tourneo'
  ],
  'Volkswagen': [
    'Crafter Minibus', 'Crafter City 35', 'Crafter City 50',
    'Caravelle', 'Multivan'
  ],
  'Fiat': [
    'Ducato Minibus 16+1', 'Ducato Minibus 18+1'
  ],
  'Peugeot': [
    'Boxer Minibus', 'Traveller VIP', 'Traveller Business'
  ],
  'Citroën': [
    'Jumper Minibus', 'SpaceTourer Business', 'SpaceTourer XL'
  ],
  'Renault': [
    'Master Minibus', 'Trafic Combi', 'Trafic SpaceClass'
  ],
  'Iveco': [
    'Daily Minibus 516', 'Daily Minibus 519', 'Daily City'
  ],
  'Toyota': [
    'Hiace Minibus 15+1', 'Coaster'
  ],
  'Hyundai': [
    'H350 Minibus', 'H-1 Travel', 'County'
  ],
  'Karsan': [
    'Jest', 'Jest Electric', 'e-ATA'
  ],
  'BMC': [
    'Levend Minibus', 'Levend 150'
  ],
  'Otokar': [
    'Navigo', 'Navigo U'
  ],
  'Temsa': [
    'Avenue', 'Avenue Electron', 'Avenue EV'
  ]
}

// Traktör markaları ve modelleri
const TRAKTOR_DATA = {
  'New Holland': [
    // T4 Serisi
    'T4.55', 'T4.65', 'T4.75', 'T4.85', 'T4.95', 'T4.105',
    // T5 Serisi
    'T5.95', 'T5.105', 'T5.115', 'T5.120',
    // T6 Serisi
    'T6.140', 'T6.150', 'T6.160', 'T6.175', 'T6.180',
    // T7 Serisi
    'T7.210', 'T7.230', 'T7.245', 'T7.260', 'T7.270',
    // T8 Serisi
    'T8.380', 'T8.410', 'T8.435'
  ],
  'John Deere': [
    // 5 Serisi
    '5055E', '5065E', '5075E', '5085E', '5090E', '5100E',
    // 6 Serisi
    '6095B', '6105B', '6110B', '6120B', '6130B', '6140B',
    '6145R', '6155R', '6175R', '6195R',
    // 7 Serisi
    '7215R', '7230R', '7250R', '7270R',
    // 8 Serisi
    '8295R', '8320R', '8345R', '8370R'
  ],
  'Massey Ferguson': [
    // MF 3600 Serisi
    '3625', '3635', '3645', '3655', '3660',
    // MF 5700 Serisi
    '5708', '5709', '5710', '5711', '5712', '5713',
    // MF 6700 Serisi
    '6712', '6713', '6714', '6715', '6716', '6718',
    // MF 7700 Serisi
    '7714', '7715', '7716', '7718', '7719', '7720',
    // MF 8700 Serisi
    '8727', '8730', '8732', '8735', '8737'
  ],
  'Case IH': [
    'Farmall 55C', 'Farmall 65C', 'Farmall 75C', 'Farmall 85C', 'Farmall 95C',
    'Maxxum 115', 'Maxxum 125', 'Maxxum 135', 'Maxxum 145',
    'Puma 165', 'Puma 175', 'Puma 185', 'Puma 195',
    'Magnum 280', 'Magnum 310', 'Magnum 340', 'Magnum 380'
  ],
  'Deutz-Fahr': [
    'Agroplus 70', 'Agroplus 75', 'Agroplus 80', 'Agroplus 85',
    'Agrofarm 420', 'Agrofarm 430',
    'Agrotron 6155', 'Agrotron 6165', 'Agrotron 6175', 'Agrotron 6185',
    '9310 TTV', '9320 TTV', '9340 TTV'
  ],
  'Fendt': [
    '200 Vario', '210 Vario', '211 Vario', '212 Vario',
    '312 Vario', '313 Vario', '314 Vario', '316 Vario',
    '516 Vario', '518 Vario', '720 Vario', '722 Vario', '724 Vario',
    '828 Vario', '930 Vario', '936 Vario', '939 Vario',
    '1042 Vario', '1046 Vario', '1050 Vario'
  ],
  'Valtra': [
    'A75', 'A85', 'A95', 'A105', 'A115',
    'N104', 'N114', 'N124', 'N134', 'N154',
    'T174', 'T194', 'T214', 'T234'
  ],
  'Landini': [
    'Powerfarm 85', 'Powerfarm 95', 'Powerfarm 105',
    'Landpower 125', 'Landpower 135', 'Landpower 145',
    '6-175', '7-210', '7-230'
  ],
  'Erkunt': [
    'Bereket 75', 'Bereket 85', 'Bereket 95',
    'Nimet 65', 'Nimet 75'
  ],
  'Tümosan': [
    '50.50', '60.60', '70.70', '80.80', '90.90',
    '105 NT', '115 NT', '125 NT'
  ]
}

// İş Makinesi markaları ve modelleri
const IS_MAKINESI_DATA = {
  'Caterpillar': [
    // Ekskavatör
    '305.5E2 CR', '308 CR', '312 GC', '313D2 GC', '315 GC', '320 GC',
    '323', '326', '330', '336',
    // Buldozer
    'D4K2', 'D5K2', 'D6K2', 'D6T', 'D7E', 'D8T', 'D9T', 'D11T',
    // Greyder
    '120M', '140M', '160M', '180M',
    // Yükleyici
    '950 GC', '962M', '966M', '972M', '980M',
    // Kompaktör
    'CS44', 'CS54', 'CS64', 'CS74',
    // Forklift
    'EP16', 'EP18', 'EP20', 'DP25N', 'DP30N', 'DP40N'
  ],
  'Komatsu': [
    // Ekskavatör
    'PC138US-11', 'PC200-8', 'PC210-11', 'PC228US-11', 'PC290-11', 'PC350-8',
    // Buldozer
    'D37PX-24', 'D51PX-24', 'D61PX-24', 'D85EX-18', 'D155AX-8',
    // Greyder
    'GD555-5', 'GD675-5',
    // Yükleyici
    'WA200-8', 'WA320-8', 'WA380-8', 'WA470-8', 'WA500-8'
  ],
  'JCB': [
    // Beko Loder
    '3CX', '4CX', '5CX',
    // Ekskavatör
    'JS130', 'JS160', 'JS180', 'JS200', 'JS220', 'JS240',
    // Yükleyici
    '411', '416', '426', '436', '456',
    // Forklift
    'TLT20D', 'TLT25D', 'TLT30D', 'TLT35D'
  ],
  'Volvo': [
    // Ekskavatör
    'EC140E', 'EC200E', 'EC220E', 'EC300E', 'EC380E',
    // Yükleyici
    'L60H', 'L90H', 'L110H', 'L120H', 'L150H', 'L180H',
    // Damper
    'A25G', 'A30G', 'A35G', 'A40G'
  ],
  'Hitachi': [
    // Ekskavatör
    'ZX135US-6', 'ZX160LC-6', 'ZX200-6', 'ZX210-6', 'ZX250-6', 'ZX350-6'
  ],
  'Hyundai': [
    // Ekskavatör
    'HX145 LCR', 'HX160 L', 'HX220 L', 'HX235 LCR', 'HX300 L',
    // Yükleyici
    'HL940', 'HL955', 'HL960', 'HL965'
  ],
  'Hidromek': [
    // Ekskavatör
    'HMK 140 LC', 'HMK 200 LC', 'HMK 220 LC', 'HMK 300 LC', 'HMK 370 LC',
    // Beko Loder
    'HMK 102 B', 'HMK 102 S', 'HMK 107 S'
  ],
  'New Holland': [
    // Beko Loder
    'B90B', 'B95B', 'B110B', 'B115B',
    // Ekskavatör
    'E135B SR', 'E175B', 'E215B', 'E245B'
  ],
  'Case': [
    // Beko Loder
    '580 Super N', '580 Super R', '590 Super R',
    // Ekskavatör
    'CX130C', 'CX145C SR', 'CX210C', 'CX245D SR',
    // Yükleyici
    '521F', '621F', '721F', '821F'
  ],
  'Bobcat': [
    // Mini Yükleyici
    'S450', 'S510', 'S530', 'S550', 'S570', 'S590',
    'S630', 'S650', 'S740', 'S770', 'S850',
    // Mini Ekskavatör
    'E17', 'E19', 'E26', 'E32', 'E35', 'E50', 'E55'
  ],
  'Doosan': [
    // Ekskavatör
    'DX140W-5', 'DX160W-5', 'DX180LC-5', 'DX225LC-5', 'DX300LC-5',
    // Yükleyici
    'DL200-5', 'DL250-5', 'DL300-5', 'DL420-5'
  ],
  'Liebherr': [
    // Ekskavatör
    'R 914 Compact', 'R 920', 'R 924 Compact', 'R 934', 'R 944', 'R 954',
    // Yükleyici
    'L 509', 'L 514', 'L 524', 'L 538', 'L 550', 'L 566'
  ],
  'Manitou': [
    // Teleskopik
    'MT 625', 'MT 732', 'MT 1440', 'MT 1840',
    'MLT 625-75 H', 'MLT 733-115 D', 'MLT 840-115 PS', 'MLT 960'
  ],
  'Mitsubishi Forklift': [
    'FD15NT', 'FD18NT', 'FD20NT', 'FD25NT', 'FD30NT', 'FD35NT'
  ],
  'Toyota Forklift': [
    '8FD15', '8FD18', '8FD20', '8FD25', '8FD30', '8FD35'
  ],
  'Linde Forklift': [
    'H16T', 'H18T', 'H20T', 'H25T', 'H30T', 'H35T'
  ]
}

// Motosiklet markaları ve modelleri
const MOTOSIKLET_DATA = {
  'Honda': [
    // Super Sport
    'CBR1000RR-R Fireblade', 'CBR600RR', 'CBR500R', 'CBR300R',
    // Naked
    'CB1000R', 'CB650R', 'CB500F', 'CB300R', 'CB125R',
    // Adventure
    'Africa Twin', 'X-ADV', 'NC750X',
    // Cruiser
    'Rebel 1100', 'Rebel 500', 'Rebel 300',
    // Scooter
    'Forza 750', 'Forza 350', 'Forza 125', 'PCX 160', 'SH350i', 'SH150i', 'SH125i', 'Vision 110',
    // Touring
    'Gold Wing', 'NT1100'
  ],
  'Yamaha': [
    // Super Sport
    'YZF-R1', 'YZF-R7', 'YZF-R6', 'YZF-R125',
    // Naked
    'MT-10', 'MT-09', 'MT-07', 'MT-03', 'MT-125',
    // Adventure
    'Ténéré 700', 'Tracer 9', 'Tracer 7',
    // Cruiser
    'XV950 Bolt', 'Dragstar 650',
    // Scooter
    'TMAX Tech Max', 'TMAX', 'XMAX 300', 'XMAX 125', 'NMAX 155', 'NMAX 125', 'Aerox 155', 'Aerox 125',
    // Touring
    'FJR1300'
  ],
  'Kawasaki': [
    // Super Sport
    'Ninja ZX-10R', 'Ninja ZX-6R', 'Ninja 650', 'Ninja 400', 'Ninja 125',
    // Naked
    'Z H2', 'Z900', 'Z650', 'Z400', 'Z125',
    // Adventure
    'Versys 1000', 'Versys 650',
    // Cruiser
    'Vulcan S', 'Vulcan 900'
  ],
  'Suzuki': [
    // Super Sport
    'GSX-R1000', 'GSX-R750', 'GSX-R600', 'GSX-R125',
    // Naked
    'GSX-S1000', 'GSX-S750', 'GSX-S125',
    // Adventure
    'V-Strom 1050', 'V-Strom 650',
    // Cruiser
    'Boulevard M109R', 'Boulevard C50'
  ],
  'BMW': [
    // Super Sport
    'S 1000 RR', 'S 1000 R', 'M 1000 RR',
    // Naked
    'F 900 R', 'F 800 R',
    // Adventure
    'R 1250 GS', 'R 1250 GS Adventure', 'F 900 GS', 'F 850 GS', 'F 750 GS', 'G 310 GS',
    // Touring
    'K 1600 GTL', 'K 1600 GT', 'R 1250 RT',
    // Roadster
    'R 1250 R', 'R nineT', 'R 18',
    // Scooter
    'C 400 GT', 'C 400 X'
  ],
  'Ducati': [
    // Super Sport
    'Panigale V4', 'Panigale V4 S', 'Panigale V2',
    // Naked
    'Streetfighter V4', 'Streetfighter V2', 'Monster', 'Monster Plus',
    // Adventure
    'Multistrada V4', 'Multistrada V2', 'DesertX',
    // Cruiser
    'Diavel', 'XDiavel',
    // Scrambler
    'Scrambler Icon', 'Scrambler Desert Sled', 'Scrambler Nightshift'
  ],
  'KTM': [
    // Naked
    '1290 Super Duke R', '890 Duke', '790 Duke', '390 Duke', '250 Duke', '125 Duke',
    // Adventure
    '1290 Super Adventure', '890 Adventure', '790 Adventure', '390 Adventure',
    // Super Sport
    'RC 390', 'RC 125'
  ],
  'Aprilia': [
    // Super Sport
    'RSV4', 'RS 660',
    // Naked
    'Tuono V4', 'Tuono 660',
    // Scooter
    'SRV 850', 'SR GT 125', 'SR 50'
  ],
  'Triumph': [
    // Naked
    'Speed Triple 1200 RS', 'Street Triple R', 'Trident 660',
    // Adventure
    'Tiger 1200', 'Tiger 900', 'Tiger 850 Sport',
    // Cruiser
    'Rocket 3', 'Bonneville Bobber',
    // Retro
    'Bonneville T120', 'Scrambler 1200', 'Thruxton RS'
  ],
  'Harley-Davidson': [
    // Touring
    'Road Glide', 'Street Glide', 'Road King', 'Electra Glide',
    // Softail
    'Heritage Classic', 'Fat Boy', 'Low Rider', 'Breakout',
    // Sportster
    'Iron 883', 'Iron 1200', 'Forty-Eight',
    // CVO
    'CVO Road Glide', 'CVO Street Glide'
  ],
  'MV Agusta': [
    'F4', 'F3', 'Brutale 1000', 'Brutale 800', 'Dragster 800'
  ],
  'Vespa': [
    // Modern
    'GTS 300', 'GTS 125', 'GTS Super 300', 'GTS Super Sport 300',
    'Sprint 150', 'Sprint 125', 'Primavera 125', 'Primavera 50',
    // Elektrikli
    'Elettrica 70 km/h'
  ],
  'Piaggio': [
    'Beverly 300', 'Beverly 400', 'MP3 500', 'MP3 300', 'Liberty 150', 'Liberty 125'
  ],
  'Kymco': [
    'AK 550', 'Downtown 350i', 'X-Town 300i', 'Super Dink 300i', 'Agility 125'
  ],
  'SYM': [
    'Maxsym TL 500', 'Cruisym 300', 'Joymax Z 300', 'Fiddle III 125'
  ],
  'Mondial': [
    'HPS 125', 'SMX 125', 'Flat Track 125'
  ],
  'Motul': [
    'MH7', 'MT9', 'Passion 125'
  ],
  'Kanuni': [
    'Cheetah 250', 'Supermoto 250', 'Apache 125'
  ]
}

async function seedCategory(categoryName: string, vehicleData: Record<string, string[]>) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔄 ${categoryName} Kategorisi İşleniyor`)
  console.log('='.repeat(60) + '\n')

  // Kategoriyi bul
  const { data: category } = await supabase
    .from('vehicle_categories')
    .select('id')
    .eq('name', categoryName)
    .single()

  if (!category) {
    console.error(`❌ ${categoryName} kategorisi bulunamadı!`)
    return
  }

  const categoryId = category.id
  const brands = Object.keys(vehicleData)
  let totalBrandsAdded = 0
  let totalModelsAdded = 0

  for (let i = 0; i < brands.length; i++) {
    const brandName = brands[i]
    const models = vehicleData[brandName]
    
    console.log(`[${i + 1}/${brands.length}] 🏷️  ${brandName}`)

    // Marka var mı kontrol et
    const { data: existingBrand } = await supabase
      .from('vehicle_brands')
      .select('id')
      .eq('name', brandName)
      .maybeSingle()

    let brandId: string

    if (existingBrand) {
      brandId = existingBrand.id
      console.log(`   ↳ Marka mevcut`)
      
      // Kategorisini güncelle
      await supabase
        .from('vehicle_brands')
        .update({ category_id: categoryId })
        .eq('id', brandId)
    } else {
      const { data: newBrand, error } = await supabase
        .from('vehicle_brands')
        .insert({
          name: brandName,
          category_id: categoryId,
          is_active: true,
        })
        .select('id')
        .single()

      if (error || !newBrand) {
        console.error(`   ❌ Marka eklenemedi:`, error?.message)
        continue
      }

      brandId = newBrand.id
      totalBrandsAdded++
      console.log(`   ✅ Marka eklendi`)
    }

    // Modelleri ekle
    let addedCount = 0
    let skippedCount = 0

    for (const modelName of models) {
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

      const { error } = await supabase
        .from('vehicle_models')
        .insert({
          name: modelName,
          brand_id: brandId,
          is_active: true,
        })

      if (error) {
        console.error(`   ⚠️  ${modelName}:`, error.message)
      } else {
        addedCount++
        totalModelsAdded++
      }
    }

    console.log(`   📦 ${addedCount} model eklendi, ${skippedCount} zaten vardı (Toplam: ${models.length})`)
  }

  console.log(`\n✅ ${categoryName}: ${totalBrandsAdded} yeni marka, ${totalModelsAdded} yeni model eklendi`)
}

async function main() {
  console.log('🚀 Kalan Kategoriler Dolduruluyor...\n')

  try {
    // Kategorileri sırayla doldur
    await seedCategory('ÇEKİCİ', CEKICI_DATA)
    await seedCategory('MİNİBÜS', MINIBUS_DATA)
    await seedCategory('TRAKTÖR', TRAKTOR_DATA)
    await seedCategory('İŞ MAKİNESİ', IS_MAKINESI_DATA)
    await seedCategory('MOTOSİKLET', MOTOSIKLET_DATA)

    // Final özet
    console.log('\n' + '='.repeat(60))
    console.log('🎉 TÜM KATEGORİLER TAMAMLANDI!')
    console.log('='.repeat(60) + '\n')

    const { data: allCategories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .order('name')

    console.log('📊 Final Durum:\n')
    let grandTotalBrands = 0
    let grandTotalModels = 0

    for (const cat of allCategories || []) {
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      const { count: modelCount } = await supabase
        .from('vehicle_models')
        .select('*, vehicle_brands!inner(*)', { count: 'exact', head: true })
        .eq('vehicle_brands.category_id', cat.id)

      grandTotalBrands += brandCount || 0
      grandTotalModels += modelCount || 0

      const icon = brandCount && brandCount > 0 ? '✅' : '⚪'
      console.log(`  ${icon} ${cat.name}: ${brandCount} marka, ${modelCount} model`)
    }

    console.log(`\n📈 Toplam: ${grandTotalBrands} marka, ${grandTotalModels} model\n`)

  } catch (error) {
    console.error('\n❌ Hata:', error)
    process.exit(1)
  }
}

main()

