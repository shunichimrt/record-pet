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
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <span>✨</span>
          特徴を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h3 className="font-bold text-gray-800">{editingId ? '特徴を編集' : '特徴を記録'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>🏷️</span>
              特徴の名前 *
            </label>
            <input
              type="text"
              required
              value={traitName}
              onChange={(e) => setTraitName(e.target.value)}
              placeholder="例: 好きなおもちゃ"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>💬</span>
              値 *
            </label>
            <input
              type="text"
              required
              value={traitValue}
              onChange={(e) => setTraitValue(e.target.value)}
              placeholder="例: テニスボール"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>📋</span>
              メモ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
              placeholder="詳細をメモ"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{editingId ? '✏️' : '💾'}</span>
              {editingId ? '更新' : '保存'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <span>✕</span>
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <span className="text-4xl animate-spin inline-block">⏳</span>
            <p className="text-gray-500 mt-3">読み込み中...</p>
          </div>
        ) : traits.length > 0 ? (
          traits.map((trait, index) => (
            <div
              key={trait.id}
              className="p-5 bg-gradient-to-r from-white to-purple-50 border border-purple-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                    <span className="text-xl">⭐</span>
                    <span>{trait.trait_name}</span>
                  </div>
                  <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl inline-block font-medium">
                    {trait.trait_value}
                  </div>
                  {trait.notes && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">
                      {trait.notes}
                    </p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(trait)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(trait.id)}
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
            <div className="text-5xl mb-3">⭐</div>
            <p className="text-gray-500">まだ特徴の記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
