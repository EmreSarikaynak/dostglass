import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sendNotification } from '../_shared/notifications.ts'

interface StatusChangePayload {
  requestId: string
  tenantId?: string
  requestNumber?: string | null
  oldStatus?: string | null
  newStatus?: string | null
  responseNotes?: string | null
  dealerEmail?: string | null
  assignedAdminEmail?: string | null
  updatedAt?: string | null
}

const statusLabels: Record<string, string> = {
  pending: 'Beklemede',
  processing: 'İşlemde',
  fulfilled: 'Tamamlandı',
  rejected: 'Reddedildi',
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let payload: StatusChangePayload

  try {
    payload = (await req.json()) as StatusChangePayload
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  if (!payload.requestId || !payload.newStatus) {
    return new Response('requestId and newStatus are required', { status: 400 })
  }

  const subject = `Talep Güncellendi | ${payload.requestNumber ?? payload.requestId}`
  const bodyLines = [
    `Talep numarası: ${payload.requestNumber ?? '—'}`,
    `Eski durum: ${statusLabels[payload.oldStatus ?? ''] ?? payload.oldStatus ?? '—'}`,
    `Yeni durum: ${statusLabels[payload.newStatus] ?? payload.newStatus}`,
    `Admin geri bildirimi: ${payload.responseNotes ?? '—'}`,
    `Atanan admin: ${payload.assignedAdminEmail ?? '—'}`,
    `Bayi e-posta: ${payload.dealerEmail ?? '—'}`,
    `Güncelleme zamanı: ${payload.updatedAt ?? new Date().toISOString()}`,
  ]

  const result = await sendNotification({
    subject,
    body: bodyLines.join('\n'),
    metadata: payload,
  })

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
