'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdBanner from './AdBanner'

interface Banner {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string
  background_color: string
  text_color: string
}

interface AdBannerCarouselProps {
  banners: Banner[]
  autoSlideInterval?: number // ミリ秒（デフォルト: 5000 = 5秒）
  position?: 'top' | 'bottom' | 'sidebar'
}

export default function AdBannerCarousel({
  banners,
  autoSlideInterval = 5000,
  position = 'top',
}: AdBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // バナーが1つ以下の場合は通常表示
  if (banners.length === 0) {
    return null
  }

  if (banners.length === 1) {
    return (
      <AdBanner
        id={banners[0].id}
        title={banners[0].title}
        description={banners[0].description}
        imageUrl={banners[0].image_url}
        linkUrl={banners[0].link_url}
        backgroundColor={banners[0].background_color}
        textColor={banners[0].text_color}
        position={position}
      />
    )
  }

  // 自動スライド
  useEffect(() => {
    // ホバー中は自動スライドを停止
    if (isHovered) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, autoSlideInterval)

    return () => clearInterval(timer)
  }, [banners.length, autoSlideInterval, isHovered])

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className="relative flex items-center gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 左矢印ボタン */}
      <button
        onClick={handlePrevious}
        className="flex-shrink-0 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
        aria-label="前のバナー"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* バナー表示 */}
      <div className="relative overflow-hidden flex-1">
        <AdBanner
          id={currentBanner.id}
          title={currentBanner.title}
          description={currentBanner.description}
          imageUrl={currentBanner.image_url}
          linkUrl={currentBanner.link_url}
          backgroundColor={currentBanner.background_color}
          textColor={currentBanner.text_color}
          position={position}
        />

        {/* バナー番号表示 */}
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
          {currentIndex + 1} / {banners.length}
        </div>
      </div>

      {/* 右矢印ボタン */}
      <button
        onClick={handleNext}
        className="flex-shrink-0 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
        aria-label="次のバナー"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  )
}
