'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, Footprints, Clock, MapPin, StickyNote, Sparkles, Save, Edit, X, Loader2 } from 'lucide-react'

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
      <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
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
          散歩を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-6 h-6 text-green-600" />
            <h3 className="font-bold text-gray-800">{editingId ? '散歩を編集' : '散歩を記録'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              日時 *
            </label>
            <input
              type="datetime-local"
              required
              value={walkedAt}
              onChange={(e) => setWalkedAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                時間 (分)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                距離 (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                placeholder="2.5"
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
              placeholder="散歩の様子をメモ"
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
        ) : walks.length > 0 ? (
          walks.map((walk, index) => (
            <div
              key={walk.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                    <Footprints className="w-5 h-5" />
                    <span>
                      {new Date(walk.walked_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {walk.duration_minutes && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {walk.duration_minutes}分
                      </span>
                    )}
                    {walk.distance_km && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {walk.distance_km}km
                      </span>
                    )}
                  </div>
                  {walk.notes && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">
                      {walk.notes}
                    </p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(walk)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(walk.id)}
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
            <Footprints className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ散歩の記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
