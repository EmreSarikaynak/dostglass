import { redirect } from 'next/navigation'
import type { UserWithRole } from '@/lib/auth'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { OriginalGlassRequestForm } from './OriginalGlassRequestForm'

export default async function OriginalGlassRequestNewPage() {
  const user = (await getUserAndRole()) as UserWithRole | null

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <OriginalGlassRequestForm user={user} />
    </AdminLayout>
  )
}
