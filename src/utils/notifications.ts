const FUNCTIONS_BASE_URL =
  process.env.SUPABASE_FUNCTIONS_URL || process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE

interface BaseNotificationPayload {
  requestId: string
  tenantId?: string
}

interface NewRequestPayload extends BaseNotificationPayload {
  caseNumber?: string | null
  requestNumber?: string | null
  requestReason?: string | null
  dealerEmail?: string | null
  plate?: string | null
  createdAt?: string | null
}

interface StatusChangePayload extends BaseNotificationPayload {
  requestNumber?: string | null
  oldStatus?: string | null
  newStatus?: string | null
  responseNotes?: string | null
  dealerEmail?: string | null
  assignedAdminEmail?: string | null
  updatedAt?: string | null
}

export async function notifyNewRequest(payload: NewRequestPayload) {
  await callEdgeFunction('notify-new-request', payload)
}

export async function notifyStatusChange(payload: StatusChangePayload) {
  await callEdgeFunction('notify-status-change', payload)
}

async function callEdgeFunction<T extends Record<string, unknown>>(
  name: string,
  payload: T
) {
  if (!FUNCTIONS_BASE_URL || !SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[notifications] Skipping call to ${name} – missing SUPABASE_FUNCTIONS_URL or SUPABASE_SERVICE_ROLE.`
      )
    }
    return
  }

  const url = `${FUNCTIONS_BASE_URL.replace(/\/$/, '')}/${name}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[notifications] ${name} failed: ${response.status} ${text}`)
    }
  } catch (error) {
    console.error(`[notifications] ${name} error:`, error)
  }
}
