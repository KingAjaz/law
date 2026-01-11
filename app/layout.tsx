import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'LegalEase | Professional Contract Review Services',
    template: '%s | LegalEase',
  },
  description: 'Get your legal contracts reviewed by licensed Nigerian lawyers. Fast, secure, and professional contract review services for startups, fintech, and technology companies.',
  keywords: [
    'contract review',
    'legal services',
    'Nigerian lawyers',
    'contract analysis',
    'legal document review',
    'business contracts',
    'startup legal services',
    'fintech legal',
    'technology contracts',
    'NDA review',
    'SLA review',
    'MSA review',
  ],
    authors: [{ name: 'LegalEase' }],
  creator: 'LegalEase',
  publisher: 'LegalEase',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: appUrl,
    siteName: 'LegalEase',
    title: 'LegalEase | Professional Contract Review Services',
    description: 'Get your legal contracts reviewed by licensed Nigerian lawyers. Fast, secure, and professional.',
    images: [
      {
        url: '/og-image.png', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'LegalEase - Professional Contract Review Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegalEase | Professional Contract Review Services',
    description: 'Get your legal contracts reviewed by licensed Nigerian lawyers. Fast, secure, and professional.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
              return (
                <html lang="en">
                  <body className={poppins.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </ErrorBoundary>
      </body>
                </html>
              )
}
