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
      <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💡</span>
          <h3 className="font-bold text-gray-800">カスタムフィールドについて</h3>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          カスタムフィールドを使用すると、他のカテゴリに当てはまらないペットに関する追加情報を記録できます。
          例: マイクロチップID、保険証券番号、獣医の連絡先など
        </p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <span>✨</span>
          フィールドを追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-gray-800">{editingId ? 'フィールドを編集' : 'フィールドを追加'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>🏷️</span>
              フィールド名 *
            </label>
            <input
              type="text"
              required
              value={metaKey}
              onChange={(e) => setMetaKey(e.target.value)}
              placeholder="例: マイクロチップID"
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
              value={metaValue}
              onChange={(e) => setMetaValue(e.target.value)}
              placeholder="例: 123456789"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
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
        ) : metas.length > 0 ? (
          <div className="grid gap-3">
            {metas.map((meta, index) => (
              <div
                key={meta.id}
                className="p-5 bg-gradient-to-r from-white to-cyan-50 border border-cyan-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-1">
                      <span>📊</span>
                      <span>{meta.meta_key}</span>
                    </div>
                    <div className="text-gray-900 font-medium text-lg bg-cyan-100 px-4 py-2 rounded-xl inline-block">
                      {meta.meta_value}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => handleEdit(meta)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(meta.id)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-500">まだカスタムフィールドがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
