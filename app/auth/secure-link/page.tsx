'use client'

import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'

function SecureLinkContent() {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState<string | null>(null)
  const type = searchParams.get('type') || 'link'

  useEffect(() => {
    const rawUrl = searchParams.get('url')
    if (rawUrl) {
      const decoded = decodeURIComponent(rawUrl)
      // Only allow http(s) links
      if (decoded.startsWith('http')) {
        setUrl(decoded)
      }
    }
  }, [searchParams])

  const handleContinue = () => {
    if (url) {
      window.location.href = url
    }
  }

  const isReset = type === 'reset'
  const Icon = isReset ? Lock : (type === 'verify' ? Mail : ShieldCheck)
  const title = isReset ? 'Secure Password Reset' : (type === 'verify' ? 'Secure Email Verification' : 'Secure Link Verification')
  const buttonText = isReset ? 'Continue to Reset Password' : (type === 'verify' ? 'Verify My Email' : 'Continue')

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="card">
            <Icon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              To protect your account and prevent email security scanners from accidentally expiring your secure link in the background, please click the button below to safely continue.
            </p>
            <button
              onClick={handleContinue}
              disabled={!url}
              className="btn btn-primary w-full flex justify-center items-center"
            >
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SecureLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </main>
        <Footer />
      </div>
    }>
      <SecureLinkContent />
    </Suspense>
  )
}
