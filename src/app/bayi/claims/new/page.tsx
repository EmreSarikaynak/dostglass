import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { ClaimFormClient } from '@/app/admin/claims/new/ClaimFormClient'

export default async function BayiNewClaimPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <ClaimFormClient redirectPath="/bayi/claims" />
    </AdminLayout>
  )
}
