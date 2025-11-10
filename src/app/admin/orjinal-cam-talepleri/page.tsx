import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminOriginalGlassRequestList } from './AdminOriginalGlassRequestList'

export default async function AdminOriginalGlassRequestsPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/')
  }

  const supabase = getSupabaseAdmin()

  const [reasonsRes, dealerRowsRes, adminRowsRes] = await Promise.all([
    supabase
      .from('original_glass_request_reasons')
      .select('id, name')
      .eq('tenant_id', user.tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('user_tenants')
      .select('user_id')
      .eq('tenant_id', user.tenantId)
      .eq('role', 'bayi'),
    supabase
      .from('user_tenants')
      .select('user_id')
      .eq('tenant_id', user.tenantId)
      .eq('role', 'admin'),
  ])

  const mapUsers = async (rows: { user_id: string }[] | null | undefined) => {
    if (!rows || rows.length === 0) return []
    const results = await Promise.all(
      rows.map(async ({ user_id }) => {
        const { data } = await supabase.auth.admin.getUserById(user_id)
        return {
          userId: user_id,
          email: data?.user?.email || user_id,
        }
      })
    )
    return results
  }

  const reasons = reasonsRes?.data ?? []
  const dealers = await mapUsers(dealerRowsRes?.data)
  const admins = await mapUsers(adminRowsRes?.data)

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <AdminOriginalGlassRequestList
        reasons={reasons}
        dealers={dealers}
        admins={admins}
      />
    </AdminLayout>
  )
}
