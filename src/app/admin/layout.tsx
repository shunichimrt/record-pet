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

  // Check if user is system administrator
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('is_system_only')
    .eq('user_id', user.id)
    .single()

  // Must be a system-only administrator to access
  if (!adminData || adminData.is_system_only !== true) {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main>{children}</main>
    </div>
  )
}
