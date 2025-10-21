'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, UtensilsCrossed, Clock, Scale, StickyNote, Sparkles, Save, Edit, X, Loader2 } from 'lucide-react'

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
    if (!confirm('この食事記録を削除してもよろしいですか？')) return
    await supabase.from('pet_meals').delete().eq('id', id)
    loadMeals()
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-gray-800">期間で絞り込み</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              開始日
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              終了日
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all w-full sm:w-auto"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          食事を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-600" />
            <h3 className="font-bold text-gray-800">{editingId ? '食事を編集' : '食事を記録'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              日時 *
            </label>
            <input
              type="datetime-local"
              required
              value={fedAt}
              onChange={(e) => setFedAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                食事の種類
              </label>
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="例: ドライフード"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                量
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例: 100g"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              メモ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
              placeholder="食事の様子をメモ"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {editingId ? <Edit className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {editingId ? '更新' : '保存'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-3">読み込み中...</p>
          </div>
        ) : meals.length > 0 ? (
          meals.map((meal, index) => (
            <div
              key={meal.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    <span>
                      {new Date(meal.fed_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {meal.food_type && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        {meal.food_type}
                      </span>
                    )}
                    {meal.amount && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" />
                        {meal.amount}
                      </span>
                    )}
                  </div>
                  {meal.notes && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">
                      {meal.notes}
                    </p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ食事の記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
