import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { UserListClient } from './UserListClient'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function UsersListPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  // Kullanıcıları getir
  const supabase = await supabaseServer()
  
  const { data: userTenants } = await supabase
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
  const userIds = userTenants?.map((ut) => ut.user_id) || []
  
  const users = []
  if (userIds.length > 0) {
    // Her kullanıcı için auth.users'dan bilgi al
    for (const ut of userTenants || []) {
      const { data: authUser } = await supabase.auth.admin.getUserById(ut.user_id)
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
    <AdminLayout userEmail={user.email} tenantName={user.tenantName}>
      <UserListClient users={users} />
    </AdminLayout>
  )
}

