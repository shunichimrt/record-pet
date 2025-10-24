import AdminFoodProductsManager from '@/components/admin/AdminFoodProductsManager'
import { Package } from 'lucide-react'

export default function AdminFoodProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8" />
          フード製品管理
        </h1>
        <p className="mt-2 text-gray-600">
          システム全体で使用可能な公開フード製品を管理します
        </p>
      </div>

      <AdminFoodProductsManager />
    </div>
  )
}
