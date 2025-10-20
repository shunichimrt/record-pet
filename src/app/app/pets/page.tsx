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

  const getSpeciesEmoji = (species: string) => {
    const emojiMap: { [key: string]: string } = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      fish: '🐟',
      rabbit: '🐰',
      hamster: '🐹',
      other: '🐾',
    }
    return emojiMap[species] || '🐾'
  }

  const getSpeciesJapanese = (species: string) => {
    const japaneseMap: { [key: string]: string } = {
      dog: '犬',
      cat: '猫',
      bird: '鳥',
      fish: '魚',
      rabbit: 'うさぎ',
      hamster: 'ハムスター',
      other: 'その他',
    }
    return japaneseMap[species] || species
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🐾</span>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent">
                  ペット一覧
                </h1>
              </div>
              <p className="text-gray-600 text-sm ml-14">
                {pets && pets.length > 0
                  ? `${pets.length}匹のペット`
                  : 'ペットを追加して記録を始めましょう'}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                href="/app/pets/new"
                className="flex-1 sm:flex-none gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>✨</span>
                ペット追加
              </Link>
              <Link
                href="/app"
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <span>🏠</span>
                家族へ戻る
              </Link>
            </div>
          </div>

          {pets && pets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet, index) => (
                <Link
                  key={pet.id}
                  href={`/app/pets/${pet.id}`}
                  className="group block bg-gradient-to-br from-white to-gray-50 p-5 border border-gray-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {pet.avatar_url ? (
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={pet.avatar_url}
                        alt={pet.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-2xl">
                        {getSpeciesEmoji(pet.species)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4">
                      <span className="text-6xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                      <span>{pet.name}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {getSpeciesJapanese(pet.species)}
                      </span>
                      {pet.breed && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                          {pet.breed}
                        </span>
                      )}
                    </div>
                    {pet.birth_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                        <span>🎂</span>
                        <span>
                          {new Date(pet.birth_date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-7xl mb-4">🐾</div>
              <p className="text-gray-500 text-lg mb-6">まだペットが登録されていません</p>
              <Link
                href="/app/pets/new"
                className="inline-flex items-center gap-2 gradient-primary text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <span>✨</span>
                最初のペットを追加
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
