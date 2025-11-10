import { NextRequest, NextResponse } from 'next/server'
import { extname } from 'path'
import { getAdminClient, getUserAndRole } from '@/utils/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

async function canAccessRequest(requestId: string, userId: string, tenantId: string) {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('original_glass_requests')
    .select('id, tenant_id, dealer_user_id')
    .eq('id', requestId)
    .single()

  if (error || !data) {
    return { allowed: false, reason: 'Talep bulunamadı', status: 404 }
  }

  if (data.tenant_id !== tenantId) {
    return { allowed: false, reason: 'Yetkisiz erişim', status: 403 }
  }

  return { allowed: true, request: data }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()

    const access = await canAccessRequest(params.id, user.userId, userTenant.tenant_id)
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: access.status })
    }

    if (user.role === 'bayi' && access.request?.dealer_user_id !== user.userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { data, error } = await admin
      .from('original_glass_request_files')
      .select('*')
      .eq('request_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Dosyalar alınamadı:', error)
      return NextResponse.json({ error: 'Dosyalar alınamadı' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }
    console.error('Dosya listesi hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()

    const access = await canAccessRequest(params.id, user.userId, userTenant.tenant_id)
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: access.status })
    }

    if (user.role === 'bayi' && access.request?.dealer_user_id !== user.userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const formData = await request.formData()
    const description = formData.get('description') as string | null
    let files = formData.getAll('files') as File[]
    const singleFile = formData.get('file')
    if ((!files || files.length === 0) && singleFile instanceof File) {
      files = [singleFile]
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} dosyası 10MB limitini aşıyor` },
          { status: 400 }
        )
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${file.name} dosya tipi desteklenmiyor` },
          { status: 400 }
        )
      }

      const fileId = crypto.randomUUID()
      const extension = extname(file.name) || ''
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storageKey = `${userTenant.tenant_id}/${params.id}/${fileId}${extension || ''}`

      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await admin.storage
        .from('original_glass_files')
        .upload(storageKey, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Dosya yükleme hatası:', uploadError)
        return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 })
      }

      const metadata = {
        id: fileId,
        tenant_id: userTenant.tenant_id,
        request_id: params.id,
        uploader_id: user.userId,
        storage_key: storageKey,
        file_name: sanitizedName,
        mime_type: file.type,
        size: file.size,
        description: description || null,
        visibility: user.role === 'admin' ? 'admin' : 'tenant',
      }

      const { data, error: insertError } = await admin
        .from('original_glass_request_files')
        .insert(metadata)
        .select()
        .single()

      if (insertError || !data) {
        console.error('Dosya kaydı oluşturulamadı:', insertError)
        await admin.storage.from('original_glass_files').remove([storageKey])
        return NextResponse.json({ error: 'Dosya kaydı oluşturulamadı' }, { status: 500 })
      }

      await admin.from('original_glass_request_logs').insert({
        tenant_id: userTenant.tenant_id,
        request_id: params.id,
        actor_id: user.userId,
        action: 'file_upload',
        payload: {
          file_id: fileId,
          file_name: sanitizedName,
        },
      })

      uploadedFiles.push(data)
    }

    return NextResponse.json({ data: uploadedFiles }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }
    console.error('Dosya yükleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
