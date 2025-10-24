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

  // Fetch active banners for dashboard
  const { data: banners } = await supabase
    .from('ad_banners')
    .select('*')
    .eq('is_active', true)
    .in('display_position', ['dashboard', 'both'])
    .order('display_order', { ascending: true })

  return (
    <FamilyDashboard
      familyId={familyMember.family_id}
      userId={user.id}
      banners={banners || []}
    />
  )
}
