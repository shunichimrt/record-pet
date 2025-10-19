'use client'

import { useState } from 'react'

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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{pet.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Shared view - Expires{' '}
                  {new Date(expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                Read Only
              </div>
            </div>

            {pet.avatar_url && (
              <img
                src={pet.avatar_url}
                alt={pet.name}
                className="w-full max-h-64 object-cover rounded-lg"
              />
            )}
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

            {activeTab === 'walks' && (
              <div className="space-y-2">
                {walks.length > 0 ? (
                  walks.map((walk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">
                        {new Date(walk.walked_at).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {walk.duration_minutes && (
                          <span className="mr-3">
                            ⏱ {walk.duration_minutes} min
                          </span>
                        )}
                        {walk.distance_km && <span>📍 {walk.distance_km} km</span>}
                      </div>
                      {walk.notes && (
                        <p className="text-sm text-gray-700 mt-2">{walk.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent walks
                  </p>
                )}
              </div>
            )}

            {activeTab === 'meals' && (
              <div className="space-y-2">
                {meals.length > 0 ? (
                  meals.map((meal, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">
                        {new Date(meal.fed_at).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {meal.food_type && (
                          <span className="mr-3">🍽 {meal.food_type}</span>
                        )}
                        {meal.amount && <span>📊 {meal.amount}</span>}
                      </div>
                      {meal.notes && (
                        <p className="text-sm text-gray-700 mt-2">{meal.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent meals
                  </p>
                )}
              </div>
            )}

            {activeTab === 'traits' && (
              <div className="space-y-2">
                {traits.length > 0 ? (
                  traits.map((trait, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">{trait.trait_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {trait.trait_value}
                      </div>
                      {trait.notes && (
                        <p className="text-sm text-gray-700 mt-2">{trait.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No traits</p>
                )}
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="border rounded-lg divide-y">
                {metas.length > 0 ? (
                  metas.map((meta, index) => (
                    <div key={index} className="p-4">
                      <div className="text-sm font-medium text-gray-700">
                        {meta.meta_key}
                      </div>
                      <div className="text-gray-900 mt-1">{meta.meta_value}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No additional information
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 pt-6 border-t bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              This is a shared read-only view. To manage this pet, please log in to
              Record Pet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
