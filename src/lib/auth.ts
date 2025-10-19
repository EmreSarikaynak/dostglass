import { supabaseServer } from './supabaseServer'

export type UserRole = 'admin' | 'bayi'

export interface UserWithRole {
  userId: string
  email: string
  role: UserRole
  tenantId: string
  tenantName: string
}

export async function getSession() {
  const supabase = await supabaseServer()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUserAndRole(): Promise<UserWithRole | null> {
  const { session } = await getSession()
  if (!session?.user) return null

  const supabase = await supabaseServer()
  
  // user_tenants tablosundan kullanıcının rol ve tenant bilgisini al
  const { data, error } = await supabase
    .from('user_tenants')
    .select(`
      role,
      tenant_id,
      tenants (
        name
      )
    `)
    .eq('user_id', session.user.id)
    .single()

  if (error || !data) {
    console.error('Kullanıcı rolü alınamadı:', error)
    return null
  }

  // Supabase'den dönen tenants her zaman bir obje (ilişki tek)
  const tenant = data.tenants as unknown as { name: string } | null

  return {
    userId: session.user.id,
    email: session.user.email!,
    role: data.role as UserRole,
    tenantId: data.tenant_id,
    tenantName: tenant?.name || '',
  }
}

