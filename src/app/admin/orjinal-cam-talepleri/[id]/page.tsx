import { redirect, notFound } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { OriginalGlassRequestDetail } from '@/components/original-glass/OriginalGlassRequestDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOriginalGlassRequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/')
  }

  if (!id) {
    notFound()
  }

  const supabase = getSupabaseAdmin()
  const { data: adminRows } = await supabase
    .from('user_tenants')
    .select('user_id')
    .eq('tenant_id', user.tenantId)
    .eq('role', 'admin')

  const adminUsers = adminRows
    ? await Promise.all(
        adminRows.map(async ({ user_id }) => {
          const { data } = await supabase.auth.admin.getUserById(user_id)
          return {
            userId: user_id,
            email: data?.user?.email || user_id,
          }
        })
      )
    : []

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <OriginalGlassRequestDetail
        requestId={id}
        currentUserId={user.userId}
        role="admin"
        adminUsers={adminUsers}
      />
    </AdminLayout>
  )
}
