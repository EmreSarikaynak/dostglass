#!/usr/bin/env node

/**
 * Kategori Temizleme Script
 * Duplicate kategorileri tespit edip temizler
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

async function main() {
  console.log('🔍 Kategori Analizi Başlıyor...\n')

  try {
    // Tüm kategorileri getir
    const { data: categories, error } = await supabase
      .from('vehicle_categories')
      .select('id, name, created_at')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Kategoriler getirilemedi:', error)
      process.exit(1)
    }

    console.log('📊 Mevcut Kategoriler:\n')
    for (const cat of categories || []) {
      // Her kategoriye ait marka sayısını bul
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      // Her kategoriye ait model sayısını bul (brands üzerinden)
      const { count: modelCount } = await supabase
        .from('vehicle_models')
        .select('*, vehicle_brands!inner(*)', { count: 'exact', head: true })
        .eq('vehicle_brands.category_id', cat.id)

      console.log(`  ${cat.name}`)
      console.log(`    ID: ${cat.id}`)
      console.log(`    Marka: ${brandCount || 0}`)
      console.log(`    Model: ${modelCount || 0}`)
      console.log(`    Oluşturma: ${cat.created_at}`)
      console.log('')
    }

    // Boş kategorileri bul
    const emptyCategories = []
    for (const cat of categories || []) {
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      if (brandCount === 0) {
        emptyCategories.push(cat)
      }
    }

    if (emptyCategories.length > 0) {
      console.log('⚠️  Boş Kategoriler Bulundu:\n')
      for (const cat of emptyCategories) {
        console.log(`  • ${cat.name} (${cat.id})`)
      }
      console.log('')

      // Boş kategorileri sil
      console.log('🗑️  Boş kategoriler siliniyor...\n')
      for (const cat of emptyCategories) {
        const { error: deleteError } = await supabase
          .from('vehicle_categories')
          .delete()
          .eq('id', cat.id)

        if (deleteError) {
          console.error(`  ❌ ${cat.name} silinemedi:`, deleteError)
        } else {
          console.log(`  ✅ ${cat.name} silindi`)
        }
      }
    } else {
      console.log('✅ Boş kategori bulunamadı. Tüm kategoriler kullanımda!\n')
    }

    // Final durum
    console.log('\n' + '='.repeat(60))
    console.log('📊 GÜNCEL DURUM')
    console.log('='.repeat(60) + '\n')

    const { data: finalCategories } = await supabase
      .from('vehicle_categories')
      .select('id, name')
      .order('name', { ascending: true })

    for (const cat of finalCategories || []) {
      const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      const { count: modelCount } = await supabase
        .from('vehicle_models')
        .select('*, vehicle_brands!inner(*)', { count: 'exact', head: true })
        .eq('vehicle_brands.category_id', cat.id)

      console.log(`  ✅ ${cat.name}: ${brandCount} marka, ${modelCount} model`)
    }
    console.log('')

  } catch (error) {
    console.error('\n❌ Hata:', error)
    process.exit(1)
  }
}

main()

