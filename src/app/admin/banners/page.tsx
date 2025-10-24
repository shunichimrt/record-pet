import { createClient } from '@/lib/supabase/server'
import AdminBannerManager from '@/components/admin/AdminBannerManager'
import { Frame } from 'lucide-react'

export default async function AdminBannersPage() {
  const supabase = await createClient()

  // Fetch all banners
  const { data: banners } = await supabase
    .from('ad_banners')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Frame className="w-8 h-8" />
          バナー広告管理
        </h1>
        <p className="mt-2 text-gray-600">
          ユーザー画面に表示するバナー広告を管理します
        </p>
      </div>

      {/* Banner Manager */}
      <AdminBannerManager initialBanners={banners || []} />
    </div>
  )
}
