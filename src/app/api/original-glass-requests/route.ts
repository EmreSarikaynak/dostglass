import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'
import { notifyNewRequest } from '@/utils/notifications'
import { REQUEST_SELECT, buildValidationErrors, fetchFullRequest } from './helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, userTenant } = await getUserAndRole(request)
    const admin = getAdminClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = admin
      .from('original_glass_requests')
      .select(REQUEST_SELECT, { count: 'exact' })
      .eq('tenant_id', userTenant.tenant_id)
      .order('created_at', { ascending: false })

    if (user.role === 'bayi') {
      query = query.eq('dealer_user_id', user.userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.error('Orijinal cam talepleri listelenemedi:', error)
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
    console.error('Orijinal cam talepleri GET hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, userTenant } = await getUserAndRole(request)
    if (!['admin', 'bayi'].includes(user.role)) {
      return NextResponse.json({ error: 'Yetkisiz rol' }, { status: 403 })
    }

    const admin = getAdminClient()
    const body = await request.json()

    const validationErrors = buildValidationErrors(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar eksik', fields: validationErrors },
        { status: 400 }
      )
    }

    const dealerUserId =
      user.role === 'bayi'
        ? user.userId
        : body.dealer_user_id || body.dealerUserId || body.dealer_id || body.dealerId

    if (!dealerUserId) {
      return NextResponse.json({ error: 'dealer_user_id gerekli' }, { status: 400 })
    }

    const tenantId = userTenant.tenant_id

    const { data: caseFile, error: caseFileError } = await admin.rpc('create_case_file', {
      p_tenant_id: tenantId,
      p_created_by: user.userId,
      p_section: 'original_glass',
    })

    if (caseFileError || !caseFile) {
      console.error('Case file oluşturulamadı:', caseFileError)
      return NextResponse.json({ error: 'Case dosyası oluşturulamadı' }, { status: 500 })
    }

    const requestInsertData = {
      tenant_id: tenantId,
      case_file_id: caseFile.id,
      dealer_user_id: dealerUserId,
      created_by: user.userId,
      assigned_admin_id: body.assigned_admin_id ?? null,
      status: body.status ?? 'pending',
      request_reason_id: body.request_reason_id,
      promised_delivery_days: body.promised_delivery_days ?? null,
      promised_delivery_date: body.promised_delivery_date ?? null,
      termin_date: body.termin_date ?? null,
      notes: body.notes ?? null,
      response_notes: body.response_notes ?? null,
      plate: body.plate,
      chassis_no: body.chassis_no ?? null,
      model_year: body.model_year ?? null,
      vehicle_brand_id: body.vehicle_brand_id,
      vehicle_model_id: body.vehicle_model_id ?? null,
      vehicle_submodel: body.vehicle_submodel ?? null,
      glass_type_id: body.glass_type_id,
      glass_color_id: body.glass_color_id ?? null,
      glass_features: body.glass_features ?? null,
      euro_code: body.euro_code ?? null,
      glass_part_code: body.glass_part_code ?? null,
      glass_price: body.glass_price ?? null,
      discount_rate: body.discount_rate ?? null,
      currency: body.currency ?? null,
      insurance_company_id: body.insurance_company_id,
      policy_number: body.policy_number ?? null,
      policy_type: body.policy_type ?? null,
      insured_name: body.insured_name ?? null,
      insured_phone: body.insured_phone,
      claim_number: body.claim_number ?? null,
    }

    const { data: createdRequest, error: requestError } = await admin
      .from('original_glass_requests')
      .insert(requestInsertData)
      .select()
      .single()

    if (requestError || !createdRequest) {
      console.error('Orijinal cam talebi oluşturulamadı:', requestError)
      return NextResponse.json({ error: 'Talep oluşturulamadı' }, { status: 500 })
    }

    await admin.from('original_glass_request_logs').insert({
      tenant_id: tenantId,
      request_id: createdRequest.id,
      actor_id: user.userId,
      action: 'update',
      payload: {
        message: 'Talep oluşturuldu',
      },
    })

    const fullRequest = await fetchFullRequest(admin, createdRequest.id)

    await notifyNewRequest({
      requestId: createdRequest.id,
      tenantId,
      caseNumber: caseFile.case_number,
      requestNumber: createdRequest.request_number,
      requestReason: fullRequest.request_reason?.name ?? null,
      dealerEmail: fullRequest.dealer_user?.email ?? null,
      plate: createdRequest.plate,
      createdAt: createdRequest.created_at,
    })

    return NextResponse.json(
      {
        data: fullRequest,
        case_number: caseFile.case_number,
        request_number: createdRequest.request_number,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }
    }

    console.error('Orijinal cam talebi POST hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
