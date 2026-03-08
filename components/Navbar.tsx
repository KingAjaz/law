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

  const navClasses = 'bg-brand-600 border-b border-brand-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 transition-colors duration-300'

  const logoTextClass = 'text-white'
  const subLabelClass = 'text-white/80'
  const linkClass = (linkHref: string) =>
    `text-white/80 hover:text-white ${pathname === linkHref ? 'text-white font-semibold' : ''}`
  const authLinkClass = 'text-white/80 hover:text-white'
  const mobileMenuButtonClass = 'text-white'

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
              <div className="h-8 w-20 animate-pulse rounded bg-white/20"></div>
            ) : user ? (
              <>
                <Link href="/dashboard/settings" className={`text-sm font-medium transition-colors ${authLinkClass}`}>
                  Settings
                </Link>
                <Link href="/dashboard" className="btn text-sm btn-secondary-beige">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn text-sm btn-ghost-beige"
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
                <Link href="/signup" className="btn text-sm btn-primary">
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
          className="md:hidden border-t border-brand-700 bg-brand-600"
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
            <div className="pt-4 border-t border-brand-700 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block btn w-full text-center btn-ghost-beige border border-white/20"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block btn w-full text-center btn-secondary-beige"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block btn w-full btn-ghost-beige"
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
                    className="block text-center btn w-full btn-secondary-beige"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center btn w-full btn-primary"
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
