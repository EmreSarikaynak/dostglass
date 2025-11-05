import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import ClaimsClient from '@/app/admin/claims/ClaimsClient'

export default async function BayiClaimsPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <ClaimsClient userRole={user.role} />
    </AdminLayout>
  )
}
