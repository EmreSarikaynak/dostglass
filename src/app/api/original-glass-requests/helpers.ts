import { SupabaseClient } from '@supabase/supabase-js'

export const REQUEST_SELECT = `
  *,
  case_files:case_file_id(id, case_number, status),
  request_reason:original_glass_request_reasons(id, name),
  vehicle_brand:vehicle_brands(id, name),
  vehicle_model:vehicle_models(id, name),
  glass_type:vehicle_glass_types(id, name),
  glass_color:glass_colors(id, name),
  insurance_company:insurance_companies(id, name)
`

export function buildValidationErrors(body: Record<string, any>) {
  const requiredFields = [
    'request_reason_id',
    'plate',
    'vehicle_brand_id',
    'glass_type_id',
    'insurance_company_id',
    'insured_phone',
  ]

  return requiredFields.filter((field) => !body[field])
}

export async function fetchFullRequest(admin: SupabaseClient, id: string) {
  const { data: request, error } = await admin
    .from('original_glass_requests')
    .select(REQUEST_SELECT)
    .eq('id', id)
    .single()

  if (error || !request) {
    throw new Error('REQUEST_NOT_FOUND')
  }

  const [filesRes, logsRes, dealerAuthRes, adminAuthRes] = await Promise.all([
    admin
      .from('original_glass_request_files')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('original_glass_request_logs')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false }),
    admin.auth.admin.getUserById(request.dealer_user_id),
    request.assigned_admin_id
      ? admin.auth.admin.getUserById(request.assigned_admin_id)
      : Promise.resolve({ data: null }),
  ])

  const fileUploaderIds = Array.from(
    new Set((filesRes.data ?? []).map((file) => file.uploader_id).filter(Boolean))
  ) as string[]

  const logActorIds = Array.from(
    new Set((logsRes.data ?? []).map((log) => log.actor_id).filter(Boolean))
  ) as string[]

  const [uploaderUsers, actorUsers] = await Promise.all([
    Promise.all(
      fileUploaderIds.map(async (userId) => {
        const { data } = await admin.auth.admin.getUserById(userId)
        return { userId, user: data?.user ?? null }
      })
    ),
    Promise.all(
      logActorIds.map(async (userId) => {
        const { data } = await admin.auth.admin.getUserById(userId)
        return { userId, user: data?.user ?? null }
      })
    ),
  ])

  const uploaderMap = new Map(uploaderUsers.map((item) => [item.userId, item.user]))
  const actorMap = new Map(actorUsers.map((item) => [item.userId, item.user]))

  return {
    ...request,
    files: (filesRes.data || []).map((file) => ({
      ...file,
      uploader_user: uploaderMap.get(file.uploader_id) ?? null,
    })),
    logs: (logsRes.data || []).map((log) => ({
      ...log,
      actor_user: actorMap.get(log.actor_id) ?? null,
    })),
    dealer_user: dealerAuthRes.data?.user || null,
    assigned_admin_user:
      adminAuthRes && 'data' in adminAuthRes ? (adminAuthRes.data as any)?.user ?? null : null,
  }
}
