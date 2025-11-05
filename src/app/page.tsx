import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/auth'

export default async function HomePage() {
  const user = await getUserAndRole()

  if (!user) {
    redirect('/login')
  }

  // Admin ise admin paneline yönlendir
  if (user.role === 'admin') {
    redirect('/admin')
  }

  redirect('/announcements')
}
