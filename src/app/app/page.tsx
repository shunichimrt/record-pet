import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FamilySetup from '@/components/FamilySetup'
import FamilyDashboard from '@/components/FamilyDashboard'

export default async function AppPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is already a member of a family
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id, families(id, name)')
    .eq('user_id', user.id)
    .single()

  if (!familyMember) {
    return <FamilySetup userId={user.id} />
  }

  return <FamilyDashboard familyId={familyMember.family_id} userId={user.id} />
}
