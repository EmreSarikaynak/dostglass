#!/usr/bin/env node

/**
 * Araç Kategorilerini Güncelleme Script
 * Ehliyet sınıflarına göre detaylı kategorilere geçiş
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

// Yeni kategori yapısı
const NEW_CATEGORIES = [
  'BİNEK',
  'KAMYON',
  'KAMYONET',
  'ÇEKİCİ',
  'MİNİBÜS',
  'OTOBÜS',
  'TRAKTÖR',
  'İŞ MAKİNESİ',
  'MOTOSİKLET'
]

async function main() {
  console.log('🔄 Araç Kategorileri Güncelleniyor...\n')

  try {
    // 1. Mevcut kategorileri al
    console.log('📊 Mevcut Durum:\n')
    const { data: oldCategories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .order('name')

    for (const cat of oldCategories || []) {
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      console.log(`  ${cat.name}: ${brandCount} marka`)
    }

    // 2. Yeni kategorileri oluştur
    console.log('\n🆕 Yeni Kategoriler Oluşturuluyor...\n')
    
    const newCategoryIds: Record<string, string> = {}
    
    for (const categoryName of NEW_CATEGORIES) {
      // Kategori zaten var mı kontrol et
      const { data: existing } = await supabase
        .from('vehicle_categories')
        .select('id')
        .eq('name', categoryName)
        .maybeSingle()

      if (existing) {
        console.log(`  ↳ ${categoryName} zaten var`)
        newCategoryIds[categoryName] = existing.id
      } else {
        const { data: newCat, error } = await supabase
          .from('vehicle_categories')
          .insert({ name: categoryName, is_active: true })
          .select('id')
          .single()

        if (error) {
          console.error(`  ❌ ${categoryName} oluşturulamadı:`, error)
        } else if (newCat) {
          console.log(`  ✅ ${categoryName} oluşturuldu`)
          newCategoryIds[categoryName] = newCat.id
        }
      }
    }

    // 3. Mevcut markaları yeni kategorilere taşı
    console.log('\n📦 Markalar Yeni Kategorilere Taşınıyor...\n')

    // Binek Araç → BİNEK
    const { data: oldBinek } = await supabase
      .from('vehicle_categories')
      .select('id')
      .eq('name', 'Binek Araç')
      .maybeSingle()

    if (oldBinek && newCategoryIds['BİNEK']) {
      const { count } = await supabase
        .from('vehicle_brands')
        .update({ category_id: newCategoryIds['BİNEK'] })
        .eq('category_id', oldBinek.id)
        .select('*', { count: 'exact' })

      console.log(`  ✅ Binek Araç → BİNEK: ${count} marka taşındı`)
    }

    // Ticari Araç → Markaya göre dağıt
    const { data: oldTicari } = await supabase
      .from('vehicle_categories')
      .select('id')
      .eq('name', 'Ticari Araç')
      .maybeSingle()

    if (oldTicari) {
      // Kamyon markaları
      const kamyonBrands = ['MAN', 'Scania', 'Volvo', 'DAF', 'Iveco']
      for (const brandName of kamyonBrands) {
        if (newCategoryIds['KAMYON']) {
          await supabase
            .from('vehicle_brands')
            .update({ category_id: newCategoryIds['KAMYON'] })
            .eq('category_id', oldTicari.id)
            .eq('name', brandName)
        }
      }

      // Kamyonet/Panelvan markaları (diğerleri)
      const kamyonetBrands = ['Ford', 'Mercedes-Benz', 'Volkswagen', 'Fiat', 'Renault', 
                              'Peugeot', 'Citroën', 'Opel', 'Toyota', 'Nissan', 'Isuzu', 
                              'Mitsubishi', 'Hyundai', 'Kia', 'Maxus', 'DFSK', 'Changan', 
                              'Great Wall', 'JAC', 'Foton', 'Dodge', 'Chevrolet', 'GMC',
                              'Maxus (Hafif Ticari)', 'Volkswagen Kamyon ve Bus']
      
      for (const brandName of kamyonetBrands) {
        if (newCategoryIds['KAMYONET']) {
          await supabase
            .from('vehicle_brands')
            .update({ category_id: newCategoryIds['KAMYONET'] })
            .eq('category_id', oldTicari.id)
            .eq('name', brandName)
        }
      }

      // Otobüs markaları
      const otobusBrands = ['Karsan', 'BMC', 'Otokar', 'Temsa']
      for (const brandName of otobusBrands) {
        if (newCategoryIds['OTOBÜS']) {
          await supabase
            .from('vehicle_brands')
            .update({ category_id: newCategoryIds['OTOBÜS'] })
            .eq('category_id', oldTicari.id)
            .eq('name', brandName)
        }
      }

      console.log(`  ✅ Ticari Araç markaları kategorilere dağıtıldı`)
    }

    // Motosiklet → MOTOSİKLET
    const { data: oldMoto } = await supabase
      .from('vehicle_categories')
      .select('id')
      .eq('name', 'Motosiklet')
      .maybeSingle()

    if (oldMoto && newCategoryIds['MOTOSİKLET']) {
      const { count } = await supabase
        .from('vehicle_brands')
        .update({ category_id: newCategoryIds['MOTOSİKLET'] })
        .eq('category_id', oldMoto.id)
        .select('*', { count: 'exact', head: true })

      console.log(`  ✅ Motosiklet → MOTOSİKLET: ${count} marka taşındı`)
    }

    // 4. Eski kategorileri sil
    console.log('\n🗑️  Eski Kategoriler Siliniyor...\n')
    
    const oldCategoryNames = ['Binek Araç', 'Ticari Araç', 'Motosiklet']
    for (const name of oldCategoryNames) {
      const { error } = await supabase
        .from('vehicle_categories')
        .delete()
        .eq('name', name)

      if (error) {
        console.error(`  ❌ ${name} silinemedi:`, error.message)
      } else {
        console.log(`  ✅ ${name} silindi`)
      }
    }

    // 5. Final durum
    console.log('\n' + '='.repeat(60))
    console.log('✅ KATEGORİ GÜNCELLEMESİ TAMAMLANDI!')
    console.log('='.repeat(60) + '\n')

    const { data: finalCategories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .order('name')

    console.log('📊 Güncel Kategori Listesi:\n')
    for (const cat of finalCategories || []) {
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      const { count: modelCount } = await supabase
        .from('vehicle_models')
        .select('*, vehicle_brands!inner(*)', { count: 'exact', head: true })
        .eq('vehicle_brands.category_id', cat.id)

      const icon = brandCount && brandCount > 0 ? '✅' : '⚪'
      console.log(`  ${icon} ${cat.name}: ${brandCount} marka, ${modelCount} model`)
    }
    console.log('')

  } catch (error) {
    console.error('\n❌ Hata:', error)
    process.exit(1)
  }
}

main()

