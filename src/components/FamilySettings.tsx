'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

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

export default function FamilySettings({
  family,
  members,
  currentUserId,
}: {
  family: Family
  members: Member[]
  currentUserId: string
}) {
  const [familyName, setFamilyName] = useState(family.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateFamilyName = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('families')
        .update({ name: familyName })
        .eq('id', family.id)

      if (updateError) throw updateError

      alert('Family name updated successfully')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update family name')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (memberId: string, currentIsAdmin: boolean) => {
    if (!confirm(`Are you sure you want to ${currentIsAdmin ? 'remove' : 'grant'} admin access?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', memberId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      alert('Failed to update admin status')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      alert('Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (userId === currentUserId) {
      alert('You cannot remove yourself. Use "Leave Family" instead.')
      return
    }

    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      alert('Failed to remove member')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Family Settings</h1>
            <Link
              href="/app"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Admin Only:</strong> Only administrators can access and modify
              family settings.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Family Name */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Family Name</h2>
            <form onSubmit={handleUpdateFamilyName} className="flex gap-4">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || familyName === family.name}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          {/* Family ID */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Family ID</h2>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
              {family.id}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this ID with family members to invite them
            </p>
          </div>

          {/* Members Management */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Family Members ({members.length})
            </h2>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {member.user_id.substring(0, 8)}...
                          {member.user_id === currentUserId && ' (You)'}
                        </span>
                        {member.is_admin && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          disabled={member.user_id === currentUserId}
                          className="text-sm px-2 py-1 border border-gray-300 rounded disabled:bg-gray-100"
                        >
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="son">Son</option>
                          <option value="daughter">Daughter</option>
                          <option value="other">Other</option>
                        </select>
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {member.user_id !== currentUserId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAdmin(member.id, member.is_admin)}
                          className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          {member.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user_id)}
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

          {/* Permissions Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Permission Levels</h3>
            <div className="text-sm space-y-1 text-gray-700">
              <p><strong>Admin:</strong> Can manage family settings, members, delete pets, and revoke share links</p>
              <p><strong>Member:</strong> Can view and edit pets, create records, and generate share links</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
