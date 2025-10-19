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
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
          Species *
        </label>
        <select
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="fish">Fish</option>
          <option value="rabbit">Rabbit</option>
          <option value="hamster">Hamster</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
          Breed
        </label>
        <input
          id="breed"
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
          Birth Date
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar Image
        </label>
        {pet?.avatar_url && !avatarFile && (
          <div className="mb-2">
            <img
              src={pet.avatar_url}
              alt="Current avatar"
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {uploading && (
          <p className="text-sm text-gray-500 mt-1">Uploading image...</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : pet ? 'Update Pet' : 'Create Pet'}
        </button>
        <Link
          href={pet ? `/app/pets/${pet.id}` : '/app/pets'}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
