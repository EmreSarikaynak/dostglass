import { NextRequest, NextResponse } from 'next/server'
import { getUserAndRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const user = await getUserAndRole()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'document'

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Dosya adını güvenli hale getir
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`

    // Upload dizini
    const uploadDir = type === 'logo' ? 'insurance-logos' : 'insurance-documents'
    const storagePath = `uploads/${uploadDir}/${fileName}`

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('public')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('public')
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlData.publicUrl

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload başarısız' }, { status: 500 })
  }
}
