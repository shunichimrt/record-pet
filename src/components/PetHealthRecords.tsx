'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, Heart, Clock, StickyNote, Sparkles, Save, Edit, X, Loader2, Smile, Activity, UtensilsCrossed, Droplets } from 'lucide-react'

interface HealthRecord {
  id: string
  recorded_at: string
  appetite_level?: number
  bathroom_times?: number
  bathroom_notes?: string
  mood_level?: number
  activity_level?: number
  health_notes?: string
}

export default function PetHealthRecords({ petId }: { petId: string }) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [recordedAt, setRecordedAt] = useState('')
  const [appetiteLevel, setAppetiteLevel] = useState(3)
  const [bathroomTimes, setBathroomTimes] = useState('')
  const [bathroomNotes, setBathroomNotes] = useState('')
  const [moodLevel, setMoodLevel] = useState(3)
  const [activityLevel, setActivityLevel] = useState(3)
  const [healthNotes, setHealthNotes] = useState('')

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadRecords()
  }, [petId, startDate, endDate])

  const loadRecords = async () => {
    setLoading(true)
    let query = supabase
      .from('pet_health_records')
      .select('*')
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: false })

    if (startDate) {
      query = query.gte('recorded_at', startDate)
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate + 'T23:59:59')
    }

    const { data } = await query
    setRecords(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setRecordedAt('')
    setAppetiteLevel(3)
    setBathroomTimes('')
    setBathroomNotes('')
    setMoodLevel(3)
    setActivityLevel(3)
    setHealthNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (record: HealthRecord) => {
    setEditingId(record.id)
    setRecordedAt(record.recorded_at.substring(0, 16))
    setAppetiteLevel(record.appetite_level || 3)
    setBathroomTimes(record.bathroom_times?.toString() || '')
    setBathroomNotes(record.bathroom_notes || '')
    setMoodLevel(record.mood_level || 3)
    setActivityLevel(record.activity_level || 3)
    setHealthNotes(record.health_notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      pet_id: petId,
      recorded_at: recordedAt,
      appetite_level: appetiteLevel,
      bathroom_times: bathroomTimes ? parseInt(bathroomTimes) : null,
      bathroom_notes: bathroomNotes || null,
      mood_level: moodLevel,
      activity_level: activityLevel,
      health_notes: healthNotes || null,
    }

    if (editingId) {
      await supabase.from('pet_health_records').update(recordData).eq('id', editingId)
    } else {
      await supabase.from('pet_health_records').insert(recordData)
    }

    resetForm()
    loadRecords()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この健康記録を削除してもよろしいですか？')) return
    await supabase.from('pet_health_records').delete().eq('id', id)
    loadRecords()
  }

  const getLevelLabel = (level: number) => {
    const labels = ['とても悪い', '悪い', '普通', '良い', 'とても良い']
    return labels[level - 1] || '普通'
  }

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'text-red-600 bg-red-100'
    if (level === 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl border border-pink-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-pink-600" />
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
          健康記録を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-2xl border border-pink-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-pink-600" />
            <h3 className="font-bold text-gray-800">{editingId ? '健康記録を編集' : '健康記録を追加'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              日時 *
            </label>
            <input
              type="datetime-local"
              required
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>

          {/* Appetite Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              食欲レベル: <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(appetiteLevel)}`}>{getLevelLabel(appetiteLevel)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={appetiteLevel}
              onChange={(e) => setAppetiteLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Bathroom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                トイレ回数
              </label>
              <input
                type="number"
                value={bathroomTimes}
                onChange={(e) => setBathroomTimes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                トイレメモ
              </label>
              <input
                type="text"
                value={bathroomNotes}
                onChange={(e) => setBathroomNotes(e.target.value)}
                placeholder="例: 正常"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Mood Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              気分レベル: <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(moodLevel)}`}>{getLevelLabel(moodLevel)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={moodLevel}
              onChange={(e) => setMoodLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              活動レベル: <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(activityLevel)}`}>{getLevelLabel(activityLevel)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={activityLevel}
              onChange={(e) => setActivityLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              健康メモ
            </label>
            <textarea
              rows={3}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
              placeholder="体調の様子をメモ"
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
        ) : records.length > 0 ? (
          records.map((record, index) => (
            <div
              key={record.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                    <Heart className="w-5 h-5" />
                    <span>
                      {new Date(record.recorded_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {record.appetite_level && (
                      <span className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${getLevelColor(record.appetite_level)}`}>
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        食欲: {getLevelLabel(record.appetite_level)}
                      </span>
                    )}
                    {record.mood_level && (
                      <span className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${getLevelColor(record.mood_level)}`}>
                        <Smile className="w-3.5 h-3.5" />
                        気分: {getLevelLabel(record.mood_level)}
                      </span>
                    )}
                    {record.activity_level && (
                      <span className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${getLevelColor(record.activity_level)}`}>
                        <Activity className="w-3.5 h-3.5" />
                        活動: {getLevelLabel(record.activity_level)}
                      </span>
                    )}
                    {record.bathroom_times && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" />
                        トイレ: {record.bathroom_times}回
                      </span>
                    )}
                  </div>
                  {(record.bathroom_notes || record.health_notes) && (
                    <div className="mt-3 space-y-2">
                      {record.bathroom_notes && (
                        <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded-xl leading-relaxed">
                          <span className="font-semibold">トイレ: </span>{record.bathroom_notes}
                        </p>
                      )}
                      {record.health_notes && (
                        <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-xl leading-relaxed">
                          {record.health_notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
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
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ健康記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
