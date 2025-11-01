import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import ClaimViewClient from './ClaimViewClient'

export default async function ClaimViewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserAndRole()
  const { id } = await params

  if (!user) {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <ClaimViewClient claimId={id} />
    </AdminLayout>
  )
}


