import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

export interface NotificationChannelResult {
  channel: 'slack' | 'email'
  success: boolean
  status?: number
  error?: string
}

export interface SendNotificationInput {
  subject: string
  body: string
  metadata?: Record<string, unknown>
}

export interface NotificationResponse {
  delivered: NotificationChannelResult[]
}

const slackWebhook = Deno.env.get('NOTIFY_SLACK_WEBHOOK_URL') ?? ''
const emailApiUrl = Deno.env.get('NOTIFY_EMAIL_API_URL') ?? ''
const emailApiKey = Deno.env.get('NOTIFY_EMAIL_API_KEY') ?? ''
const emailTo = Deno.env.get('NOTIFY_EMAIL_TO') ?? ''

export function getServiceClient(): SupabaseClient | null {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function sendNotification({
  subject,
  body,
  metadata = {},
}: SendNotificationInput): Promise<NotificationResponse> {
  const deliveries: NotificationChannelResult[] = []

  if (slackWebhook) {
    try {
      const payload = {
        text: `*${subject}*\n${body}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${subject}*\n${body}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Metadata: \`${JSON.stringify(metadata)}\``,
              },
            ],
          },
        ],
      }
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      deliveries.push({
        channel: 'slack',
        success: response.ok,
        status: response.status,
        error: response.ok ? undefined : await response.text(),
      })
    } catch (error) {
      deliveries.push({
        channel: 'slack',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (emailApiUrl && emailApiKey && emailTo) {
    try {
      const response = await fetch(emailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emailApiKey}`,
        },
        body: JSON.stringify({
          to: emailTo,
          subject,
          text: `${body}\n\nMetadata: ${JSON.stringify(metadata, null, 2)}`,
        }),
      })

      deliveries.push({
        channel: 'email',
        success: response.ok,
        status: response.status,
        error: response.ok ? undefined : await response.text(),
      })
    } catch (error) {
      deliveries.push({
        channel: 'email',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (!slackWebhook && (!emailApiUrl || !emailApiKey || !emailTo)) {
    console.log('[notifications] No delivery channels configured. Message payload:', {
      subject,
      body,
      metadata,
    })
  }

  return { delivered: deliveries }
}
