'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/providers'
import { signOut } from '@/lib/auth'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOverWhite, setIsOverWhite] = useState(false)

  // Determine if we're on home page (beige background)
  const isHomePage = pathname === '/'

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
      if (!elementBelow || !(elementBelow instanceof HTMLElement)) {
        setIsOverWhite(false)
        return
      }

      // Traverse up the DOM tree to find the section
      let currentElement: HTMLElement | null = elementBelow
      while (currentElement && currentElement !== document.body) {
        if (currentElement.tagName === 'SECTION') {
          const section = currentElement
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

  const navClasses = isOverWhite || !isHomePage
    ? 'bg-white/95 border-b border-brand-200 sticky top-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300'
    : 'bg-brand-600 border-b border-brand-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 transition-colors duration-300'

  const logoTextClass = isOverWhite || !isHomePage ? 'text-brand-700' : 'text-white'
  const subLabelClass = isOverWhite || !isHomePage ? 'text-brand-600' : 'text-white/80'
  const linkClass = (linkHref: string) =>
    `${isOverWhite || !isHomePage ? 'text-brand-600 hover:text-brand-700' : 'text-white/80 hover:text-white'} 
    ${pathname === linkHref ? (isOverWhite || !isHomePage ? 'text-brand-700' : 'text-white') : ''}`
  const authLinkClass = isOverWhite || !isHomePage ? 'text-brand-600 hover:text-brand-700' : 'text-white/80 hover:text-white'
  const mobileMenuButtonClass = isOverWhite || !isHomePage ? 'text-brand-700' : 'text-white'

  return (
    <nav className={navClasses} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="LegalEase home">
            <div className="relative w-40 h-12">
              <Image
                src="/LegalEase Logo backless.png"
                alt="LegalEase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${linkClass(link.href)}`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className={`h-8 w-20 animate-pulse rounded ${isOverWhite || !isHomePage ? 'bg-brand-200' : 'bg-white/20'}`}></div>
            ) : user ? (
              <>
                <Link href="/dashboard" className={`btn text-sm ${isOverWhite || !isHomePage ? 'btn-secondary' : 'btn-secondary-beige'}`}>
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`btn text-sm ${isOverWhite || !isHomePage ? 'btn-ghost' : 'btn-ghost-beige'}`}
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-sm font-medium transition-colors ${authLinkClass}`}>
                  Login
                </Link>
                <Link href="/signup" className={`btn text-sm ${isOverWhite || !isHomePage ? 'btn-primary-beige' : 'btn-primary'}`}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 ${mobileMenuButtonClass}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden border-t ${isOverWhite || !isHomePage ? 'border-brand-200 bg-white' : 'border-brand-700 bg-brand-600'}`}
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${linkClass(link.href)}`}
                role="menuitem"
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className={`pt-4 border-t ${isOverWhite || !isHomePage ? 'border-brand-200' : 'border-brand-700'} space-y-2`}>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block btn w-full text-center ${isOverWhite || !isHomePage ? 'btn-secondary' : 'btn-secondary-beige'}`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className={`block btn w-full ${isOverWhite || !isHomePage ? 'btn-ghost' : 'btn-ghost-beige'}`}
                    role="menuitem"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-center btn w-full ${isOverWhite || !isHomePage ? 'btn-secondary' : 'btn-secondary-beige'}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-center btn w-full ${isOverWhite || !isHomePage ? 'btn-primary-beige' : 'btn-primary'}`}
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
