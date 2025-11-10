import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'
import { REQUEST_SELECT, buildValidationErrors, fetchFullRequest } from '../../original-glass-requests/helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, userTenant } = await getUserAndRole(request)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz rol' }, { status: 403 })
    }

    const admin = getAdminClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dealerId = searchParams.get('dealer_id')
    const requestReasonId = searchParams.get('request_reason_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const format = searchParams.get('format')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = admin
      .from('original_glass_requests')
      .select(REQUEST_SELECT, { count: 'exact' })
      .eq('tenant_id', userTenant.tenant_id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (dealerId) {
      query = query.eq('dealer_user_id', dealerId)
    }

    if (requestReasonId) {
      query = query.eq('request_reason_id', requestReasonId)
    }

    if (from) {
      query = query.gte('created_at', from)
    }

    if (to) {
      query = query.lte('created_at', to)
    }

    // CSV export için tüm verileri çek
    if (format === 'csv') {
      const { data, error } = await query
      if (error) {
        console.error('Admin talepleri CSV export hatası:', error)
        return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 })
      }

      // CSV formatına çevir
      const csvHeaders = [
        'Dosya No',
        'Talep No',
        'Bayi',
        'Durum',
        'Oluşturma Tarihi',
        'Atanan Admin',
        'Termin Tarihi',
        'Talep Sebebi',
        'Plaka',
        'Araç Marka/Model',
        'Sigorta Şirketi',
        'Sigortalı Telefonu'
      ]

      const csvRows = data?.map((request: any) => [
        request.case_files?.case_number || '',
        request.request_number || '',
        request.dealer_user?.email || request.dealer_user_id,
        request.status,
        new Date(request.created_at).toLocaleString('tr-TR'),
        request.assigned_admin_user?.email || '',
        request.promised_delivery_date ? new Date(request.promised_delivery_date).toLocaleDateString('tr-TR') : '',
        request.request_reason?.name || '',
        request.plate,
        `${request.vehicle_brand?.name || ''} ${request.vehicle_model?.name || ''}`.trim(),
        request.insurance_company?.name || '',
        request.insured_phone
      ]) || []

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="original-glass-requests_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.error('Admin orijinal cam talepleri listelenemedi:', error)
      return NextResponse.json({ error: 'Talepler getirilemedi' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        limit,
        offset,
        total: count ?? 0,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }
    console.error('Admin orijinal cam talepleri GET hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
