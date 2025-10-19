'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Walk {
  id: string
  walked_at: string
  duration_minutes?: number
  distance_km?: number
  notes?: string
}

export default function PetWalks({ petId }: { petId: string }) {
  const [walks, setWalks] = useState<Walk[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [walkedAt, setWalkedAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [notes, setNotes] = useState('')

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadWalks()
  }, [petId, startDate, endDate])

  const loadWalks = async () => {
    setLoading(true)
    let query = supabase
      .from('pet_walks')
      .select('*')
      .eq('pet_id', petId)
      .order('walked_at', { ascending: false })

    if (startDate) {
      query = query.gte('walked_at', startDate)
    }
    if (endDate) {
      query = query.lte('walked_at', endDate + 'T23:59:59')
    }

    const { data } = await query
    setWalks(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setWalkedAt('')
    setDurationMinutes('')
    setDistanceKm('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (walk: Walk) => {
    setEditingId(walk.id)
    setWalkedAt(walk.walked_at.substring(0, 16))
    setDurationMinutes(walk.duration_minutes?.toString() || '')
    setDistanceKm(walk.distance_km?.toString() || '')
    setNotes(walk.notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const walkData = {
      pet_id: petId,
      walked_at: walkedAt,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      notes: notes || null,
    }

    if (editingId) {
      await supabase.from('pet_walks').update(walkData).eq('id', editingId)
    } else {
      await supabase.from('pet_walks').insert(walkData)
    }

    resetForm()
    loadWalks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this walk?')) return
    await supabase.from('pet_walks').delete().eq('id', id)
    loadWalks()
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setStartDate('')
            setEndDate('')
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Walk
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={walkedAt}
              onChange={(e) => setWalkedAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
        ) : walks.length > 0 ? (
          walks.map((walk) => (
            <div
              key={walk.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">
                    {new Date(walk.walked_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {walk.duration_minutes && (
                      <span className="mr-3">⏱ {walk.duration_minutes} min</span>
                    )}
                    {walk.distance_km && <span>📍 {walk.distance_km} km</span>}
                  </div>
                  {walk.notes && (
                    <p className="text-sm text-gray-700 mt-2">{walk.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(walk)}
                    className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(walk.id)}
                    className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No walks recorded</p>
        )}
      </div>
    </div>
  )
}
