'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeletePetButton from '@/components/DeletePetButton'
import DownloadPdfButton from '@/components/DownloadPdfButton'
import SharePetButton from '@/components/SharePetButton'
import PetWalks from '@/components/PetWalks'
import PetMeals from '@/components/PetMeals'
import PetTraits from '@/components/PetTraits'
import PetMeta from '@/components/PetMeta'

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

type Tab = 'details' | 'walks' | 'meals' | 'traits' | 'meta'

export default function PetDetailTabs({
  pet,
  isAdmin,
}: {
  pet: Pet
  isAdmin: boolean
}) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'details', label: '詳細', icon: '📝' },
    { id: 'walks', label: '散歩', icon: '🚶' },
    { id: 'meals', label: '食事', icon: '🍽️' },
    { id: 'traits', label: '特徴', icon: '⭐' },
    { id: 'meta', label: 'その他', icon: '📊' },
  ]

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

  const getGenderJapanese = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      male: 'オス',
      female: 'メス',
      unknown: '不明',
    }
    return genderMap[gender] || gender
  }

  const getGenderEmoji = (gender: string) => {
    const emojiMap: { [key: string]: string } = {
      male: '♂️',
      female: '♀️',
      unknown: '❓',
    }
    return emojiMap[gender] || '❓'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gradient-to-br from-white to-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getSpeciesEmoji(pet.species)}</span>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent">
                    {pet.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {getSpeciesJapanese(pet.species)}
                    </span>
                    {pet.breed && (
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        {pet.breed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href={`/app/pets/${pet.id}/edit`}
                  className="flex-1 sm:flex-none bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  編集
                </Link>
                <DeletePetButton petId={pet.id} isAdmin={isAdmin} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {pet.avatar_url ? (
                  <img
                    src={pet.avatar_url}
                    alt={pet.name}
                    className="w-full max-h-80 object-cover rounded-2xl shadow-lg border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <span className="text-9xl">{getSpeciesEmoji(pet.species)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <DownloadPdfButton petId={pet.id} petName={pet.name} />
                <SharePetButton petId={pet.id} isAdmin={isAdmin} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 font-semibold text-sm border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#FF8E53] text-[#FF8E53] bg-[#FF8E53]/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'details' && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <span>{getSpeciesEmoji(pet.species)}</span>
                    種類
                  </label>
                  <p className="text-gray-900 font-medium">{getSpeciesJapanese(pet.species)}</p>
                </div>

                {pet.breed && (
                  <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span>📝</span>
                      品種
                    </label>
                    <p className="text-gray-900 font-medium">{pet.breed}</p>
                  </div>
                )}

                {pet.birth_date && (
                  <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl border border-pink-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span>🎂</span>
                      誕生日
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(pet.birth_date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {pet.gender && (
                  <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl border border-green-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span>{getGenderEmoji(pet.gender)}</span>
                      性別
                    </label>
                    <p className="text-gray-900 font-medium">{getGenderJapanese(pet.gender)}</p>
                  </div>
                )}

                {pet.notes && (
                  <div className="sm:col-span-2 bg-gradient-to-br from-yellow-50 to-white p-5 rounded-2xl border border-yellow-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span>📋</span>
                      メモ
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {pet.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'walks' && <PetWalks petId={pet.id} />}
            {activeTab === 'meals' && <PetMeals petId={pet.id} />}
            {activeTab === 'traits' && <PetTraits petId={pet.id} />}
            {activeTab === 'meta' && <PetMeta petId={pet.id} />}
          </div>

          {/* Footer */}
          <div className="p-8 pt-6 border-t border-gray-100">
            <Link
              href="/app/pets"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
            >
              <span>←</span>
              ペット一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
