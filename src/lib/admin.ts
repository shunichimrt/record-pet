import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is a system administrator
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}

/**
 * Get the authenticated user and verify they are an admin
 * Throws an error if the user is not authenticated or not an admin
 */
export async function getAuthenticatedAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const adminStatus = await isAdmin(user.id)

  if (!adminStatus) {
    throw new Error('Not authorized - admin access required')
  }

  return user
}
