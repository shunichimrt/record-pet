'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Users, Key, PawPrint, Settings, LogOut, UserCircle2, Crown, Calendar } from 'lucide-react'

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
    if (!confirm('この家族から退出してもよろしいですか？')) return

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
    if (!confirm('このメンバーを削除してもよろしいですか？')) return

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
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 card-hover">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF8E53] to-[#FF6B6B] rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent truncate">
                  {family?.name}
                </h1>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm ml-0 sm:ml-[52px] lg:ml-[60px]">家族の記録を管理</p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto flex-wrap">
              <Link
                href="/app/pets"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 gradient-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">ペット</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/app/settings"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">設定</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm font-medium">サインアウト</span>
              </button>
            </div>
          </div>

          {/* Family ID Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">家族ID</h2>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 sm:p-4 rounded-xl font-mono text-xs sm:text-sm break-all border-2 border-dashed border-blue-200 mb-2">
              {familyId}
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <span className="inline-flex w-5 h-5 bg-yellow-100 rounded items-center justify-center flex-shrink-0">
                <Key className="w-3 h-3 text-yellow-600" />
              </span>
              このIDを共有して家族メンバーを招待
            </p>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              メンバー
              <span className="ml-2 text-base sm:text-lg font-normal text-gray-500">
                ({members.length}人)
              </span>
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <UserCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{member.user_id.substring(0, 8)}...</span>
                        {member.user_id === userId && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap">
                            あなた
                          </span>
                        )}
                        {member.is_admin && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 sm:py-1 rounded-full font-medium flex items-center gap-1 whitespace-nowrap">
                            <Crown className="w-3 h-3" />
                            管理者
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-medium">{
                          member.role === 'father' ? '父親' :
                          member.role === 'mother' ? '母親' :
                          member.role === 'son' ? '息子' :
                          member.role === 'daughter' ? '娘' : 'その他'
                        }</span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(member.joined_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && member.user_id !== userId && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleToggleAdmin(member.id, member.is_admin)}
                        className="flex-1 sm:flex-none text-xs px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all whitespace-nowrap"
                      >
                        {member.is_admin ? '管理者解除' : '管理者に設定'}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex-1 sm:flex-none text-xs px-3 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-all"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLeaveFamily}
              className="flex items-center justify-center sm:justify-start gap-2 text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-4 py-2.5 rounded-lg transition-all w-full sm:w-auto text-sm"
            >
              <LogOut className="w-4 h-4" />
              家族から退出
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
