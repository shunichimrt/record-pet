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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 card-hover">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">👨‍👩‍👧‍👦</span>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent">
                  {family?.name}
                </h1>
              </div>
              <p className="text-gray-600 text-sm ml-14">家族の記録を管理</p>
            </div>
            <div className="flex gap-3 items-center flex-wrap justify-end">
              <Link
                href="/app/pets"
                className="flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <span>🐾</span>
                ペット
              </Link>
              {isAdmin && (
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <span>⚙️</span>
                  設定
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <span>👋</span>
                <span className="hidden sm:inline">サインアウト</span>
              </button>
            </div>
          </div>

          {/* Family ID Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔑</span>
              <h2 className="text-lg font-bold text-gray-800">Family ID</h2>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-xl font-mono text-sm break-all border-2 border-dashed border-blue-200 mb-2">
              {familyId}
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <span>💡</span>
              このIDを共有して家族メンバーを招待
            </p>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">👥</span>
            <h2 className="text-2xl font-bold text-gray-800">
              メンバー
              <span className="ml-2 text-lg font-normal text-gray-500">
                ({members.length}人)
              </span>
            </h2>
          </div>

          <div className="grid gap-4">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {member.role === 'father' ? '👨' :
                         member.role === 'mother' ? '👩' :
                         member.role === 'son' ? '👦' :
                         member.role === 'daughter' ? '👧' : '👤'}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <span>{member.user_id.substring(0, 8)}...</span>
                          {member.user_id === userId && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              あなた
                            </span>
                          )}
                          {member.is_admin && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                              <span>⭐</span>
                              管理者
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 capitalize flex items-center gap-2 mt-1">
                          <span className="font-medium">{
                            member.role === 'father' ? '父親' :
                            member.role === 'mother' ? '母親' :
                            member.role === 'son' ? '息子' :
                            member.role === 'daughter' ? '娘' : 'その他'
                          }</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(member.joined_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isAdmin && member.user_id !== userId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAdmin(member.id, member.is_admin)}
                        className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
                      >
                        {member.is_admin ? '管理者解除' : '管理者に設定'}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-all"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLeaveFamily}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              <span>🚪</span>
              家族から退出
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
