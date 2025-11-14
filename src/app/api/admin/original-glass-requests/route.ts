import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'
import { REQUEST_SELECT } from '../../original-glass-requests/helpers'

function toCsv(rows: any[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const csv = [headers.join(',')]
  for (const row of rows) {
    csv.push(headers.map((header) => escape(row[header])).join(','))
  }
  return csv.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const { user, userTenant } = await getUserAndRole()
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const admin = getAdminClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const dealerId = searchParams.get('dealer_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const requestReasonId = searchParams.get('request_reason_id')
    const format = searchParams.get('format')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = admin
      .from('original_glass_requests')
      .select(REQUEST_SELECT, { count: format === 'csv' ? undefined : 'exact' })
      .eq('tenant_id', userTenant.tenant_id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (dealerId) query = query.eq('dealer_user_id', dealerId)
    if (requestReasonId) query = query.eq('request_reason_id', requestReasonId)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    if (format !== 'csv') {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Admin talep listesi hatası:', error)
      return NextResponse.json({ error: 'Talepler getirilemedi' }, { status: 500 })
    }

    const requests = data || []

    const userIds = new Set<string>()
    requests.forEach((row) => {
      if (row.dealer_user_id) userIds.add(row.dealer_user_id)
      if (row.assigned_admin_id) userIds.add(row.assigned_admin_id)
    })

    const userMap = new Map<string, { email?: string | null }>()
    await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const { data: userData } = await admin.auth.admin.getUserById(userId)
        if (userData?.user) {
          userMap.set(userId, { email: userData.user.email })
        }
      })
    )

    const enriched = requests.map((row) => ({
      ...row,
      dealer_user: userMap.get(row.dealer_user_id ?? '') || null,
      assigned_admin_user: userMap.get(row.assigned_admin_id ?? '') || null,
    }))

    if (format === 'csv') {
      const flatRows = enriched.map((row) => ({
        case_number: row.case_files?.case_number ?? '',
        request_number: row.request_number ?? '',
        status: row.status ?? '',
        dealer_email: row.dealer_user?.email ?? '',
        assigned_admin_email: row.assigned_admin_user?.email ?? '',
        created_at: row.created_at ?? '',
        promised_delivery_date: row.promised_delivery_date ?? '',
        termin_date: row.termin_date ?? '',
      }))

      const csv = toCsv(flatRows)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="original-glass-requests.csv"`,
        },
      })
    }

    return NextResponse.json({
      data: enriched,
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
    console.error('Admin talep GET hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
