import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getUserAndRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserAndRole()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'favicon'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu en fazla 5MB olabilir' },
        { status: 400 }
      )
    }

    // Dosya tipi kontrolü (favicon için ico da ekledik)
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/svg+xml', 
      'image/webp', 
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir (JPG, JPEG, PNG, GIF, SVG, WebP, ICO)' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Dosya adını oluştur
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${type}-${timestamp}.${extension}`
    const filePath = `settings/${fileName}`

    // Dosyayı Supabase Storage'a yükle
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('public')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Dosya yüklenemedi' },
        { status: 500 }
      )
    }

    // Public URL'i al
    const { data: urlData } = supabaseAdmin
      .storage
      .from('public')
      .getPublicUrl(filePath)

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      url: urlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

