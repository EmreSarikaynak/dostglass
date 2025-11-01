import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { UserListClient } from './UserListClient'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export default async function UsersListPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  // Kullanıcıları getir (SERVICE ROLE ile)
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data: userTenants } = await supabaseAdmin
    .from('user_tenants')
    .select(`
      user_id,
      role,
      tenants (
        name
      )
    `)
    .order('role', { ascending: true })

  // Auth users'dan email bilgilerini alalım
  const users = []
  if (userTenants && userTenants.length > 0) {
    // Her kullanıcı için auth.users'dan bilgi al
    for (const ut of userTenants) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ut.user_id)
      if (authUser.user) {
        const tenant = ut.tenants as unknown as { name: string } | null
        users.push({
          id: ut.user_id,
          email: authUser.user.email || '',
          role: ut.role,
          tenantName: tenant?.name || '',
          createdAt: authUser.user.created_at,
        })
      }
    }
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <UserListClient users={users} />
    </AdminLayout>
  )
}

