import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('cities')
      .select('id, name, plate_code')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Cities fetch error:', error)
      return NextResponse.json(
        { error: 'İller getirilemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      success: true
    })
  } catch (error) {
    console.error('Cities API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
