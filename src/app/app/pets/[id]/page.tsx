import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserFamilyMembership } from '@/lib/permissions'
import PetDetailTabs from '@/components/PetDetailTabs'

export default async function PetDetailPage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: pet } = await supabase
    .from('pets')
    .select('*')
    .eq('id', params.id)
    .eq('family_id', membership.family_id)
    .single()

  if (!pet) {
    redirect('/app/pets')
  }

  return <PetDetailTabs pet={pet} isAdmin={membership.is_admin} />
}
