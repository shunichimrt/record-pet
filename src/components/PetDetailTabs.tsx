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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'walks', label: 'Walks' },
    { id: 'meals', label: 'Meals' },
    { id: 'traits', label: 'Traits' },
    { id: 'meta', label: 'Meta' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-8 border-b">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{pet.name}</h1>
              <div className="flex gap-2">
                <Link
                  href={`/app/pets/${pet.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </Link>
                <DeletePetButton petId={pet.id} isAdmin={isAdmin} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                {pet.avatar_url && (
                  <img
                    src={pet.avatar_url}
                    alt={pet.name}
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="space-y-2">
                <DownloadPdfButton petId={pet.id} petName={pet.name} />
                <SharePetButton petId={pet.id} isAdmin={isAdmin} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Species
                  </label>
                  <p className="mt-1 text-gray-900 capitalize">{pet.species}</p>
                </div>

                {pet.breed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Breed
                    </label>
                    <p className="mt-1 text-gray-900">{pet.breed}</p>
                  </div>
                )}

                {pet.birth_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Birth Date
                    </label>
                    <p className="mt-1 text-gray-900">
                      {new Date(pet.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {pet.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <p className="mt-1 text-gray-900 capitalize">{pet.gender}</p>
                  </div>
                )}

                {pet.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
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
          <div className="p-8 pt-6 border-t">
            <Link href="/app/pets" className="text-blue-600 hover:text-blue-700">
              ← Back to Pets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
