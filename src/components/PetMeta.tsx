'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Meta {
  id: string
  meta_key: string
  meta_value: string
}

export default function PetMeta({ petId }: { petId: string }) {
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [metaKey, setMetaKey] = useState('')
  const [metaValue, setMetaValue] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadMetas()
  }, [petId])

  const loadMetas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pet_meta')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })

    setMetas(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setMetaKey('')
    setMetaValue('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (meta: Meta) => {
    setEditingId(meta.id)
    setMetaKey(meta.meta_key)
    setMetaValue(meta.meta_value)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const metaData = {
      pet_id: petId,
      meta_key: metaKey,
      meta_value: metaValue,
    }

    if (editingId) {
      await supabase.from('pet_meta').update(metaData).eq('id', editingId)
    } else {
      await supabase.from('pet_meta').insert(metaData)
    }

    resetForm()
    loadMetas()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return
    await supabase.from('pet_meta').delete().eq('id', id)
    loadMetas()
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          Custom fields allow you to track any additional information about your pet
          that doesn't fit in other categories. Examples: Microchip ID, Insurance
          Policy Number, Vet Contact, etc.
        </p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Custom Field
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name *
            </label>
            <input
              type="text"
              required
              value={metaKey}
              onChange={(e) => setMetaKey(e.target.value)}
              placeholder="e.g., Microchip ID, Vet Phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Value *
            </label>
            <input
              type="text"
              required
              value={metaValue}
              onChange={(e) => setMetaValue(e.target.value)}
              placeholder="e.g., 123456789, (555) 123-4567"
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
        ) : metas.length > 0 ? (
          <div className="border rounded-lg divide-y">
            {metas.map((meta) => (
              <div key={meta.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">
                      {meta.meta_key}
                    </div>
                    <div className="text-gray-900 mt-1">{meta.meta_value}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(meta)}
                      className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meta.id)}
                      className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No custom fields</p>
        )}
      </div>
    </div>
  )
}
