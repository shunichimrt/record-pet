'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

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

export default function PetForm({
  familyId,
  pet,
}: {
  familyId: string
  pet?: Pet
}) {
  const [name, setName] = useState(pet?.name || '')
  const [species, setSpecies] = useState(pet?.species || 'dog')
  const [breed, setBreed] = useState(pet?.breed || '')
  const [birthDate, setBirthDate] = useState(pet?.birth_date || '')
  const [gender, setGender] = useState(pet?.gender || 'unknown')
  const [notes, setNotes] = useState(pet?.notes || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return pet?.avatar_url || null

    setUploading(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${familyId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('pet-avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('pet-avatars').getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const avatarUrl = await uploadAvatar()

      const petData = {
        family_id: familyId,
        name,
        species,
        breed: breed || null,
        birth_date: birthDate || null,
        gender,
        avatar_url: avatarUrl,
        notes: notes || null,
      }

      if (pet) {
        // Update existing pet
        const { error: updateError } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', pet.id)

        if (updateError) throw updateError
        router.push(`/app/pets/${pet.id}`)
      } else {
        // Create new pet
        const { error: insertError } = await supabase
          .from('pets')
          .insert(petData)

        if (insertError) throw insertError
        router.push('/app/pets')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2 animate-slide-in">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>🐾</span>
          名前 *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
          placeholder="例: ポチ"
        />
      </div>

      <div>
        <label htmlFor="species" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>🐕</span>
          種類 *
        </label>
        <select
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
        >
          <option value="dog">🐕 犬</option>
          <option value="cat">🐈 猫</option>
          <option value="bird">🐦 鳥</option>
          <option value="fish">🐟 魚</option>
          <option value="rabbit">🐰 うさぎ</option>
          <option value="hamster">🐹 ハムスター</option>
          <option value="other">🐾 その他</option>
        </select>
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>📝</span>
          品種
        </label>
        <input
          id="breed"
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
          placeholder="例: 柴犬"
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>🎂</span>
          誕生日
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>⚧️</span>
          性別
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
        >
          <option value="male">♂️ オス</option>
          <option value="female">♀️ メス</option>
          <option value="unknown">❓ 不明</option>
        </select>
      </div>

      <div>
        <label htmlFor="avatar" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>📸</span>
          アバター画像
        </label>
        {pet?.avatar_url && !avatarFile && (
          <div className="mb-3 animate-fade-in">
            <img
              src={pet.avatar_url}
              alt="Current avatar"
              className="w-32 h-32 object-cover rounded-xl border-2 border-gray-100 shadow-sm"
            />
          </div>
        )}
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF8E53] file:text-white hover:file:bg-[#FF6B6B] file:cursor-pointer"
        />
        {uploading && (
          <p className="text-sm text-[#FF8E53] mt-2 flex items-center gap-2 animate-fade-in">
            <span className="animate-spin">⏳</span>
            画像をアップロード中...
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span>📋</span>
          メモ
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
          placeholder="ペットに関するメモを入力"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              保存中...
            </>
          ) : pet ? (
            <>
              <span>✏️</span>
              ペットを更新
            </>
          ) : (
            <>
              <span>✨</span>
              ペットを作成
            </>
          )}
        </button>
        <Link
          href={pet ? `/app/pets/${pet.id}` : '/app/pets'}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-center flex items-center justify-center gap-2"
        >
          <span>✕</span>
          キャンセル
        </Link>
      </div>
    </form>
  )
}
