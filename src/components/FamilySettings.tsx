'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Users, Key, Shield, Loader2, ArrowLeft, Info, UserCircle, AlertCircle } from 'lucide-react'

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

      alert('家族名を更新しました')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '家族名の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (memberId: string, currentIsAdmin: boolean) => {
    if (!confirm(`${currentIsAdmin ? '管理者権限を削除' : '管理者権限を付与'}しますか？`)) {
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
      alert('管理者権限の変更に失敗しました')
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
      alert('役割の変更に失敗しました')
    }
  }

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (userId === currentUserId) {
      alert('自分自身を削除することはできません。')
      return
    }

    if (!confirm('このメンバーを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      alert('メンバーの削除に失敗しました')
    }
  }

  return (
    <div className="min-h-screen gradient-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF8E53] to-[#FF6B6B] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent">家族設定</h1>
            </div>
            <Link
              href="/app"
              className="text-sm font-medium bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              ダッシュボード
            </Link>
          </div>

          <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>管理者のみ：</strong> 管理者のみが家族設定にアクセスして変更できます。
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Family Name */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              家族の名前
            </h2>
            <form onSubmit={handleUpdateFamilyName} className="flex gap-4">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading || familyName === family.name}
                className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </form>
          </div>

          {/* Family ID */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              家族ID
            </h2>
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 font-mono text-sm break-all">
              {family.id}
            </div>
            <p className="text-xs text-gray-600 mt-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              このIDを家族メンバーに共有して招待してください
            </p>
          </div>

          {/* Members Management */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              家族メンバー ({members.length}人)
            </h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-5 bg-gradient-to-r from-white to-purple-50 border border-purple-100 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-medium text-gray-800">
                          {member.user_id.substring(0, 8)}...
                          {member.user_id === currentUserId && ' (あなた)'}
                        </span>
                        {member.is_admin && (
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            管理者
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          disabled={member.user_id === currentUserId}
                          className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8E53] transition-all"
                        >
                          <option value="father">父親</option>
                          <option value="mother">母親</option>
                          <option value="son">息子</option>
                          <option value="daughter">娘</option>
                          <option value="other">その他</option>
                        </select>
                        <span className="text-xs text-gray-500">
                          参加日: {new Date(member.joined_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                    {member.user_id !== currentUserId && (
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <button
                          onClick={() => handleToggleAdmin(member.id, member.is_admin)}
                          className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                        >
                          {member.is_admin ? '管理者解除' : '管理者にする'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user_id)}
                          className="text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Info */}
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              権限レベル
            </h3>
            <div className="text-sm space-y-2 text-gray-700">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p><strong>管理者：</strong> 家族設定の管理、メンバー管理、ペットの削除、共有リンクの無効化が可能</p>
              </div>
              <div className="flex items-start gap-2">
                <UserCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p><strong>メンバー：</strong> ペットの閲覧・編集、記録の作成、共有リンクの生成が可能</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
