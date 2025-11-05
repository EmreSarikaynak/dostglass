import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { EditUserForm } from './EditUserForm'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const supabaseAdmin = getSupabaseAdmin()

  // Kullanıcı bilgilerini getir
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
  
  if (!authUser.user) {
    redirect('/admin/users')
  }

  const { data: userTenant } = await supabaseAdmin
    .from('user_tenants')
    .select(`
      user_id,
      role,
      tenants (
        id,
        name
      )
    `)
    .eq('user_id', id)
    .single()

  const tenant = userTenant?.tenants as unknown as { id: string; name: string } | null

  // Bayi bilgilerini getir (eğer bayi ise)
  let dealerInfo = null
  if (userTenant?.role === 'bayi') {
    const { data: dealer } = await supabaseAdmin
      .from('dealers')
      .select('*')
      .eq('user_id', id)
      .maybeSingle()
    
    dealerInfo = dealer
  }

  const userData = {
    id: authUser.user.id,
    email: authUser.user.email || '',
    role: userTenant?.role || 'bayi',
    tenantId: tenant?.id || '',
    tenantName: tenant?.name || '',
    dealerInfo: dealerInfo || undefined,
  }

  // Tüm tenantları getir
  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('id, name')
    .order('name')

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <EditUserForm user={userData} tenants={tenants || []} />
    </AdminLayout>
  )
}
