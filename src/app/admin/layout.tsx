import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const adminStatus = await isAdmin(user.id)

  // Redirect to app if not admin
  if (!adminStatus) {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main>{children}</main>
    </div>
  )
}
