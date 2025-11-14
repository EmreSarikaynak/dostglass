import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getUserAndRole } from '@/utils/auth'
import { notifyStatusChange } from '@/utils/notifications'
import { fetchFullRequest } from '../helpers'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()

    const { data: request, error } = await admin
      .from('original_glass_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    if (request.tenant_id !== userTenant.tenant_id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    if (user.role === 'bayi' && request.dealer_user_id !== user.userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const fullRequest = await fetchFullRequest(admin, params.id)
    return NextResponse.json({ data: fullRequest })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    console.error('Orijinal cam talebi detay hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, userTenant } = await getUserAndRole()
    const admin = getAdminClient()
    const body = await request.json()

    const { data: current, error } = await admin
      .from('original_glass_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !current) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    if (current.tenant_id !== userTenant.tenant_id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const previousStatus = current.status
    const previousAssignedAdmin = current.assigned_admin_id

    if (user.role === 'bayi') {
      if (current.dealer_user_id !== user.userId) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }

      if (current.status !== 'pending') {
        return NextResponse.json(
          { error: 'Sadece bekleyen talepler güncellenebilir' },
          { status: 400 }
        )
      }

      const allowedFields = ['notes', 'promised_delivery_days']
      const updatePayload: Record<string, any> = {}
      for (const field of allowedFields) {
        if (field in body) {
          updatePayload[field] = body[field]
        }
      }

      if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'Güncellenebilir alan bulunamadı' }, { status: 400 })
      }

      const { error: updateError } = await admin
        .from('original_glass_requests')
        .update(updatePayload)
        .eq('id', params.id)
        .eq('tenant_id', userTenant.tenant_id)

      if (updateError) {
        console.error('Talep güncellenemedi (dealer):', updateError)
        return NextResponse.json({ error: 'Talep güncellenemedi' }, { status: 500 })
      }
    } else if (user.role === 'admin') {
      const allowedFields = [
        'status',
        'assigned_admin_id',
        'response_notes',
        'promised_delivery_days',
        'termin_date',
      ]

      const updatePayload: Record<string, any> = {}
      for (const field of allowedFields) {
        if (field in body) {
          updatePayload[field] = body[field]
        }
      }

      if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
      }

      const { error: updateError } = await admin
        .from('original_glass_requests')
        .update(updatePayload)
        .eq('id', params.id)
        .eq('tenant_id', userTenant.tenant_id)

      if (updateError) {
        console.error('Talep güncellenemedi (admin):', updateError)
        return NextResponse.json({ error: 'Talep güncellenemedi' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Yetkisiz rol' }, { status: 403 })
    }

    const fullRequest = await fetchFullRequest(admin, params.id)

    if (
      user.role === 'admin' &&
      (fullRequest.status !== previousStatus || fullRequest.assigned_admin_id !== previousAssignedAdmin)
    ) {
      await notifyStatusChange({
        requestId: fullRequest.id,
        tenantId: fullRequest.tenant_id,
        requestNumber: fullRequest.request_number,
        oldStatus: previousStatus,
        newStatus: fullRequest.status,
        responseNotes: fullRequest.response_notes ?? null,
        dealerEmail: fullRequest.dealer_user?.email ?? null,
        assignedAdminEmail: fullRequest.assigned_admin_user?.email ?? null,
        updatedAt: fullRequest.updated_at,
      })
    }
    return NextResponse.json({ data: fullRequest })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    console.error('Orijinal cam talebi PATCH hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
