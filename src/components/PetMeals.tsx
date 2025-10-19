'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Meal {
  id: string
  fed_at: string
  food_type?: string
  amount?: string
  notes?: string
}

export default function PetMeals({ petId }: { petId: string }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [fedAt, setFedAt] = useState('')
  const [foodType, setFoodType] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadMeals()
  }, [petId, startDate, endDate])

  const loadMeals = async () => {
    setLoading(true)
    let query = supabase
      .from('pet_meals')
      .select('*')
      .eq('pet_id', petId)
      .order('fed_at', { ascending: false })

    if (startDate) {
      query = query.gte('fed_at', startDate)
    }
    if (endDate) {
      query = query.lte('fed_at', endDate + 'T23:59:59')
    }

    const { data } = await query
    setMeals(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setFedAt('')
    setFoodType('')
    setAmount('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id)
    setFedAt(meal.fed_at.substring(0, 16))
    setFoodType(meal.food_type || '')
    setAmount(meal.amount || '')
    setNotes(meal.notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const mealData = {
      pet_id: petId,
      fed_at: fedAt,
      food_type: foodType || null,
      amount: amount || null,
      notes: notes || null,
    }

    if (editingId) {
      await supabase.from('pet_meals').update(mealData).eq('id', editingId)
    } else {
      await supabase.from('pet_meals').insert(mealData)
    }

    resetForm()
    loadMeals()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return
    await supabase.from('pet_meals').delete().eq('id', id)
    loadMeals()
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
          Add Meal
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
              value={fedAt}
              onChange={(e) => setFedAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Type
              </label>
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="e.g., Dry food, Wet food"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 100g, 1 cup"
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
        ) : meals.length > 0 ? (
          meals.map((meal) => (
            <div
              key={meal.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No meals recorded</p>
        )}
      </div>
    </div>
  )
}
