import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    if (!cityId) {
      return NextResponse.json(
        { error: 'cityId parametresi gereklidir' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('districts')
      .select('id, name')
      .eq('city_id', cityId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Districts fetch error:', error)
      return NextResponse.json(
        { error: 'İlçeler getirilemedi', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      success: true
    })
  } catch (error) {
    console.error('Districts API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
    return NextResponse.json(
      { error: 'Sunucu hatası', details: errorMessage },
      { status: 500 }
    )
  }
}
