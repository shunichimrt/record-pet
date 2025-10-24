import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Package, Users, Database, Home } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get system-wide statistics using SECURITY DEFINER functions
  // These functions bypass RLS to get accurate counts
  const { data: statsData } = await supabase.rpc('get_system_statistics')

  const productsCount = statsData?.total_food_products || 0
  const publicProductsCount = statsData?.public_food_products || 0
  const usersCount = statsData?.total_users || 0
  const petsCount = statsData?.total_pets || 0
  const familiesCount = statsData?.total_families || 0

  const stats = [
    {
      label: '総ユーザー数',
      value: usersCount,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      description: 'システム登録ユーザー',
    },
    {
      label: '総家族数',
      value: familiesCount,
      icon: Home,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      description: '登録されている家族',
    },
    {
      label: '総ペット数',
      value: petsCount,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      description: 'すべての家族のペット',
    },
    {
      label: '総製品数',
      value: productsCount,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      description: 'フード製品データベース',
    },
    {
      label: '公開製品数',
      value: publicProductsCount,
      icon: Database,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      description: '全ユーザーが使用可能',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8" />
          管理ダッシュボード
        </h1>
        <p className="mt-2 text-gray-600">
          システム全体の統計情報と管理機能
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/food-products"
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-orange-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">フード製品管理</h3>
              <p className="text-sm text-gray-600">
                公開製品の追加・編集・削除
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-2">管理者権限について</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• すべてのフード製品（公開・プライベート）を管理できます</li>
          <li>• 公開製品は全ユーザーが使用できます</li>
          <li>• プライベート製品は作成者のみが使用できます</li>
        </ul>
      </div>
    </div>
  )
}
