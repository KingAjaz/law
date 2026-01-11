import { Metadata } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'
const defaultImage = `${appUrl}/og-image.png`

interface GenerateMetadataOptions {
  title: string
  description: string
  path?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}

/**
 * Generate SEO metadata for pages
 */
export function generateMetadata({
  title,
  description,
  path = '',
  keywords = [],
  image = defaultImage,
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const url = `${appUrl}${path}`

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: 'LegalEase',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_NG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
    alternates: {
      canonical: url,
    },
  }
}
