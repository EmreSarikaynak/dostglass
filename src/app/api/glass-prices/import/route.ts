import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

// POST - Excel'den toplu import
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body // Array of glass prices

    console.log('📦 Gelen veri sayısı:', items?.length)
    console.log('📦 İlk 2 kayıt örneği:', JSON.stringify(items?.slice(0, 2), null, 2))

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 🎯 ADIM 1: Supplier'ları (markaları) kontrol et ve eksik olanları ekle
    const uniqueSuppliers = [...new Set(items.map(item => item.supplier).filter(Boolean))] as string[]
    console.log('🏷️ Benzersiz supplier sayısı:', uniqueSuppliers.length, uniqueSuppliers)

    let missingBrands: string[] = []
    if (uniqueSuppliers.length > 0) {
      // Mevcut markaları çek
      const { data: existingBrands } = await supabase
        .from('glass_brands')
        .select('name')
        .in('name', uniqueSuppliers)

      const existingBrandNames = new Set(existingBrands?.map(b => b.name) || [])
      missingBrands = uniqueSuppliers.filter(s => !existingBrandNames.has(s))

      console.log('✅ Mevcut markalar:', Array.from(existingBrandNames))
      console.log('➕ Eklenecek yeni markalar:', missingBrands)

      // Yeni markaları ekle
      if (missingBrands.length > 0) {
        const { data: newBrands, error: brandError } = await supabase
          .from('glass_brands')
          .insert(missingBrands.map(name => ({ name, is_active: true })))
          .select()

        if (brandError) {
          console.error('❌ Marka ekleme hatası:', brandError)
        } else {
          console.log(`✅ ${newBrands?.length || 0} yeni marka eklendi:`, newBrands?.map(b => b.name))
        }
      }
    }

    // 🎯 ADIM 2: Parametreleri çek (pozisyon, tip, marka, renk)
    const { data: glassPositions } = await supabase.from('glass_positions').select('id, name').eq('is_active', true)
    const { data: glassTypes } = await supabase.from('vehicle_glass_types').select('id, name').eq('is_active', true)
    const { data: glassBrands } = await supabase.from('glass_brands').select('id, name').eq('is_active', true)
    const { data: glassColors } = await supabase.from('glass_colors').select('id, name').eq('is_active', true)

    // Türkçe karakter normalize fonksiyonu
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim()
    }

    // ID tahmin fonksiyonları
    const findPositionId = (positionText: string | null): string | null => {
      if (!positionText || !glassPositions) return null
      const normalized = normalizeText(positionText)
      
      // Ön cam varyasyonları
      if (['on', 'oncam', 'öncam', 'ön cam', 'o.', 'ö.', 'on cam', 'front'].some(v => normalized.includes(v))) {
        return glassPositions.find(p => normalizeText(p.name).includes('on cam'))?.id || null
      }
      
      // Arka cam varyasyonları
      if (['arka', 'a.', 'arkacam', 'back', 'rear'].some(v => normalized.includes(v))) {
        return glassPositions.find(p => normalizeText(p.name).includes('arka'))?.id || null
      }
      
      // Yan cam varyasyonları
      if (['yan', 'kapi', 'kapı', 'side', 'door'].some(v => normalized.includes(v))) {
        return glassPositions.find(p => normalizeText(p.name).includes('yan') || normalizeText(p.name).includes('kapi'))?.id || null
      }
      
      // Tavan varyasyonları
      if (['tavan', 'sunroof', 'roof'].some(v => normalized.includes(v))) {
        return glassPositions.find(p => normalizeText(p.name).includes('tavan'))?.id || null
      }
      
      return null
    }

    const findTypeId = (features: string | null, supplier: string | null): string | null => {
      if (!glassTypes) return null
      const featuresNorm = normalizeText(features || '')
      const supplierNorm = normalizeText(supplier || '')
      
      // YERLİ/ORİJİNAL/İTHAL kontrolü (öncelikli)
      const yerliBrand = glassBrands?.find(b => normalizeText(b.name) === supplierNorm)
      if (yerliBrand) {
        const brandName = normalizeText(yerliBrand.name)
        if (['sisecam', 'sise', 'tezcam', 'solarglass'].some(v => brandName.includes(v))) {
          return glassTypes.find(t => normalizeText(t.name) === 'yerli')?.id || null
        }
        if (brandName === 'orijinal' || brandName === 'ori̇ji̇nal') {
          return glassTypes.find(t => normalizeText(t.name).includes('orijinal'))?.id || null
        }
        if (['ithal', 'i̇thal'].some(v => brandName.includes(v))) {
          return glassTypes.find(t => normalizeText(t.name).includes('ithal'))?.id || null
        }
      }
      
      // Lamine/Tempere kontrolü
      if (['lamine', 'lami', 'laminated'].some(v => featuresNorm.includes(v))) {
        return glassTypes.find(t => normalizeText(t.name).includes('lamine'))?.id || null
      }
      if (['tempere', 'tempered', 'temp'].some(v => featuresNorm.includes(v))) {
        return glassTypes.find(t => normalizeText(t.name).includes('tempere'))?.id || null
      }
      
      // Varsayılan: YERLİ
      return glassTypes[0]?.id || null
    }

    const findBrandId = (supplier: string | null): string | null => {
      if (!supplier || !glassBrands) return null
      const supplierNorm = normalizeText(supplier)
      
      // Tam eşleşme
      let brand = glassBrands.find(b => normalizeText(b.name) === supplierNorm)
      if (brand) return brand.id
      
      // Kısmi eşleşme
      brand = glassBrands.find(b => normalizeText(b.name).includes(supplierNorm) || supplierNorm.includes(normalizeText(b.name)))
      if (brand) return brand.id
      
      // Özel varyasyonlar
      if (['sisecam', 'sise', 'şişe'].some(v => supplierNorm.includes(v))) {
        return glassBrands.find(b => normalizeText(b.name).includes('sisecam'))?.id || null
      }
      if (['olimp', 'olimpia', 'oli̇mpi̇a'].some(v => supplierNorm.includes(v))) {
        return glassBrands.find(b => normalizeText(b.name).includes('olimp'))?.id || null
      }
      
      return null
    }

    const findColorId = (features: string | null, stockName: string | null): string | null => {
      if (!glassColors) return null
      const featuresNorm = normalizeText(features || '')
      const stockNameNorm = normalizeText(stockName || '')
      const combined = `${featuresNorm} ${stockNameNorm}`
      
      // Renkli kontrolü
      if (['renkli', 'colored', 'color'].some(v => combined.includes(v))) {
        return glassColors.find(c => normalizeText(c.name).includes('renkli'))?.id || null
      }
      
      // Yeşil kontrolü
      if (['yesil', 'yeşil', 'green', 'k.yesil'].some(v => combined.includes(v))) {
        return glassColors.find(c => normalizeText(c.name).includes('yesil'))?.id || null
      }
      
      // Gri kontrolü
      if (['gri', 'gray', 'grey', 'k.gri'].some(v => combined.includes(v))) {
        return glassColors.find(c => normalizeText(c.name).includes('gri'))?.id || null
      }
      
      // Çift renk kontrolü
      if (['cift renk', 'çift renk', 'double'].some(v => combined.includes(v))) {
        return glassColors.find(c => normalizeText(c.name).includes('cift'))?.id || null
      }
      
      // Varsayılan: RENKSİZ
      return glassColors?.find(c => normalizeText(c.name).includes('renksiz'))?.id || null
    }

    // 🎯 ADIM 3: Her bir item'a tenant_id, created_by ve ID'leri ekle
    let autoFilledCount = 0
    const itemsWithTenant = items.map((item) => {
      const position_id = findPositionId(item.position)
      const type_id = findTypeId(item.features, item.supplier)
      const brand_id = findBrandId(item.supplier)
      const color_id = findColorId(item.features, item.stock_name)
      
      if (position_id || type_id || brand_id || color_id) {
        autoFilledCount++
      }
      
      return {
        ...item,
        tenant_id: user.tenantId,
        created_by: user.id,
        glass_position_id: position_id,
        glass_type_id: type_id,
        glass_brand_id: brand_id,
        glass_color_id: color_id,
      }
    })

    console.log(`✅ ${autoFilledCount} kayıtta ID'ler otomatik dolduruldu`)
    console.log('✅ Tenant eklenmiş örnek:', JSON.stringify(itemsWithTenant[0], null, 2))

    // UPSERT: Var olan kayıtları güncelle, yeni olanları ekle
    const { data, error } = await supabase
      .from('glass_prices')
      .upsert(itemsWithTenant, {
        onConflict: 'product_code,supplier,tenant_id', // Unique constraint
        ignoreDuplicates: false, // Güncelle
      })
      .select()

    if (error) {
      console.error('❌ Toplu import hatası:', error)
      console.error('❌ Hata detayı:', JSON.stringify(error, null, 2))
      
      return NextResponse.json(
        { error: 'Import başarısız', details: error.message, hint: error.hint, code: error.code },
        { status: 500 }
      )
    }

    // 🎯 ADIM 4: Detaylı özet raporu
    const newBrandsCount = missingBrands?.length || 0
    const importedCount = data?.length || 0
    const autoFilledPercentage = importedCount > 0 ? Math.round((autoFilledCount / importedCount) * 100) : 0

    console.log(`✅ ${importedCount} kayıt başarıyla import edildi`)
    console.log(`📊 ${newBrandsCount} yeni marka eklendi`)
    console.log(`🤖 ${autoFilledCount}/${importedCount} kayıtta ID'ler otomatik dolduruldu (%${autoFilledPercentage})`)

    const summaryMessage = [
      `✅ ${importedCount} kayıt başarıyla import edildi`,
      newBrandsCount > 0 ? `📦 ${newBrandsCount} yeni marka otomatik eklendi` : null,
      autoFilledCount > 0 ? `🤖 ${autoFilledCount} kayıtta ID'ler otomatik dolduruldu (%${autoFilledPercentage})` : null,
    ].filter(Boolean).join('\n')

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: summaryMessage,
      stats: {
        imported: importedCount,
        newBrandsAdded: newBrandsCount,
        autoFilledIds: autoFilledCount,
        autoFilledPercentage,
      },
      data,
    })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

