import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { InsurancePartnersClient } from './InsurancePartnersClient'

export default async function InsurancePartnersPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'bayi') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <InsurancePartnersClient />
    </AdminLayout>
  )
}

