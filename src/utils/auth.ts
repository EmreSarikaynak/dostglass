import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { supabaseServer } from '@/lib/supabaseServer'
import { getUserAndRole as getCurrentUser } from '@/lib/auth'

export interface AuthContext {
  user: Awaited<ReturnType<typeof getCurrentUser>>
  userTenant: {
    user_id: string
    tenant_id: string
    role: string
  }
}

/**
 * Next.js API route helper to fetch authenticated user and tenant details.
 * Returns both the user metadata (email/role) and the raw user_tenants row.
 */
export async function getUserAndRole(_req?: NextRequest): Promise<AuthContext> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  const supabase = await supabaseServer()
  const { data: userTenant, error } = await supabase
    .from('user_tenants')
    .select('user_id, tenant_id, role')
    .eq('user_id', user.userId)
    .eq('tenant_id', user.tenantId)
    .single()

  if (error || !userTenant) {
    console.error('user_tenants kaydı alınamadı:', error)
    throw new Error('TENANT_NOT_FOUND')
  }

  return { user, userTenant }
}

/**
 * Ensures that a resource belongs to the current tenant.
 * Throws if there is a mismatch.
 */
export function ensureTenantAccess(userTenantId: string, resourceTenantId: string) {
  if (userTenantId !== resourceTenantId) {
    throw new Error('TENANT_MISMATCH')
  }
}

/**
 * Helper to ensure the caller is an admin. Returns silently when authorized.
 */
export function assertAdmin(role: string) {
  if (role !== 'admin') {
    throw new Error('FORBIDDEN')
  }
}

/**
 * Utility to fetch a Supabase admin client (service role) for database operations.
 */
export function getAdminClient() {
  return getSupabaseAdmin()
}
