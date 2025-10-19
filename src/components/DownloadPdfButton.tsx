'use client'

import { useState } from 'react'

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
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${petName}-records.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to download PDF')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
      >
        📄 Download PDF
      </button>

      {showDatePicker && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate PDF'}
            </button>
            <button
              onClick={() => {
                setLocalStartDate('')
                setLocalEndDate('')
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
