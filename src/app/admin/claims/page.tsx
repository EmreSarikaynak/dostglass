import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import ClaimsClient from './ClaimsClient'

export default async function ClaimsPage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <ClaimsClient />
    </AdminLayout>
  )
}
