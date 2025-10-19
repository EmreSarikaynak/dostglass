import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { CreateUserForm } from './CreateUserForm'

export default async function AdminUsersPage() {
  const user = await getUserAndRole()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayout userEmail={user.email} tenantName={user.tenantName}>
      <CreateUserForm />
    </AdminLayout>
  )
}
