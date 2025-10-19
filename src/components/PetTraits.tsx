'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Trait {
  id: string
  trait_name: string
  trait_value: string
  notes?: string
}

export default function PetTraits({ petId }: { petId: string }) {
  const [traits, setTraits] = useState<Trait[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [traitName, setTraitName] = useState('')
  const [traitValue, setTraitValue] = useState('')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadTraits()
  }, [petId])

  const loadTraits = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pet_traits')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })

    setTraits(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setTraitName('')
    setTraitValue('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (trait: Trait) => {
    setEditingId(trait.id)
    setTraitName(trait.trait_name)
    setTraitValue(trait.trait_value)
    setNotes(trait.notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const traitData = {
      pet_id: petId,
      trait_name: traitName,
      trait_value: traitValue,
      notes: notes || null,
    }

    if (editingId) {
      await supabase.from('pet_traits').update(traitData).eq('id', editingId)
    } else {
      await supabase.from('pet_traits').insert(traitData)
    }

    resetForm()
    loadTraits()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trait?')) return
    await supabase.from('pet_traits').delete().eq('id', id)
    loadTraits()
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Trait
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trait Name *
            </label>
            <input
              type="text"
              required
              value={traitName}
              onChange={(e) => setTraitName(e.target.value)}
              placeholder="e.g., Favorite toy, Fear, Habit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trait Value *
            </label>
            <input
              type="text"
              required
              value={traitValue}
              onChange={(e) => setTraitValue(e.target.value)}
              placeholder="e.g., Tennis ball, Thunderstorms, Early riser"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : traits.length > 0 ? (
          traits.map((trait) => (
            <div
              key={trait.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{trait.trait_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {trait.trait_value}
                  </div>
                  {trait.notes && (
                    <p className="text-sm text-gray-700 mt-2">{trait.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(trait)}
                    className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trait.id)}
                    className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No traits recorded</p>
        )}
      </div>
    </div>
  )
}
