import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'

const URL_EXPIRY_SECONDS = 3600

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()

    const { data: file, error } = await admin
      .from('original_glass_request_files')
      .select('*')
      .eq('id', params.fileId)
      .single()

    if (error || !file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }

    if (file.tenant_id !== userTenant.tenant_id || file.request_id !== params.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    if (user.role === 'bayi') {
      const { data: requestRecord } = await admin
        .from('original_glass_requests')
        .select('dealer_user_id')
        .eq('id', params.id)
        .single()

      if (requestRecord?.dealer_user_id !== user.userId) {
        return NextResponse.json({ error: 'Dosya erişim yetkiniz yok' }, { status: 403 })
      }
    }

    const { data: signedUrlData, error: urlError } = await admin.storage
      .from('original_glass_files')
      .createSignedUrl(file.storage_key, URL_EXPIRY_SECONDS)

    if (urlError || !signedUrlData) {
      console.error('Signed URL oluşturulamadı:', urlError)
      return NextResponse.json({ error: 'Dosya bağlantısı oluşturulamadı' }, { status: 500 })
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      expiresIn: URL_EXPIRY_SECONDS,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    console.error('Signed URL hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
