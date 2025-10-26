'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, UtensilsCrossed, Clock, Scale, StickyNote, Sparkles, Save, Edit, X, Loader2, Flame, Package, Users, Heart, Search, Tag, TrendingUp, BookmarkPlus, Image as ImageIcon, Upload } from 'lucide-react'

interface Meal {
  id: string
  fed_at: string
  food_type?: string
  amount?: string
  food_product_id?: string
  amount_grams?: number
  calories?: number
  notes?: string
  image_url?: string
  pet_food_products?: {
    id: string
    name: string
    brand?: string
    calories_per_100g: number
    image_url?: string
  }
}

interface FoodProduct {
  id: string
  name: string
  brand?: string
  calories_per_100g: number
  product_type?: string
  image_url?: string
}

interface MealTemplate {
  id: string
  name: string
  description: string | null
  species: string
  food_items: Array<{
    food_product_id?: string
    food_name: string
    amount_grams: number
    calories: number
  }>
  total_calories: number | null
  use_count: number
  like_count: number
  tags: string[]
  created_at: string
  is_liked?: boolean
  image_url?: string
}

type InputMode = 'manual' | 'product' | 'template'

export default function PetMeals({ petId, petSpecies }: { petId: string; petSpecies: string }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [foodProducts, setFoodProducts] = useState<FoodProduct[]>([])
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('manual')

  // Form state
  const [fedAt, setFedAt] = useState('')
  const [foodProductId, setFoodProductId] = useState('')
  const [amountGrams, setAmountGrams] = useState('')
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null)
  const [foodType, setFoodType] = useState('')
  const [amount, setAmount] = useState('')
  const [manualCalories, setManualCalories] = useState('')
  const [notes, setNotes] = useState('')

  // Template browsing state
  const [templateSearch, setTemplateSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateTags, setTemplateTags] = useState('')

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [templateImageFile, setTemplateImageFile] = useState<File | null>(null)
  const [templateImagePreview, setTemplateImagePreview] = useState<string | null>(null)

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadMeals()
    loadFoodProducts()
    loadTemplates()
  }, [petId, startDate, endDate])

  useEffect(() => {
    // Auto-calculate calories when product and grams are selected
    if (inputMode === 'product' && foodProductId && amountGrams) {
      const product = foodProducts.find(p => p.id === foodProductId)
      if (product) {
        const grams = parseFloat(amountGrams)
        const calories = (product.calories_per_100g * grams) / 100
        setCalculatedCalories(Math.round(calories * 10) / 10)
      }
    } else {
      setCalculatedCalories(null)
    }
  }, [inputMode, foodProductId, amountGrams, foodProducts])

  const loadMeals = async () => {
    setLoading(true)
    let query = supabase
      .from('pet_meals')
      .select(`
        *,
        pet_food_products (
          id,
          name,
          brand,
          calories_per_100g
        )
      `)
      .eq('pet_id', petId)
      .order('fed_at', { ascending: false })

    if (startDate) {
      query = query.gte('fed_at', startDate)
    }
    if (endDate) {
      query = query.lte('fed_at', endDate + 'T23:59:59')
    }

    const { data } = await query
    setMeals(data || [])
    setLoading(false)
  }

  const loadFoodProducts = async () => {
    const { data } = await supabase
      .from('pet_food_products')
      .select('*')
      .order('name', { ascending: true })

    setFoodProducts(data || [])
  }

  const loadTemplates = async () => {
    const { data: templatesData } = await supabase
      .from('shared_meal_templates')
      .select('*')
      .eq('species', petSpecies)
      .eq('is_public', true)
      .order('use_count', { ascending: false })

    // Check which templates current user has liked
    const { data: { user } } = await supabase.auth.getUser()
    if (user && templatesData) {
      const { data: likes } = await supabase
        .from('meal_template_likes')
        .select('template_id')
        .eq('user_id', user.id)

      const likedIds = new Set(likes?.map(l => l.template_id) || [])
      const templatesWithLikes = templatesData.map(t => ({
        ...t,
        is_liked: likedIds.has(t.id)
      }))
      setTemplates(templatesWithLikes)
    } else {
      setTemplates(templatesData || [])
    }
  }

  const resetForm = () => {
    setFedAt('')
    setInputMode('manual')
    setFoodProductId('')
    setAmountGrams('')
    setCalculatedCalories(null)
    setFoodType('')
    setAmount('')
    setManualCalories('')
    setNotes('')
    setSelectedTemplate(null)
    setEditingId(null)
    setShowForm(false)
    setShowSaveTemplate(false)
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
    setImageFile(null)
    setImagePreview(null)
    setTemplateImageFile(null)
    setTemplateImagePreview(null)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('meal-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Image upload failed:', error)
      return null
    }
  }

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

  const handleTemplateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTemplateImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTemplateImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id)
    setFedAt(meal.fed_at.substring(0, 16))

    if (meal.food_product_id) {
      setInputMode('product')
      setFoodProductId(meal.food_product_id)
      setAmountGrams(meal.amount_grams?.toString() || '')
    } else {
      setInputMode('manual')
      setFoodType(meal.food_type || '')
      setAmount(meal.amount || '')
      setManualCalories(meal.calories?.toString() || '')
    }

    setNotes(meal.notes || '')
    if (meal.image_url) {
      setImagePreview(meal.image_url)
    }
    setShowForm(true)
  }

  const handleTemplateSelect = (template: MealTemplate) => {
    setSelectedTemplate(template)
    // テンプレート選択後もtemplateモードのままにする
    // 保存時にテンプレートの内容が使用される
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Upload image if provided
      let imageUrl: string | null = null

      if (inputMode === 'template' && selectedTemplate) {
        // Use template's image
        imageUrl = selectedTemplate.image_url || null
      } else if (imageFile) {
        // Upload new image for manual or product mode
        imageUrl = await uploadImage(imageFile)
      }

      let mealData: any = {
        pet_id: petId,
        fed_at: fedAt,
        notes: notes || null,
        image_url: imageUrl,
      }

      if (inputMode === 'template' && selectedTemplate) {
        // Using a template - use the first item from template
        const firstItem = selectedTemplate.food_items[0]
        if (firstItem) {
          if (firstItem.food_product_id) {
            // Template item is a product
            mealData = {
              ...mealData,
              food_product_id: firstItem.food_product_id,
              amount_grams: firstItem.amount_grams,
              calories: firstItem.calories,
              food_type: null,
              amount: null,
            }
          } else {
            // Template item is manual entry
            mealData = {
              ...mealData,
              food_type: firstItem.food_name,
              amount: `${firstItem.amount_grams}g`,
              calories: firstItem.calories,
              food_product_id: null,
              amount_grams: null,
            }
          }
        }
      } else if (inputMode === 'product' && foodProductId) {
        // Using a food product
        mealData = {
          ...mealData,
          food_product_id: foodProductId,
          amount_grams: amountGrams ? parseFloat(amountGrams) : null,
          calories: calculatedCalories,
          food_type: null,
          amount: null,
        }
      } else if (inputMode === 'manual') {
        // Manual entry
        mealData = {
          ...mealData,
          food_type: foodType || null,
          amount: amount || null,
          calories: manualCalories ? parseFloat(manualCalories) : null,
          food_product_id: null,
          amount_grams: null,
        }
      }

      if (editingId) {
        await supabase.from('pet_meals').update(mealData).eq('id', editingId)
      } else {
        await supabase.from('pet_meals').insert(mealData)
        // Increment template use count if used
        if (selectedTemplate) {
          await supabase.rpc('increment_template_use_count', { template_id: selectedTemplate.id })
        }
      }

      resetForm()
      loadMeals()
      loadTemplates()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この食事記録を削除してもよろしいですか？')) return
    await supabase.from('pet_meals').delete().eq('id', id)
    loadMeals()
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUploading(true)

    try {
      // Upload template image if provided
      let templateImageUrl: string | null = null
      if (templateImageFile) {
        templateImageUrl = await uploadImage(templateImageFile)
      }

      let foodItems: any[] = []
      let totalCalories = 0

      if (inputMode === 'product' && foodProductId) {
        const product = foodProducts.find(p => p.id === foodProductId)
        if (product && amountGrams) {
          const grams = parseFloat(amountGrams)
          const calories = (product.calories_per_100g * grams) / 100
          foodItems = [{
            food_product_id: foodProductId,
            food_name: product.name,
            amount_grams: grams,
            calories: Math.round(calories * 10) / 10
          }]
          totalCalories = Math.round(calories * 10) / 10
        }
      } else if (inputMode === 'manual') {
        if (foodType && amount) {
          const calories = manualCalories ? parseFloat(manualCalories) : 0
          foodItems = [{
            food_name: foodType,
            amount_grams: parseFloat(amount.replace(/[^\d.]/g, '')) || 0,
            calories: calories
          }]
          totalCalories = calories
        }
      }

      if (foodItems.length === 0) {
        alert('保存する食事データを入力してください')
        return
      }

      const tags = templateTags.split(',').map(t => t.trim()).filter(t => t.length > 0)

      const { error } = await supabase.from('shared_meal_templates').insert({
        name: templateName,
        description: templateDescription || null,
        species: petSpecies,
        food_items: foodItems,
        total_calories: totalCalories,
        tags: tags,
        image_url: templateImageUrl,
        created_by: user.id
      })

      if (error) {
        alert('テンプレートの保存に失敗しました')
        console.error(error)
      } else {
        alert('テンプレートを保存しました！')
        setShowSaveTemplate(false)
        setTemplateName('')
        setTemplateDescription('')
        setTemplateTags('')
        setTemplateImageFile(null)
        setTemplateImagePreview(null)
        loadTemplates()
      }
    } finally {
      setUploading(false)
    }
  }

  const handleToggleLike = async (templateId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: isLiked } = await supabase.rpc('toggle_template_like', { template_id: templateId })
    loadTemplates()
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.description?.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(templateSearch.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-gray-800">期間で絞り込み</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              開始日
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              終了日
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all w-full sm:w-auto"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full gradient-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          食事を追加
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-gray-800">{editingId ? '食事を編集' : '食事を記録'}</h3>
            </div>
            {!editingId && inputMode === 'manual' && (
              <button
                type="button"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="text-sm px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
              >
                <BookmarkPlus className="w-4 h-4" />
                テンプレート保存
              </button>
            )}
          </div>

          {/* Save as Template Dialog */}
          {showSaveTemplate && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-3">
              <h4 className="font-bold text-purple-900 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5" />
                テンプレートとして保存
              </h4>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="テンプレート名（例: 朝ごはんセット）"
                className="w-full px-4 py-2 border border-purple-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="説明（任意）"
                rows={2}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />
              <input
                type="text"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
                placeholder="タグ（カンマ区切り。例: 朝食,バランス）"
                className="w-full px-4 py-2 border border-purple-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">写真（任意）</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateImageChange}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                {templateImagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={templateImagePreview}
                      alt="Template preview"
                      className="w-full max-h-32 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateImageFile(null)
                        setTemplateImagePreview(null)
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                日時 *
              </label>
              <input
                type="datetime-local"
                required
                value={fedAt}
                onChange={(e) => setFedAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              />
            </div>

            {/* 3-way toggle for input mode */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputMode('manual')
                  setSelectedTemplate(null)
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg font-semibold transition-all text-sm ${
                  inputMode === 'manual'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                手動入力
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('product')
                  setSelectedTemplate(null)
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg font-semibold transition-all text-sm ${
                  inputMode === 'product'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                製品から選択
              </button>
              <button
                type="button"
                onClick={() => setInputMode('template')}
                className={`flex-1 py-2.5 px-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-1 ${
                  inputMode === 'template'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                共有メニュー
              </button>
            </div>

            {inputMode === 'template' && (
              /* Template Selection Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    テンプレートを検索
                  </label>
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="名前、説明、タグで検索"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>テンプレートが見つかりませんでした</p>
                    </div>
                  ) : (
                    filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedTemplate?.id === template.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{template.name}</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleLike(template.id)
                            }}
                            className="text-red-500 hover:scale-110 transition-transform"
                          >
                            <Heart className={`w-5 h-5 ${template.is_liked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        {template.image_url && (
                          <div className="mb-2">
                            <img
                              src={template.image_url}
                              alt={template.name}
                              className="w-full max-h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        {template.description && (
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {template.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {template.use_count}回使用
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {template.like_count}いいね
                          </span>
                          {template.total_calories && (
                            <span className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5" />
                              {template.total_calories} kcal
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          {template.food_items.map((item, idx) => (
                            <div key={idx}>
                              {item.food_name} - {item.amount_grams}g ({item.calories} kcal)
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedTemplate && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-semibold">
                      ✓ 「{selectedTemplate.name}」を選択しました
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      以下のフォームで内容を確認・編集してから保存してください
                    </p>
                  </div>
                )}
              </div>
            )}

            {inputMode === 'product' && (
              /* Product Selection Mode */
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    製品を選択 *
                  </label>
                  <select
                    required
                    value={foodProductId}
                    onChange={(e) => setFoodProductId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                  >
                    <option value="">製品を選択してください</option>
                    {foodProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.brand && `(${product.brand})`} - {product.calories_per_100g} kcal/100g
                      </option>
                    ))}
                  </select>
                  {foodProducts.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      設定ページから製品を追加してください
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    量 (グラム) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={amountGrams}
                    onChange={(e) => setAmountGrams(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                  />
                </div>

                {calculatedCalories !== null && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        カロリー: {calculatedCalories} kcal
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {inputMode === 'manual' && (
              /* Manual Entry Mode */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      食事の種類
                    </label>
                    <input
                      type="text"
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                      placeholder="例: ドライフード"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      量
                    </label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="例: 100g"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    カロリー (kcal)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="例: 350"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                  />
                </div>
              </>
            )}

            {/* Image upload - only for manual and product modes */}
            {inputMode !== 'template' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  写真（任意）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
                />
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Template image preview - only for template mode */}
            {inputMode === 'template' && selectedTemplate?.image_url && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  テンプレートの写真
                </label>
                <img
                  src={selectedTemplate.image_url}
                  alt={selectedTemplate.name}
                  className="w-full max-h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ※ テンプレートから登録する場合、この写真が使用されます
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                メモ
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all resize-none"
                placeholder="食事の様子をメモ"
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
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-3">読み込み中...</p>
          </div>
        ) : meals.length > 0 ? (
          meals.map((meal, index) => (
            <div
              key={meal.id}
              className="p-5 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    <span>
                      {new Date(meal.fed_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    {meal.pet_food_products && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {meal.pet_food_products.name}
                        {meal.pet_food_products.brand && ` (${meal.pet_food_products.brand})`}
                      </span>
                    )}
                    {meal.food_type && !meal.pet_food_products && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        {meal.food_type}
                      </span>
                    )}
                    {meal.amount_grams && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" />
                        {meal.amount_grams}g
                      </span>
                    )}
                    {meal.amount && !meal.amount_grams && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" />
                        {meal.amount}
                      </span>
                    )}
                    {meal.calories && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                  {meal.image_url && (
                    <div className="mt-3">
                      <img
                        src={meal.image_url}
                        alt="食事の写真"
                        className="w-full max-h-64 object-cover rounded-xl border-2 border-gray-200"
                      />
                    </div>
                  )}
                  {meal.notes && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">
                      {meal.notes}
                    </p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="flex-1 sm:flex-none text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだ食事の記録がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
