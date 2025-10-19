import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase URL ve Service Role key gereklidir')
    }

    supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseAdminInstance
}

// Backwards compatibility
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const admin = getSupabaseAdmin()
    return admin[prop as keyof SupabaseClient]
  },
})

