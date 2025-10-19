'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Role = 'father' | 'mother' | 'son' | 'daughter' | 'other'

export default function FamilySetup({ userId }: { userId: string }) {
  const [familyName, setFamilyName] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [role, setRole] = useState<Role>('other')
  const [isCreating, setIsCreating] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Creating family:', familyName, 'with role:', role)

      // Use PostgreSQL function to create family and add user as admin in one transaction
      // This avoids RLS policy issues with INSERT + SELECT
      const { data, error } = await supabase.rpc('create_family_with_admin', {
        family_name: familyName,
        user_role: role,
      })

      console.log('Family creation result:', { data, error })

      if (error) {
        console.error('Family creation error:', error)
        throw error
      }

      console.log('Family created successfully!')
      router.refresh()
    } catch (err) {
      console.error('Full error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family'
      setError(`エラー: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if family exists
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('id')
        .eq('id', familyId)
        .single()

      if (familyError) throw new Error('Family not found')

      // Add user as member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: userId,
          role,
          is_admin: false,
        })

      if (memberError) throw memberError

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join family')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Family Setup</h1>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-2 px-4 rounded ${
                isCreating
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Create Family
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-2 px-4 rounded ${
                !isCreating
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Join Family
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {isCreating ? (
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Family Name
                </label>
                <input
                  id="familyName"
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter family name"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Family'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <label htmlFor="familyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Family ID
                </label>
                <input
                  id="familyId"
                  type="text"
                  required
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter family ID"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Family'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleSignOut}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
