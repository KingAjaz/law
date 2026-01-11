'use client'

import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>
}

/**
 * Component to add structured data (JSON-LD) for SEO
 * Use this in client components where metadata exports aren't available
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Generate Organization structured data
 */
export function getOrganizationStructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@legalease.com'
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+234 XXX XXX XXXX'

  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: 'LegalEase',
    description: 'Professional contract review services by licensed Nigerian lawyers',
    url: appUrl,
    logo: `${appUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactPhone,
      contactType: 'Customer Service',
      email: contactEmail,
      areaServed: 'NG',
      availableLanguage: 'en',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressCountry: 'NG',
    },
    sameAs: [
      process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
      process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
      process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
    ].filter(Boolean) as string[],
  }
}

/**
 * Generate WebSite structured data
 */
export function getWebsiteStructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LegalEase',
    url: appUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Service structured data
 */
export function getServiceStructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Contract Review Service',
    provider: {
      '@type': 'LegalService',
      name: 'LegalEase',
      url: appUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: appUrl,
      serviceType: 'Online',
    },
  }
}

/**
 * Generate BreadcrumbList structured data
 */
export function getBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalease.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${appUrl}${item.url}`,
    })),
  }
}
