'use client'

import { useState } from 'react'
import { FileDown, Calendar, X, Loader2 } from 'lucide-react'

interface DownloadPdfButtonProps {
  petId: string
  petName: string
  startDate?: string
  endDate?: string
}

export default function DownloadPdfButton({
  petId,
  petName,
  startDate,
  endDate,
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(startDate || '')
  const [localEndDate, setLocalEndDate] = useState(endDate || '')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (localStartDate) params.append('startDate', localStartDate)
      if (localEndDate) params.append('endDate', localEndDate)

      const response = await fetch(
        `/api/pets/${petId}/pdf?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('PDFの生成に失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${petName}-記録.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('PDFのダウンロードに失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="w-full gradient-success text-black px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
      >
        <FileDown className="w-5 h-5" />
        PDFダウンロード
      </button>

      {showDatePicker && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100 space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              開始日（任意）
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#86EFAC] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              終了日（任意）
            </label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#86EFAC] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  PDF生成
                </>
              )}
            </button>
            <button
              onClick={() => {
                setLocalStartDate('')
                setLocalEndDate('')
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
