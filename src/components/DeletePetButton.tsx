'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeletePetButton({
  petId,
  isAdmin,
}: {
  petId: string
  isAdmin: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!isAdmin) return null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this pet?')) return

    setLoading(true)
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId)

      if (error) throw error

      router.push('/app/pets')
      router.refresh()
    } catch (err) {
      alert('Failed to delete pet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
