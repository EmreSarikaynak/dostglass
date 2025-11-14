import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()

    const { data: requestRecord, error: requestError } = await admin
      .from('original_glass_requests')
      .select('id, tenant_id, dealer_user_id')
      .eq('id', params.id)
      .single()

    if (requestError || !requestRecord) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    if (requestRecord.tenant_id !== userTenant.tenant_id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    if (user.role === 'bayi' && requestRecord.dealer_user_id !== user.userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { data, error } = await admin
      .from('original_glass_request_logs')
      .select('*')
      .eq('request_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Loglar alınamadı:', error)
      return NextResponse.json({ error: 'Loglar alınamadı' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }
    console.error('Log listesi hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
