import { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/lawyer', '/kyc', '/api/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
