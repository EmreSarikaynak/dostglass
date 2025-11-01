import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { InsuranceCompaniesManagement } from './InsuranceCompaniesManagement'

export default async function InsuranceCompaniesPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <InsuranceCompaniesManagement />
    </AdminLayout>
  )
}

