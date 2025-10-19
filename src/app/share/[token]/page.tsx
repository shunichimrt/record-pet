import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SharedPetView from '@/components/SharedPetView'

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Verify token - no authentication required
  const { data: shareToken, error: tokenError } = await supabase
    .from('share_tokens')
    .select('*, pets(*)')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  if (tokenError || !shareToken) {
    notFound()
  }

  // Check if token is expired
  const expiresAt = new Date(shareToken.expires_at)
  if (expiresAt < new Date()) {
    notFound()
  }

  // Fetch pet data
  const { data: pet } = await supabase
    .from('pets')
    .select('*')
    .eq('id', shareToken.pet_id)
    .single()

  if (!pet) {
    notFound()
  }

  // Fetch walks
  const { data: walks } = await supabase
    .from('pet_walks')
    .select('*')
    .eq('pet_id', pet.id)
    .order('walked_at', { ascending: false })
    .limit(10)

  // Fetch meals
  const { data: meals } = await supabase
    .from('pet_meals')
    .select('*')
    .eq('pet_id', pet.id)
    .order('fed_at', { ascending: false })
    .limit(10)

  // Fetch traits
  const { data: traits } = await supabase
    .from('pet_traits')
    .select('*')
    .eq('pet_id', pet.id)

  // Fetch meta
  const { data: metas } = await supabase
    .from('pet_meta')
    .select('*')
    .eq('pet_id', pet.id)

  return (
    <SharedPetView
      pet={pet}
      walks={walks || []}
      meals={meals || []}
      traits={traits || []}
      metas={metas || []}
      expiresAt={shareToken.expires_at}
    />
  )
}
