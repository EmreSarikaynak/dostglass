import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sendNotification } from '../_shared/notifications.ts'

interface NewRequestPayload {
  requestId: string
  tenantId?: string
  caseNumber?: string | null
  requestNumber?: string | null
  requestReason?: string | null
  dealerEmail?: string | null
  plate?: string | null
  createdAt?: string | null
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let payload: NewRequestPayload

  try {
    payload = (await req.json()) as NewRequestPayload
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  if (!payload.requestId) {
    return new Response('requestId is required', { status: 400 })
  }

  const subject = `Yeni Orijinal Cam Talebi | ${payload.requestNumber ?? payload.caseNumber ?? payload.requestId}`
  const bodyLines = [
    `Talep numarası: ${payload.requestNumber ?? '—'}`,
    `Dosya numarası: ${payload.caseNumber ?? '—'}`,
    `Talep sebebi: ${payload.requestReason ?? '—'}`,
    `Plaka: ${payload.plate ?? '—'}`,
    `Bayi e-posta: ${payload.dealerEmail ?? '—'}`,
    `Oluşturulma: ${payload.createdAt ?? new Date().toISOString()}`,
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
