'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  ExternalLink,
  Loader2,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface Banner {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string
  is_active: boolean
  display_position: string
  display_order: number
  background_color: string
  text_color: string
  start_date: string | null
  end_date: string | null
  click_count: number
  created_at: string
}

export default function AdminBannerManager({
  initialBanners,
}: {
  initialBanners: Banner[]
}) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [isCreating, setIsCreating] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    display_position: 'both',
    background_color: 'from-blue-50 to-purple-50',
    text_color: 'text-gray-800',
    start_date: '',
    end_date: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('ad-banners')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('ad-banners').getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = editingBanner?.image_url || null

      // Upload image if new file selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const bannerData = {
        ...formData,
        image_url: imageUrl,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('ad_banners')
          .update(bannerData)
          .eq('id', editingBanner.id)

        if (error) throw error
        alert('バナーを更新しました')
      } else {
        // Create new banner
        const { error } = await supabase
          .from('ad_banners')
          .insert([{ ...bannerData, display_order: banners.length }])

        if (error) throw error
        alert('バナーを作成しました')
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        link_url: '',
        display_position: 'both',
        background_color: 'from-blue-50 to-purple-50',
        text_color: 'text-gray-800',
        start_date: '',
        end_date: '',
      })
      setImageFile(null)
      setImagePreview(null)
      setIsCreating(false)
      setEditingBanner(null)
      router.refresh()
    } catch (err) {
      alert('エラーが発生しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link_url: banner.link_url,
      display_position: banner.display_position,
      background_color: banner.background_color,
      text_color: banner.text_color,
      start_date: banner.start_date?.split('T')[0] || '',
      end_date: banner.end_date?.split('T')[0] || '',
    })
    setImagePreview(banner.image_url)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このバナーを削除しますか？')) return

    try {
      const { error } = await supabase.from('ad_banners').delete().eq('id', id)

      if (error) throw error

      alert('バナーを削除しました')
      router.refresh()
    } catch (err) {
      alert('削除に失敗しました')
      console.error(err)
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      alert('更新に失敗しました')
      console.error(err)
    }
  }

  const moveOrder = async (banner: Banner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= banners.length) return

    try {
      const updates = [
        {
          id: banner.id,
          display_order: banners[targetIndex].display_order,
        },
        {
          id: banners[targetIndex].id,
          display_order: banner.display_order,
        },
      ]

      for (const update of updates) {
        await supabase
          .from('ad_banners')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }

      router.refresh()
    } catch (err) {
      alert('並び替えに失敗しました')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          新しいバナーを作成
        </button>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingBanner ? 'バナーを編集' : '新しいバナーを作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="例: One Kitchen - ペット用プレミアムフード"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                説明文
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="例: 愛するペットのために、厳選素材で作られた栄養バランス抜群のフードをお届けします"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                リンク先URL *
              </label>
              <input
                type="url"
                required
                value={formData.link_url}
                onChange={(e) =>
                  setFormData({ ...formData, link_url: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="https://onekitchen.jp"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                バナー画像
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5" />
                  画像を選択
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <span className="text-sm text-gray-600">{imageFile.name}</span>
                )}
              </div>
              {imagePreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Display Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                表示位置
              </label>
              <select
                value={formData.display_position}
                onChange={(e) =>
                  setFormData({ ...formData, display_position: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="both">両方（ダッシュボード＆ペット詳細）</option>
                <option value="dashboard">ダッシュボードのみ</option>
                <option value="pet_detail">ペット詳細のみ</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  表示開始日
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  表示終了日
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {editingBanner ? '更新' : '作成'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingBanner(null)
                  setFormData({
                    title: '',
                    description: '',
                    link_url: '',
                    display_position: 'both',
                    background_color: 'from-blue-50 to-purple-50',
                    text_color: 'text-gray-800',
                    start_date: '',
                    end_date: '',
                  })
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Frame className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">バナーがまだありません</p>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl shadow-sm p-6 border ${
                banner.is_active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Image */}
                {banner.image_url && (
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {banner.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Order */}
                      <button
                        onClick={() => moveOrder(banner, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="上に移動"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveOrder(banner, 'down')}
                        disabled={index === banners.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="下に移動"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Status */}
                      {banner.is_active ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          <Eye className="w-3 h-3" />
                          表示中
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          <EyeOff className="w-3 h-3" />
                          非表示
                        </span>
                      )}
                    </div>
                  </div>

                  {banner.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {banner.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {banner.link_url}
                    </a>
                    <span>表示位置: {banner.display_position}</span>
                    <span>クリック数: {banner.click_count}</span>
                    {banner.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(banner.start_date).toLocaleDateString('ja-JP')}
                        〜
                        {banner.end_date
                          ? new Date(banner.end_date).toLocaleDateString('ja-JP')
                          : '無期限'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => toggleActive(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {banner.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          非表示にする
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          表示する
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
