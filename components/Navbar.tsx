'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/providers'
import { signOut } from '@/lib/auth'
import { Scale, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOverWhite, setIsOverWhite] = useState(false)

  useEffect(() => {
    if (pathname !== '/') {
      setIsOverWhite(false)
      return
    }

    const handleScroll = () => {
      const navbar = document.querySelector('nav')
      if (!navbar) return

      const navbarRect = navbar.getBoundingClientRect()
      const navbarBottom = navbarRect.bottom
      
      // Get the element at the center-bottom of the navbar
      const centerX = navbarRect.left + navbarRect.width / 2
      const pointY = navbarBottom + 1 // Just below the navbar
      
      const elementBelow = document.elementFromPoint(centerX, pointY)
      if (!elementBelow) {
        setIsOverWhite(false)
        return
      }

      // Traverse up the DOM tree to find the section
      let currentElement = elementBelow
      while (currentElement && currentElement !== document.body) {
        if (currentElement.tagName === 'SECTION') {
          const section = currentElement as HTMLElement
          const bgColor = window.getComputedStyle(section).backgroundColor
          const computedBg = bgColor.toLowerCase()
          
          // Check if section has white background
          const isWhite = section.classList.contains('bg-white') || 
                         computedBg.includes('rgb(255, 255, 255)') ||
                         computedBg === '#ffffff' ||
                         computedBg === 'white' ||
                         computedBg === 'rgba(255, 255, 255, 1)'
          
          setIsOverWhite(isWhite)
          return
        }
        currentElement = currentElement.parentElement
      }
      
      setIsOverWhite(false)
    }

    // Use requestAnimationFrame for smoother updates
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll() // Check on mount
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [pathname])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Expertise' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact Us' },
  ]

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const navClasses = isOverWhite
    ? 'bg-white/95 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm shadow-sm'
    : 'bg-primary-950 border-b border-primary-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95'

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gold-600 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className={`text-xl font-bold transition-colors ${isOverWhite ? 'text-primary-900' : 'text-white'}`}>
                LawTech NG
              </span>
              <p className={`text-xs transition-colors ${isOverWhite ? 'text-gray-600' : 'text-gray-400'}`}>
                Advocates & Solicitors
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? isOverWhite
                      ? 'text-gold-600'
                      : 'text-gold-400'
                    : isOverWhite
                      ? 'text-gray-700 hover:text-gold-600'
                      : 'text-gray-300 hover:text-gold-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-primary-800 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <Link href="/dashboard" className="btn btn-secondary text-sm">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn btn-ghost text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`text-sm font-medium transition-colors ${
                    isOverWhite
                      ? 'text-gray-700 hover:text-gold-600'
                      : 'text-gray-300 hover:text-gold-400'
                  }`}
                >
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors ${isOverWhite ? 'text-primary-900' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden border-t ${
            isOverWhite
              ? 'border-gray-200 bg-white'
              : 'border-primary-800 bg-primary-950'
          }`}
        >
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium transition-colors ${
                  pathname === link.href
                    ? isOverWhite
                      ? 'text-gold-600'
                      : 'text-gold-400'
                    : isOverWhite
                      ? 'text-gray-700 hover:text-gold-600'
                      : 'text-gray-300 hover:text-gold-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-primary-800 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block btn btn-secondary w-full text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block btn btn-ghost w-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center btn btn-secondary w-full"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center btn btn-primary w-full"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
