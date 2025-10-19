'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Family {
  id: string
  name: string
}

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
}

export default function FamilyDashboard({
  familyId,
  userId,
}: {
  familyId: string
  userId: string
}) {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [familyId])

  const loadData = async () => {
    const { data: familyData } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single()

    const { data: membersData } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)

    setFamily(familyData)
    setMembers(membersData || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleLeaveFamily = async () => {
    if (!confirm('Are you sure you want to leave this family?')) return

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userId)

    if (!error) {
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{family?.name}</h1>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Family ID</h2>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
              {familyId}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this ID with family members to invite them
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Members ({members.length})
            </h2>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-medium">{member.user_id}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t">
            <button
              onClick={handleLeaveFamily}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Leave Family
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
