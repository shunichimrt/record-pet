'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Users, Sparkles, Link2, Key, UserCircle, AlertCircle, Loader2, LogOut } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FF8E53] to-[#FF6B6B] rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent mb-2">
              家族を設定
            </h1>
            <p className="text-gray-600 text-sm">
              家族を作成するか、既存の家族に参加
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isCreating
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              家族を作成
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                !isCreating
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Link2 className="w-4 h-4" />
              家族に参加
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 animate-slide-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isCreating ? (
            <form onSubmit={handleCreateFamily} className="space-y-6">
              <div>
                <label htmlFor="familyName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  家族の名前
                </label>
                <input
                  id="familyName"
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                  placeholder="例: 村田家"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  あなたの役割
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                >
                  <option value="father">父親</option>
                  <option value="mother">母親</option>
                  <option value="son">息子</option>
                  <option value="daughter">娘</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    家族を作成
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily} className="space-y-6">
              <div>
                <label htmlFor="familyId" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Family ID
                </label>
                <input
                  id="familyId"
                  type="text"
                  required
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all font-mono text-sm"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              <div>
                <label htmlFor="joinRole" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  あなたの役割
                </label>
                <select
                  id="joinRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                >
                  <option value="father">父親</option>
                  <option value="mother">母親</option>
                  <option value="son">息子</option>
                  <option value="daughter">娘</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    参加中...
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    家族に参加
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-50 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              サインアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
