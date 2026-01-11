# Analytics & Tracking Guide

This guide provides recommendations and implementation options for adding analytics and tracking to LegalEase.

## Overview

Analytics can help you understand user behavior, track business metrics, and make data-driven decisions. This guide covers recommended events to track and how to integrate common analytics platforms.

## Recommended Events to Track

### User Engagement Events

1. **Page Views**
   - Homepage views
   - Pricing page views
   - Contact page views
   - Dashboard views

2. **Authentication Events**
   - User signups
   - User logins
   - Password resets requested
   - Email verifications

3. **KYC Events**
   - KYC submission started
   - KYC submission completed
   - KYC approval/rejection (admin action)

### Business-Critical Events

4. **Contract Events**
   - Contract upload initiated
   - Contract upload completed
   - Contract upload failed
   - Contract tier selected
   - Contract deleted

5. **Payment Events**
   - Payment initialization
   - Payment completed
   - Payment failed
   - Payment verification

6. **Workflow Events**
   - Contract assigned to lawyer
   - Contract review started
   - Contract review completed
   - Reviewed document downloaded

7. **Contact Form Events**
   - Contact form submission
   - Contact form submission failure

## Analytics Platform Options

### 1. Google Analytics 4 (GA4)

**Pros:**
- Free
- Industry standard
- Comprehensive reporting
- E-commerce tracking support

**Cons:**
- Privacy concerns (GDPR compliance needed)
- Can impact page load performance
- Requires privacy policy updates

**Implementation:**

1. **Install GA4:**
   ```bash
   npm install @next/third-parties
   ```

2. **Add to `app/layout.tsx`:**
   ```typescript
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <GoogleAnalytics gaId="G-XXXXXXXXXX" />
         </body>
       </html>
     )
   }
   ```

3. **Track Events:**
   ```typescript
   // In your component or API route
   import { track } from '@/lib/analytics'
   
   track('contract_uploaded', {
     tier: 'nda',
     amount: 60000,
     user_id: userId
   })
   ```

### 2. Mixpanel

**Pros:**
- Excellent event tracking
- User journey analysis
- Funnel analysis
- Cohort analysis

**Cons:**
- Paid plans for high volume
- Requires more setup

**Implementation:**

1. **Install Mixpanel:**
   ```bash
   npm install mixpanel-browser
   ```

2. **Create `lib/analytics.ts`:**
   ```typescript
   import mixpanel from 'mixpanel-browser'
   
   if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
     mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
       debug: process.env.NODE_ENV === 'development',
       track_pageview: true,
     })
   }
   
   export const track = (eventName: string, properties?: Record<string, any>) => {
     if (typeof window !== 'undefined') {
       mixpanel.track(eventName, properties)
     }
   }
   
   export const identify = (userId: string, traits?: Record<string, any>) => {
     if (typeof window !== 'undefined') {
       mixpanel.identify(userId)
       if (traits) {
         mixpanel.people.set(traits)
       }
     }
   }
   ```

### 3. PostHog

**Pros:**
- Open source option (self-hosted)
- Session recording
- Feature flags
- A/B testing
- Privacy-friendly

**Cons:**
- Self-hosted requires infrastructure
- Cloud version has pricing

**Implementation:**

1. **Install PostHog:**
   ```bash
   npm install posthog-js
   ```

2. **Create `lib/analytics.ts`:**
   ```typescript
   import posthog from 'posthog-js'
   
   if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
       api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
     })
   }
   
   export const track = (eventName: string, properties?: Record<string, any>) => {
     if (typeof window !== 'undefined') {
       posthog.capture(eventName, properties)
     }
   }
   ```

### 4. Plausible Analytics

**Pros:**
- Privacy-friendly (no cookies)
- GDPR compliant by default
- Simple setup
- Lightweight

**Cons:**
- Less detailed than other options
- Paid (but affordable)
- Limited event tracking capabilities

**Implementation:**

1. **Add script to `app/layout.tsx`:**
   ```typescript
   <script
     defer
     data-domain="yourdomain.com"
     src="https://plausible.io/js/script.js"
   />
   ```

2. **Track custom events:**
   ```typescript
   // Use Plausible's custom events API
   window.plausible('Contract Uploaded', {
     props: { tier: 'nda' }
   })
   ```

## Recommended Implementation Approach

For LegalEase, we recommend a **hybrid approach**:

1. **Privacy-friendly analytics** (Plausible or self-hosted PostHog) for basic metrics
2. **Custom event tracking** for business-critical events (contracts, payments)
3. **Server-side tracking** for sensitive events (payments, admin actions)

## Implementation Steps

### Step 1: Create Analytics Utility

Create `lib/analytics.ts` with a unified analytics interface:

```typescript
/**
 * Unified analytics tracking utility
 * Supports multiple analytics providers with a single interface
 */

type AnalyticsEvent = {
  name: string
  properties?: Record<string, any>
  userId?: string
}

class Analytics {
  private enabled: boolean

  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled || typeof window === 'undefined') return

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, properties)
    }

    // PostHog
    if (window.posthog) {
      window.posthog.capture(eventName, properties)
    }

    // Plausible
    if (window.plausible) {
      window.plausible(eventName, { props: properties })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, properties)
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled || typeof window === 'undefined') return

    if (window.mixpanel) {
      window.mixpanel.identify(userId)
      if (traits) {
        window.mixpanel.people.set(traits)
      }
    }

    if (window.posthog) {
      window.posthog.identify(userId, traits)
    }
  }

  /**
   * Track page view
   */
  page(path: string) {
    if (!this.enabled || typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: path,
      })
    }

    if (window.posthog) {
      window.posthog.capture('$pageview', { path })
    }
  }
}

export const analytics = new Analytics()

// Convenience function
export const track = (eventName: string, properties?: Record<string, any>) => {
  analytics.track(eventName, properties)
}
```

### Step 2: Add Type Definitions

Create `lib/analytics-types.d.ts`:

```typescript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    mixpanel?: {
      track: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string) => void
      people: {
        set: (properties: Record<string, any>) => void
      }
    }
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string, traits?: Record<string, any>) => void
    }
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
  }
}

export {}
```

### Step 3: Track Events in Key Locations

#### Contract Upload (Dashboard)

```typescript
// app/dashboard/page.tsx
import { track } from '@/lib/analytics'

const handleUpload = async (file: File, tier: PricingTier) => {
  try {
    track('contract_upload_initiated', { tier })
    
    // ... upload logic ...
    
    track('contract_upload_completed', {
      tier,
      contract_id: contract.id,
      amount: PRICING_TIERS[tier].price,
    })
  } catch (error) {
    track('contract_upload_failed', {
      tier,
      error: error.message,
    })
  }
}
```

#### Payment Events (Payment API Routes)

```typescript
// app/api/paystack/initialize/route.ts
import { track } from '@/lib/analytics'

export async function POST(request: Request) {
  // ... payment initialization ...
  
  track('payment_initiated', {
    amount,
    tier,
    reference,
    user_id: userId,
  })
  
  // ...
}
```

```typescript
// app/api/paystack/webhook/route.ts
import { track } from '@/lib/analytics'

export async function POST(request: Request) {
  // ... webhook handling ...
  
  if (event === 'charge.success') {
    track('payment_completed', {
      amount: data.amount,
      reference: data.reference,
      user_id: userId,
      contract_id: contractId,
    })
  }
  
  // ...
}
```

#### KYC Events

```typescript
// app/kyc/page.tsx
import { track } from '@/lib/analytics'

const handleSubmit = async () => {
  try {
    track('kyc_submission_started')
    
    // ... submission logic ...
    
    track('kyc_submission_completed', {
      user_id: user.id,
    })
  } catch (error) {
    track('kyc_submission_failed', {
      error: error.message,
    })
  }
}
```

#### Admin Actions

```typescript
// app/api/kyc/verify/route.ts
import { track } from '@/lib/analytics'

export async function POST(request: Request) {
  // ... verification logic ...
  
  track('kyc_verified', {
    action: 'approve' | 'reject',
    user_id: userId,
    reviewed_by: adminId,
  })
  
  // ...
}
```

### Step 4: User Identification

```typescript
// app/providers.tsx or after login
import { identify } from '@/lib/analytics'

useEffect(() => {
  if (user) {
    identify(user.id, {
      email: user.email,
      role: user.role,
      kyc_completed: user.kyc_completed,
    })
  }
}, [user])
```

## Environment Variables

Add to `.env.local`:

```env
# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

## Privacy Considerations

### GDPR Compliance

1. **Cookie Consent:**
   - Implement cookie consent banner if using cookies
   - Plausible doesn't use cookies (GDPR-friendly)

2. **Data Anonymization:**
   - Don't track PII (personally identifiable information) unless necessary
   - Hash user IDs if needed
   - Use pseudonymous identifiers

3. **Privacy Policy:**
   - Update privacy policy to mention analytics
   - List analytics providers used
   - Explain data collection purposes

4. **User Opt-out:**
   - Provide mechanism for users to opt-out
   - Respect "Do Not Track" headers if applicable

### Recommended Privacy Practices

```typescript
// Only track non-sensitive data
track('payment_completed', {
  amount: data.amount, // ✅ OK
  tier: data.tier, // ✅ OK
  // email: user.email, // ❌ Avoid PII in events
  user_id: hashUserId(user.id), // ✅ Pseudonymous ID
})
```

## Server-Side Tracking

For sensitive events (payments, admin actions), consider server-side tracking:

```typescript
// lib/analytics-server.ts
import { logger } from './logger'

/**
 * Server-side analytics tracking
 * Logs events that can be sent to analytics services via API
 */
export function trackServerEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  // Log to structured logs (can be forwarded to analytics)
  logger.info(`Analytics: ${eventName}`, {
    eventType: 'analytics',
    eventName,
    ...properties,
  })

  // Optionally send to analytics API (Mixpanel, PostHog server-side API, etc.)
  // Example: Send to Mixpanel server-side API
  // fetch('https://api.mixpanel.com/track', { ... })
}
```

## Key Metrics to Monitor

### Business Metrics

1. **Conversion Funnel:**
   - Signups → KYC Completed → Contract Upload → Payment → Review Completed

2. **Revenue Metrics:**
   - Total revenue
   - Revenue by tier
   - Average contract value
   - Monthly recurring revenue (if applicable)

3. **User Metrics:**
   - Active users (DAU/MAU)
   - User retention
   - Churn rate
   - Time to first contract

4. **Operational Metrics:**
   - Contracts uploaded per day/week
   - Average review time
   - Lawyer workload
   - Payment success rate

### Technical Metrics

1. **Performance:**
   - Page load times
   - API response times
   - Error rates

2. **User Experience:**
   - Form abandonment rates
   - Upload failure rates
   - Payment failure reasons

## Testing Analytics

1. **Development Testing:**
   - Use analytics debug mode
   - Check browser console for events
   - Verify events in analytics dashboard

2. **Production Testing:**
   - Use test events with special prefix
   - Filter test events in analytics
   - Monitor event volume

## Recommendations

1. **Start Simple:**
   - Begin with privacy-friendly analytics (Plausible)
   - Track only essential events
   - Add more tracking as needed

2. **Focus on Business Metrics:**
   - Track revenue events first
   - Monitor conversion funnel
   - Track user engagement

3. **Respect Privacy:**
   - Use privacy-friendly tools when possible
   - Minimize data collection
   - Follow GDPR/privacy regulations

4. **Document Everything:**
   - Document all tracked events
   - Keep tracking code organized
   - Maintain analytics dashboard documentation

## Example: Minimal Implementation

If you want a minimal implementation, you can track events server-side and log them:

```typescript
// lib/analytics-simple.ts
import { logger } from './logger'

export function track(eventName: string, properties?: Record<string, any>) {
  // Log to structured logs
  logger.info(`Event: ${eventName}`, {
    eventType: 'analytics',
    eventName,
    ...properties,
    timestamp: new Date().toISOString(),
  })
  
  // Can be exported to analytics services later
  // or analyzed from logs
}
```

Then query logs for analytics insights.

## Next Steps

1. **Choose an Analytics Platform:**
   - Evaluate options based on your needs
   - Consider privacy requirements
   - Check pricing and limits

2. **Implement Tracking:**
   - Start with critical events (payments, contracts)
   - Add user engagement tracking
   - Implement server-side tracking for sensitive events

3. **Set Up Dashboards:**
   - Create custom dashboards in your analytics platform
   - Set up alerts for key metrics
   - Schedule regular reports

4. **Monitor and Iterate:**
   - Review analytics regularly
   - Identify trends and issues
   - Optimize based on data

## Notes

- Analytics is **optional** - the application works without it
- Start with minimal tracking and expand as needed
- Always consider privacy implications
- Test analytics in development before production
- Document all tracked events for team reference
