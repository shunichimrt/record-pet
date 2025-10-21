'use client'

import { useState } from 'react'
import { FileText, Footprints, UtensilsCrossed, Star, Database, Clock, MapPin, Scale, Eye } from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  birth_date?: string
  gender?: string
  avatar_url?: string
  notes?: string
}

interface Walk {
  walked_at: string
  duration_minutes?: number
  distance_km?: number
  notes?: string
}

interface Meal {
  fed_at: string
  food_type?: string
  amount?: string
  notes?: string
}

interface Trait {
  trait_name: string
  trait_value: string
  notes?: string
}

interface Meta {
  meta_key: string
  meta_value: string
}

type Tab = 'details' | 'walks' | 'meals' | 'traits' | 'meta'

export default function SharedPetView({
  pet,
  walks,
  meals,
  traits,
  metas,
  expiresAt,
}: {
  pet: Pet
  walks: Walk[]
  meals: Meal[]
  traits: Trait[]
  metas: Meta[]
  expiresAt: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: '詳細', icon: <FileText className="w-4 h-4" /> },
    { id: 'walks', label: '散歩', icon: <Footprints className="w-4 h-4" /> },
    { id: 'meals', label: '食事', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'traits', label: '特徴', icon: <Star className="w-4 h-4" /> },
    { id: 'meta', label: 'その他', icon: <Database className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen gradient-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent mb-2">{pet.name}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  共有表示 - 有効期限: {new Date(expiresAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
                <Eye className="w-4 h-4" />
                閲覧のみ
              </div>
            </div>

            {pet.avatar_url && (
              <img
                src={pet.avatar_url}
                alt={pet.name}
                className="w-full max-h-64 object-cover rounded-2xl shadow-md mt-4"
              />
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 bg-gray-50">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#FF8E53] text-[#FF8E53] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-5">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    種類
                  </label>
                  <p className="text-gray-900 capitalize font-medium">{pet.species}</p>
                </div>
                {pet.breed && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      品種
                    </label>
                    <p className="text-gray-900 font-medium">{pet.breed}</p>
                  </div>
                )}
                {pet.birth_date && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      生年月日
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(pet.birth_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}
                {pet.gender && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      性別
                    </label>
                    <p className="text-gray-900 capitalize font-medium">{pet.gender}</p>
                  </div>
                )}
                {pet.notes && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      メモ
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {pet.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'walks' && (
              <div className="space-y-3">
                {walks.length > 0 ? (
                  walks.map((walk, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-2xl hover:shadow-md transition-all">
                      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Footprints className="w-5 h-5 text-blue-600" />
                        {new Date(walk.walked_at).toLocaleString('ja-JP')}
                      </div>
                      <div className="text-sm text-gray-700 flex gap-4 flex-wrap">
                        {walk.duration_minutes && (
                          <span className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {walk.duration_minutes}分
                          </span>
                        )}
                        {walk.distance_km && (
                          <span className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-lg">
                            <MapPin className="w-4 h-4" />
                            {walk.distance_km} km
                          </span>
                        )}
                      </div>
                      {walk.notes && (
                        <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">{walk.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <Footprints className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">散歩の記録がありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meals' && (
              <div className="space-y-3">
                {meals.length > 0 ? (
                  meals.map((meal, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-white to-green-50 border border-green-100 rounded-2xl hover:shadow-md transition-all">
                      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-green-600" />
                        {new Date(meal.fed_at).toLocaleString('ja-JP')}
                      </div>
                      <div className="text-sm text-gray-700 flex gap-4 flex-wrap">
                        {meal.food_type && (
                          <span className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-lg">
                            <UtensilsCrossed className="w-4 h-4" />
                            {meal.food_type}
                          </span>
                        )}
                        {meal.amount && (
                          <span className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-lg">
                            <Scale className="w-4 h-4" />
                            {meal.amount}
                          </span>
                        )}
                      </div>
                      {meal.notes && (
                        <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">{meal.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">食事の記録がありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'traits' && (
              <div className="space-y-3">
                {traits.length > 0 ? (
                  traits.map((trait, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-white to-purple-50 border border-purple-100 rounded-2xl hover:shadow-md transition-all">
                      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        {trait.trait_name}
                      </div>
                      <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl inline-block font-medium">
                        {trait.trait_value}
                      </div>
                      {trait.notes && (
                        <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">{trait.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">特徴の記録がありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="space-y-3">
                {metas.length > 0 ? (
                  metas.map((meta, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl hover:shadow-md transition-all">
                      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {meta.meta_key}
                      </div>
                      <div className="text-gray-900 font-medium bg-gray-100 px-4 py-2 rounded-xl">{meta.meta_value}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">追加情報がありません</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 pt-6 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              これは共有された閲覧専用ページです。ペットを管理するには、Record Petにログインしてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
