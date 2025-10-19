'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Family {
  id: string
  name: string
}

interface Member {
  id: string
  user_id: string
  role: string
  is_admin: boolean
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
  const [isAdmin, setIsAdmin] = useState(false)
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

    const { data: currentMember } = await supabase
      .from('family_members')
      .select('is_admin')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single()

    setFamily(familyData)
    setMembers(membersData || [])
    setIsAdmin(currentMember?.is_admin || false)
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

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      loadData()
    }
  }

  const handleToggleAdmin = async (memberId: string, currentIsAdmin: boolean) => {
    const { error } = await supabase
      .from('family_members')
      .update({ is_admin: !currentIsAdmin })
      .eq('id', memberId)

    if (!error) {
      loadData()
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
            <div className="flex gap-4 items-center">
              <Link
                href="/app/pets"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Pets
              </Link>
              {isAdmin && (
                <Link
                  href="/app/settings"
                  className="text-sm bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Settings
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
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
                  <div className="flex-1">
                    <div className="font-medium">
                      {member.user_id.substring(0, 8)}...
                      {member.user_id === userId && ' (You)'}
                      {member.is_admin && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                    {isAdmin && member.user_id !== userId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAdmin(member.id, member.is_admin)}
                          className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          {member.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    )}
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
