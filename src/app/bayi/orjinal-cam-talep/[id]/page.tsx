import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { getUserAndRole } from '@/lib/auth'
import { OriginalGlassRequestDetail } from '@/components/original-glass/OriginalGlassRequestDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OriginalGlassRequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin' && user.role !== 'bayi') {
    redirect('/')
  }

  if (!id) {
    notFound()
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName} userRole={user.role}>
      <OriginalGlassRequestDetail requestId={id} currentUserId={user.userId} role={user.role} />
    </AdminLayout>
  )
}
