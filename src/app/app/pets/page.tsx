import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserFamilyMembership } from '@/lib/permissions'
import { PawPrint, Sparkles, Home, Dog, Cat, Bird, Fish, Rabbit, Ham, Cake } from 'lucide-react'

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

  const getSpeciesIcon = (species: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      dog: <Dog className="w-full h-full" />,
      cat: <Cat className="w-full h-full" />,
      bird: <Bird className="w-full h-full" />,
      fish: <Fish className="w-full h-full" />,
      rabbit: <Rabbit className="w-full h-full" />,
      hamster: <Ham className="w-full h-full" />,
      other: <PawPrint className="w-full h-full" />,
    }
    return iconMap[species] || <PawPrint className="w-full h-full" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-6 sm:py-8 lg:py-12 px-4">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF8E53] to-[#FF6B6B] rounded-2xl flex items-center justify-center">
                  <PawPrint className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent truncate">
                  ペット一覧
                </h1>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm ml-0 sm:ml-[52px] lg:ml-[60px]">
                {pets && pets.length > 0
                  ? `${pets.length}匹のペット`
                  : 'ペットを追加して記録を始めましょう'}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
              <Link
                href="/app/pets/new"
                className="flex-1 lg:flex-none gradient-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">ペット追加</span>
                <span className="sm:hidden">追加</span>
              </Link>
              <Link
                href="/app"
                className="flex-1 lg:flex-none bg-gray-100 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">家族へ戻る</span>
                <span className="sm:hidden">戻る</span>
              </Link>
            </div>
          </div>

          {pets && pets.length > 0 ? (
            <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet, index) => (
                <Link
                  key={pet.id}
                  href={`/app/pets/${pet.id}`}
                  className="group block bg-gradient-to-br from-white to-gray-50 p-4 sm:p-5 border border-gray-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {pet.avatar_url ? (
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={pet.avatar_url}
                        alt={pet.name}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                          {getSpeciesIcon(pet.species)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400">
                        {getSpeciesIcon(pet.species)}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate">
                      {pet.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                      <span className="bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap">
                        {getSpeciesJapanese(pet.species)}
                      </span>
                      {pet.breed && (
                        <span className="bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full font-medium truncate max-w-[120px]">
                          {pet.breed}
                        </span>
                      )}
                    </div>
                    {pet.birth_date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                        <Cake className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(pet.birth_date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
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
            <div className="text-center py-12 sm:py-16 animate-fade-in">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 text-gray-300">
                <PawPrint className="w-full h-full" />
              </div>
              <p className="text-gray-500 text-base sm:text-lg mb-6">まだペットが登録されていません</p>
              <Link
                href="/app/pets/new"
                className="inline-flex items-center gap-2 gradient-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                最初のペットを追加
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
