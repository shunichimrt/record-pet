import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserFamilyMembership } from '@/lib/permissions'
import PetForm from '@/components/PetForm'

export default async function NewPetPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Pet</h1>
          <PetForm familyId={membership.family_id} />
        </div>
      </div>
    </div>
  )
}
