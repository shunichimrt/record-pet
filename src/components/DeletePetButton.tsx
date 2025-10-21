'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

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
    if (!confirm('このペットを削除してもよろしいですか？\nこの操作は取り消せません。')) return

    setLoading(true)
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId)

      if (error) throw error

      router.push('/app/pets')
      router.refresh()
    } catch (err) {
      alert('ペットの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          削除中...
        </>
      ) : (
        <>
          <Trash2 className="w-5 h-5" />
          削除
        </>
      )}
    </button>
  )
}
