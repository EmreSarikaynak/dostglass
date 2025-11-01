import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'
import { clearSettingsCache } from '@/lib/getSystemSettings'

// GET - Ayarları getir
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single()

    if (error) {
      console.error('Settings fetch error:', error)
      return NextResponse.json(
        { error: 'Ayarlar alınamadı' },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Ayarları güncelle
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const supabaseAdmin = getSupabaseAdmin()

    // Önce mevcut ayarları al
    const { data: existingSettings } = await supabaseAdmin
      .from('system_settings')
      .select('id')
      .single()

    if (existingSettings) {
      // Güncelle
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .update({
          ...body,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) {
        console.error('Settings update error:', error)
        return NextResponse.json(
          { error: 'Ayarlar güncellenemedi' },
          { status: 500 }
        )
      }

      // Cache'i temizle
      clearSettingsCache()

      return NextResponse.json({
        message: 'Ayarlar başarıyla güncellendi',
        data,
      })
    } else {
      // Yeni kayıt oluştur
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .insert({
          ...body,
          updated_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Settings insert error:', error)
        return NextResponse.json(
          { error: 'Ayarlar kaydedilemedi' },
          { status: 500 }
        )
      }

      // Cache'i temizle
      clearSettingsCache()

      return NextResponse.json({
        message: 'Ayarlar başarıyla kaydedildi',
        data,
      })
    }
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

