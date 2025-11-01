import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole } from '@/lib/auth'

// GET - Dökümanları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json({ error: 'company_id gerekli' }, { status: 400 })
    }

    const supabase = await supabaseServer()
    
    const { data, error } = await supabase
      .from('insurance_documents')
      .select('*')
      .eq('insurance_company_id', companyId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Döküman getirme hatası:', error)
      return NextResponse.json({ error: 'Dökümanlar getirilemedi' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni döküman ekle
export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = await supabaseServer()

    const { data, error } = await supabase
      .from('insurance_documents')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Döküman ekleme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Döküman sil
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const supabase = await supabaseServer()

    const { error } = await supabase
      .from('insurance_documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Döküman silme hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

