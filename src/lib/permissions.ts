import { createClient } from '@/lib/supabase/server'

export async function checkIsAdmin(userId: string, familyId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('family_members')
    .select('is_admin')
    .eq('user_id', userId)
    .eq('family_id', familyId)
    .single()

  if (error || !data) return false
  return data.is_admin
}

export async function getUserFamilyMembership(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('family_members')
    .select('family_id, role, is_admin, families(id, name)')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

/**
 * Verify user has access to a pet (belongs to same family)
 */
export async function verifyPetAccess(userId: string, petId: string): Promise<boolean> {
  const supabase = await createClient()

  const membership = await getUserFamilyMembership(userId)
  if (!membership) return false

  const { data: pet } = await supabase
    .from('pets')
    .select('family_id')
    .eq('id', petId)
    .single()

  if (!pet) return false
  return pet.family_id === membership.family_id
}

/**
 * Verify user is admin of the pet's family
 */
export async function verifyPetAdminAccess(userId: string, petId: string): Promise<boolean> {
  const supabase = await createClient()

  const membership = await getUserFamilyMembership(userId)
  if (!membership || !membership.is_admin) return false

  const { data: pet } = await supabase
    .from('pets')
    .select('family_id')
    .eq('id', petId)
    .single()

  if (!pet) return false
  return pet.family_id === membership.family_id
}

/**
 * Require admin access or throw error
 */
export async function requireAdmin(userId: string, familyId: string) {
  const isAdmin = await checkIsAdmin(userId, familyId)
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
}

/**
 * Get authenticated user from server
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}
