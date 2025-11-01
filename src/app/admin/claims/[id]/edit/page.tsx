import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import ClaimEditClient from './ClaimEditClient'

export default async function ClaimEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserAndRole()
  const { id } = await params

  if (!user) {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <ClaimEditClient claimId={id} />
    </AdminLayout>
  )
}


