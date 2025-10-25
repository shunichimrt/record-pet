'use client'

import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdBannerProps {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string
  backgroundColor?: string
  textColor?: string
  position?: 'top' | 'bottom' | 'sidebar'
}

export default function AdBanner({
  id,
  title,
  description,
  imageUrl,
  linkUrl,
  backgroundColor = 'from-blue-50 to-purple-50',
  textColor = 'text-gray-800',
  position = 'bottom',
}: AdBannerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const supabase = createClient()

  const handleClick = async () => {
    // Track ad click in database
    try {
      await supabase.rpc('increment_banner_click', { banner_id: id })
    } catch (error) {
      console.error('Failed to track click:', error)
    }

    // Track with analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'ad_click', {
        ad_title: title,
        ad_url: linkUrl,
      })
    }
  }

  const positionClasses = {
    top: 'mb-8',
    bottom: 'mt-8',
    sidebar: 'mb-6',
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`block ${positionClasses[position]} group`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${backgroundColor} border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ${
          isHovered ? 'scale-[1.02]' : ''
        }`}
      >
        {/* Sponsored Label */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-gray-600 font-medium">
            広告
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 p-4 md:p-6">
          {/* Image Section */}
          {imageUrl && (
            <div className="flex-shrink-0 w-full md:w-48 h-24 md:h-24 relative rounded-xl overflow-hidden bg-white shadow-sm">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-contain p-2 md:p-4"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 text-center md:text-left w-full">
            <h3 className={`text-base md:text-xl font-bold ${textColor} group-hover:text-blue-600 transition-colors`}>
              {title}
            </h3>
            {/* 説明文と「詳しく見る」リンクはデスクトップのみ表示 */}
            {description && (
              <p className="hidden md:block text-base text-gray-600 mt-2 mb-3">
                {description}
              </p>
            )}
            <div className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all mt-2">
              詳しく見る
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </a>
  )
}
