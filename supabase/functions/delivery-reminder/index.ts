import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sendNotification, getServiceClient } from '../_shared/notifications.ts'

const STATUS_FILTER = ['pending', 'processing']

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = getServiceClient()

  if (!supabase) {
    return new Response('Service role client not configured', { status: 500 })
  }

  const today = new Date()
  const targetStart = startOfDay(addDays(today, 3))
  const targetEnd = addDays(targetStart, 1)

  const { data: requests, error } = await supabase
    .from('original_glass_requests')
    .select(
      `
        id,
        tenant_id,
        request_number,
        case_files(case_number),
        status,
        promised_delivery_date,
        delivery_reminder_sent_at,
        dealer_user_id,
        assigned_admin_id
      `
    )
    .not('promised_delivery_date', 'is', null)
    .in('status', STATUS_FILTER)
    .gte('promised_delivery_date', targetStart.toISOString())
    .lt('promised_delivery_date', targetEnd.toISOString())

  if (error) {
    console.error('[delivery-reminder] Query error', error)
    return new Response('Query error', { status: 500 })
  }

  if (!requests || requests.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const processedIds: string[] = []

  for (const request of requests) {
    if (request.delivery_reminder_sent_at) {
      const lastSent = new Date(request.delivery_reminder_sent_at)
      const sameWindow = lastSent >= targetStart && lastSent < targetEnd
      if (sameWindow) continue
    }

    const dealerEmail = await resolveUserEmail(supabase, request.dealer_user_id)
    const assignedAdminEmail = request.assigned_admin_id
      ? await resolveUserEmail(supabase, request.assigned_admin_id)
      : null

    const subject = `Teslim Tarihi Yaklaşıyor | ${request.request_number ?? request.case_files?.case_number}`
    const bodyLines = [
      `Talep numarası: ${request.request_number ?? '—'}`,
      `Dosya numarası: ${request.case_files?.case_number ?? '—'}`,
      `Mevcut durum: ${request.status}`,
      `Beklenen teslim tarihi: ${request.promised_delivery_date}`,
      `Bayi e-posta: ${dealerEmail ?? '—'}`,
      `Atanan admin: ${assignedAdminEmail ?? '—'}`,
    ]

    await sendNotification({
      subject,
      body: bodyLines.join('\n'),
      metadata: {
        requestId: request.id,
        tenantId: request.tenant_id,
        promisedDeliveryDate: request.promised_delivery_date,
      },
    })

    processedIds.push(request.id)
  }

  if (processedIds.length > 0) {
    await supabase
      .from('original_glass_requests')
      .update({ delivery_reminder_sent_at: new Date().toISOString() })
      .in('id', processedIds)
  }

  return new Response(JSON.stringify({ processed: processedIds.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

async function resolveUserEmail(supabase: ReturnType<typeof getServiceClient>, userId?: string | null) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  if (error) {
    console.error('[delivery-reminder] resolveUserEmail error', error)
    return null
  }
  return data?.user?.email ?? null
}
