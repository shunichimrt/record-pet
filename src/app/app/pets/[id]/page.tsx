import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserFamilyMembership } from '@/lib/permissions'
import PetDetailTabs from '@/components/PetDetailTabs'

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    .eq('id', id)
    .eq('family_id', membership.family_id)
    .single()

  if (!pet) {
    redirect('/app/pets')
  }

  // Fetch active banners for pet detail page
  const { data: banners } = await supabase
    .from('ad_banners')
    .select('*')
    .eq('is_active', true)
    .in('display_position', ['pet_detail', 'both'])
    .order('display_order', { ascending: true })

  return (
    <PetDetailTabs
      pet={pet}
      isAdmin={membership.is_admin}
      banners={banners || []}
    />
  )
}
