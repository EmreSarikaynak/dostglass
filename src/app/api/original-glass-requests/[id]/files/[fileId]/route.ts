import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string; fileId: string } }) {
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

    const { data: requestRecord } = await admin
      .from('original_glass_requests')
      .select('dealer_user_id')
      .eq('id', params.id)
      .single()

    if (user.role === 'bayi') {
      if (requestRecord?.dealer_user_id !== user.userId || file.uploader_id !== user.userId) {
        return NextResponse.json({ error: 'Dosyayı silme yetkiniz yok' }, { status: 403 })
      }
    }

    const { error: storageError } = await admin.storage
      .from('original_glass_files')
      .remove([file.storage_key])

    if (storageError) {
      console.error('Depolama dosyası silinemedi:', storageError)
      return NextResponse.json({ error: 'Dosya silinemedi' }, { status: 500 })
    }

    const { error: deleteError } = await admin
      .from('original_glass_request_files')
      .delete()
      .eq('id', params.fileId)

    if (deleteError) {
      console.error('Dosya kaydı silinemedi:', deleteError)
      return NextResponse.json({ error: 'Dosya kaydı silinemedi' }, { status: 500 })
    }

    await admin.from('original_glass_request_logs').insert({
      tenant_id: userTenant.tenant_id,
      request_id: params.id,
      actor_id: user.userId,
      action: 'update',
      payload: {
        file_id: params.fileId,
        file_name: file.file_name,
        action: 'deleted',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    console.error('Dosya silme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
