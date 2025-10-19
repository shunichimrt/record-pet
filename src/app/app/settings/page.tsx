import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserFamilyMembership } from '@/lib/permissions'
import FamilySettings from '@/components/FamilySettings'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const membership = await getUserFamilyMembership(user.id)

  if (!membership) {
    redirect('/app')
  }

  // Only admins can access settings
  if (!membership.is_admin) {
    redirect('/app')
  }

  // Get family data
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', membership.family_id)
    .single()

  // Get all family members
  const { data: members } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', membership.family_id)
    .order('joined_at', { ascending: true })

  if (!family) {
    redirect('/app')
  }

  return (
    <FamilySettings
      family={family}
      members={members || []}
      currentUserId={user.id}
    />
  )
}
