'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Banner slide configuration
interface BannerSlide {
  id: number
  image: string
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: '/IMG_9911.PNG',
  },
  {
    id: 2,
    image: '/IMG_9912.PNG',
  },
  {
    id: 3,
    image: '/IMG_9912 (1).PNG',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&q=75&auto=format&fit=crop',
  },
]

// Rotating sub-headlines
const subHeadlines = [
  'For law firms managing heavy contract volumes',
  'For startups scaling without a full-time GC',
  'For in-house teams that need extra legal capacity',
  'For fintechs operating across complex regulatory environments',
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentSubHeadline, setCurrentSubHeadline] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createSupabaseClient()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Preload all images for faster transitions
  useEffect(() => {
    if (typeof window === 'undefined') return

    const preloadImages = () => {
      bannerSlides.forEach((slide, index) => {
        // Check if link already exists to avoid duplicates
        const existingLink = document.querySelector(`link[data-preload-slide="${index}"]`)
        if (existingLink) return

        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = slide.image
        link.setAttribute('data-preload-slide', index.toString())
        document.head.appendChild(link)
      })
    }
    preloadImages()
  }, [])

  // Auto-advance slides - continues regardless of user interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 4000) // 4 seconds per slide

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate sub-headlines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubHeadline((prev) => (prev + 1) % subHeadlines.length)
    }, 3000) // 3 seconds per sub-headline

    return () => clearInterval(interval)
  }, [])

  // Navigate to specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Navigate to previous slide
  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }, [])

  // Navigate to next slide
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext])

  return (
    <section
      className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden"
      aria-label="Hero banner carousel"
    >
      {/* Background Images with Smooth Crossfade - No color flash visible */}
      <div className="absolute inset-0 bg-black">
        {bannerSlides.map((slide, index) => {
          const isActive = index === currentSlide

          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
              }}
              transition={{
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0"
              style={{ zIndex: isActive ? 1 : 0 }}
            >
              <Image
                src={slide.image}
                alt={`Hero banner slide ${index + 1}`}
                fill
                priority={index === 0}
                quality={85}
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          )
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            {/* Primary Headline (H1) - Static */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white leading-tight"
              style={{
                textShadow: '-1px -1px 0 #5B002D, 1px -1px 0 #5B002D, -1px 1px 0 #5B002D, 1px 1px 0 #5B002D, 2px 2px 4px rgba(91, 0, 45, 0.5)'
              }}
            >
              Legal Process Outsourcing and Fractional GC Services
            </h1>

            {/* Dynamic Rotating Sub-Headline */}
            <div className="h-12 md:h-16 mb-8 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSubHeadline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed"
                  style={{
                    textShadow: '-1px -1px 0 #5B002D, 1px -1px 0 #5B002D, -1px 1px 0 #5B002D, 1px 1px 0 #5B002D, 2px 2px 4px rgba(91, 0, 45, 0.5)'
                  }}
                >
                  {subHeadlines[currentSubHeadline]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Primary CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="btn btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2" aria-label="Slide indicators">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${index === currentSlide
              ? 'bg-brand-500 w-8'
              : 'bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  )
}
