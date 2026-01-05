'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react'

// Banner slide configuration
interface BannerSlide {
  id: number
  image: string
  headline: string
  subtext: string
  ctaText: string
  ctaLink: string
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1280&q=75&auto=format&fit=crop',
    headline: 'Your Trusted Legal Partner',
    subtext: 'Empowering your business success through strategic contract review and legal expertise by licensed Nigerian lawyers.',
    ctaText: 'Upload Contract',
    ctaLink: '/signup',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1280&q=75&auto=format&fit=crop',
    headline: 'Professional Contract Review',
    subtext: 'Get comprehensive legal analysis of your contracts by experienced lawyers. Quality, professionalism, and timely delivery guaranteed.',
    ctaText: 'Get Started',
    ctaLink: '/signup',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1280&q=75&auto=format&fit=crop',
    headline: 'Expert Legal Consultation',
    subtext: 'Connect with licensed Nigerian lawyers for professional contract review services tailored to your business needs.',
    ctaText: 'Contact Us',
    ctaLink: '/contact',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1280&q=75&auto=format&fit=crop',
    headline: 'Secure & Confidential',
    subtext: 'Your documents are handled with the utmost security and confidentiality by our team of licensed legal professionals.',
    ctaText: 'Learn More',
    ctaLink: '/services',
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

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

  const currentSlideData = bannerSlides[currentSlide]

  return (
    <section
      className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden"
      aria-label="Hero banner carousel"
    >
      {/* Background Images with Smooth Crossfade - No white background visible */}
      <div className="absolute inset-0 bg-brand-600">
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
                alt={slide.headline}
                fill
                priority={index === 0}
                quality={85}
                className="object-cover"
                sizes="100vw"
              />
              {/* Minimal overlay for text readability - keeping images clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-brand-600/15 to-brand-600/10" />
            </motion.div>
          )
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white leading-tight">
                {currentSlideData.headline}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
                {currentSlideData.subtext}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={currentSlideData.ctaLink}
                  className="btn btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  {currentSlideData.ctaText}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
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
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              index === currentSlide
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
