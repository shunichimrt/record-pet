import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserFamilyMembership } from '@/lib/permissions'

export default async function PetsPage() {
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

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('family_id', membership.family_id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Pets</h1>
            <div className="flex gap-4">
              <Link
                href="/app/pets/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Pet
              </Link>
              <Link
                href="/app"
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2"
              >
                Back to Family
              </Link>
            </div>
          </div>

          {pets && pets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/app/pets/${pet.id}`}
                  className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {pet.avatar_url && (
                    <img
                      src={pet.avatar_url}
                      alt={pet.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {pet.species}
                    {pet.breed && ` - ${pet.breed}`}
                  </p>
                  {pet.birth_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Born: {new Date(pet.birth_date).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No pets yet</p>
              <Link
                href="/app/pets/new"
                className="text-blue-600 hover:text-blue-700"
              >
                Add your first pet
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
