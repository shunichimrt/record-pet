'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Package, Sparkles, Save, Edit, X, Loader2, Trash2, Search } from 'lucide-react'

interface FoodProduct {
  id: string
  name: string
  brand?: string
  calories_per_100g: number
  product_type?: string
  species?: string
  notes?: string
  is_public: boolean
  created_by?: string
}

export default function FoodProductsManager() {
  const [products, setProducts] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterSpecies, setFilterSpecies] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [caloriesPer100g, setCaloriesPer100g] = useState('')
  const [productType, setProductType] = useState('ドライフード')
  const [species, setSpecies] = useState('dog')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [filterSpecies])

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('pet_food_products')
      .select('*')
      .order('is_public', { ascending: false })
      .order('name', { ascending: true })

    if (filterSpecies !== 'all') {
      query = query.eq('species', filterSpecies)
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setBrand('')
    setCaloriesPer100g('')
    setProductType('ドライフード')
    setSpecies('dog')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (product: FoodProduct) => {
    setEditingId(product.id)
    setName(product.name)
    setBrand(product.brand || '')
    setCaloriesPer100g(product.calories_per_100g.toString())
    setProductType(product.product_type || 'ドライフード')
    setSpecies(product.species || 'dog')
    setNotes(product.notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name,
      brand: brand || null,
      calories_per_100g: parseFloat(caloriesPer100g),
      product_type: productType,
      species,
      notes: notes || null,
    }

    if (editingId) {
      await supabase.from('pet_food_products').update(productData).eq('id', editingId)
    } else {
      await supabase.from('pet_food_products').insert(productData)
    }

    resetForm()
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この製品を削除してもよろしいですか？関連する食事記録から製品の紐付けが解除されます。')) return
    await supabase.from('pet_food_products').delete().eq('id', id)
    loadProducts()
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">フード製品管理</h2>
            <p className="text-sm text-gray-600">市販のペットフードを登録して、カロリー計算に使用できます</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="製品名やブランドで検索"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              種別
            </label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            >
              <option value="all">すべて</option>
              <option value="dog">犬用</option>
              <option value="cat">猫用</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          新しい製品を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-6 h-6 text-orange-600" />
            <h3 className="font-bold text-gray-800">{editingId ? '製品を編集' : '製品を追加'}</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              製品名 *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ロイヤルカナン ミニ アダルト"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ブランド
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="例: ロイヤルカナン"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                100gあたりカロリー (kcal) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={caloriesPer100g}
                onChange={(e) => setCaloriesPer100g(e.target.value)}
                placeholder="例: 389"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                種類
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              >
                <option value="ドライフード">ドライフード</option>
                <option value="ウェットフード">ウェットフード</option>
                <option value="おやつ">おやつ</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                対象種
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              >
                <option value="dog">犬</option>
                <option value="cat">猫</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
              placeholder="任意"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {editingId ? <Edit className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {editingId ? '更新' : '保存'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-3">読み込み中...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{product.name}</h4>
                    {product.is_public && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        公開製品
                      </span>
                    )}
                  </div>
                  {product.brand && (
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                      {product.calories_per_100g} kcal/100g
                    </span>
                    {product.product_type && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                        {product.product_type}
                      </span>
                    )}
                    {product.species && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        {product.species === 'dog' ? '犬用' : product.species === 'cat' ? '猫用' : 'その他'}
                      </span>
                    )}
                  </div>
                  {product.notes && (
                    <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-xl leading-relaxed">
                      {product.notes}
                    </p>
                  )}
                </div>
                {!product.is_public && (
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 sm:flex-none text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || filterSpecies !== 'all' ? '該当する製品がありません' : 'まだ製品が登録されていません'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
