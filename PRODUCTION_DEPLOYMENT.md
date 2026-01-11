# Production Deployment Checklist

This document provides a comprehensive checklist for deploying LegalEase to production.

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your production environment:

#### Required Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack (Required)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...

# App URL (Required)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Optional but Recommended Variables

```env
# Contact Information
NEXT_PUBLIC_CONTACT_PHONE=+234 XXX XXX XXXX
NEXT_PUBLIC_CONTACT_EMAIL=support@yourdomain.com

# Email Service (Optional - defaults to console logging)
EMAIL_SERVICE=resend  # Options: console, resend, sendgrid
RESEND_API_KEY=your_resend_api_key  # If using Resend
SENDGRID_API_KEY=your_sendgrid_api_key  # If using SendGrid
EMAIL_FROM=noreply@yourdomain.com

# Social Media Links (Optional)
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/yourpage
NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/yourhandle
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/yourhandle
NEXT_PUBLIC_SOCIAL_LINKEDIN=https://linkedin.com/company/yourcompany
```

### 2. Database Setup

- [ ] Run all migrations in order:
  - [ ] `001_initial_schema.sql` - Creates all tables, indexes, and RLS policies
  - [ ] `002_add_contact_messages.sql` - Adds contact messages table
  - [ ] `003_update_pricing_tiers.sql` - Updates pricing tier structure
  - [ ] `004_add_kyc_status.sql` - Adds KYC status workflow
  - [ ] `005_add_performance_indexes.sql` - Adds performance optimization indexes

- [ ] Verify all tables exist in Supabase Dashboard → Table Editor

- [ ] Verify Row Level Security (RLS) is enabled on all tables

- [ ] Test RLS policies to ensure proper access control

### 3. Supabase Storage Setup

- [ ] Create storage bucket named `documents`
- [ ] Set bucket to **Public** if you need public file access
- [ ] Set up Storage Policies:
  - [ ] Users can upload to `contracts/` folder (with their user ID prefix)
  - [ ] Users can read their own files
  - [ ] Lawyers can read files assigned to them
  - [ ] Admins can read all files
  - [ ] Users can delete their own files
  - [ ] See `supabase/storage-setup.md` for detailed policies

### 4. Supabase Authentication Setup

- [ ] Configure Authentication Providers:
  - [ ] Email/Password - Enabled
  - [ ] Magic Link (OTP) - Configure if using
  - [ ] Google OAuth - Add production OAuth credentials
  - [ ] Google OAuth - Configure if using

- [ ] Set Production Site URL:
  - [ ] Go to Authentication → URL Configuration
  - [ ] Site URL: `https://yourdomain.com` (⚠️ **CRITICAL**: Must be your production URL, not localhost)
  - [ ] Redirect URLs: Add both:
    - [ ] `http://localhost:3000/auth/callback` (for local development)
    - [ ] `https://yourdomain.com/auth/callback` (for production)
  - [ ] **Note**: If users are being redirected to localhost after email clicks, see `FIX_VERCEL_REDIRECT.md`

- [ ] Configure Email Templates (optional customization)

### 5. Paystack Configuration

- [ ] Switch to Live API Keys (not test keys)
- [ ] Configure Webhook:
  - [ ] URL: `https://yourdomain.com/api/paystack/webhook`
  - [ ] Events: `charge.success`
  - [ ] Test webhook delivery
- [ ] Verify webhook signature validation is working
- [ ] Test payment flow end-to-end

### 6. Email Service Configuration

Choose and configure one of the following:

**Option A: Resend (Recommended)**
- [ ] Create Resend account
- [ ] Generate API key
- [ ] Set `EMAIL_SERVICE=resend`
- [ ] Set `RESEND_API_KEY=your_key`
- [ ] Set `EMAIL_FROM=noreply@yourdomain.com`
- [ ] Verify domain in Resend (for better deliverability)

**Option B: SendGrid**
- [ ] Create SendGrid account
- [ ] Generate API key
- [ ] Set `EMAIL_SERVICE=sendgrid`
- [ ] Set `SENDGRID_API_KEY=your_key`
- [ ] Set `EMAIL_FROM=noreply@yourdomain.com`
- [ ] Verify domain in SendGrid

**Option C: Console Logging (Development Only)**
- [ ] For testing only - emails will log to console
- [ ] Not recommended for production

### 7. Domain & SSL

- [ ] Configure custom domain
- [ ] Set up SSL certificate (automatically handled by most platforms)
- [ ] Verify domain ownership
- [ ] Update DNS records as required by hosting platform

### 8. Environment-Specific Configuration

- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Update contact information in environment variables
- [ ] Update social media links (if applicable)
- [ ] Verify all public URLs use HTTPS

## Deployment Steps

### 9. Build & Deploy

**For Vercel:**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

**For Other Platforms:**
- [ ] Build the application: `npm run build`
- [ ] Test build locally: `npm start`
- [ ] Deploy according to your platform's instructions
- [ ] Verify deployment is successful

### 10. Post-Deployment Verification

- [ ] **Health Check:**
  - [ ] Visit `https://yourdomain.com/api/health`
  - [ ] Verify all environment variables are validated
  - [ ] Check for any warnings

- [ ] **Homepage:**
  - [ ] Verify homepage loads correctly
  - [ ] Check all images and assets load
  - [ ] Verify navigation works

- [ ] **Authentication:**
  - [ ] Test user signup
  - [ ] Test user login
  - [ ] Test password reset
  - [ ] Test email verification
  - [ ] Test OAuth login (Google, etc.)

- [ ] **KYC Flow:**
  - [ ] Test KYC submission
  - [ ] Verify file upload works
  - [ ] Test admin KYC approval/rejection

- [ ] **Contract Workflow:**
  - [ ] Test contract upload
  - [ ] Test payment initialization
  - [ ] Test payment verification
  - [ ] Test contract assignment (admin)
  - [ ] Test contract review (lawyer)
  - [ ] Test file downloads

- [ ] **Contact Form:**
  - [ ] Test contact form submission
  - [ ] Verify messages are saved to database

- [ ] **Admin Dashboard:**
  - [ ] Verify admin access works
  - [ ] Test contract filtering/search
  - [ ] Test KYC verification workflow
  - [ ] Test contract assignment

- [ ] **Lawyer Dashboard:**
  - [ ] Verify lawyer access works
  - [ ] Test contract list loads
  - [ ] Test file upload for reviewed documents

- [ ] **Email Notifications:**
  - [ ] Verify payment confirmation emails are sent
  - [ ] Verify contract assignment emails are sent
  - [ ] Verify review completion emails are sent
  - [ ] Check email deliverability

- [ ] **Error Handling:**
  - [ ] Test error boundaries
  - [ ] Verify error pages display correctly
  - [ ] Check error logging is working

- [ ] **Performance:**
  - [ ] Run Lighthouse audit
  - [ ] Check page load times
  - [ ] Verify database queries are optimized (indexes are being used)

## Security Checklist

- [ ] **Environment Variables:**
  - [ ] All sensitive keys are in environment variables (not hardcoded)
  - [ ] Service role keys are server-side only
  - [ ] No API keys exposed in client-side code

- [ ] **Authentication:**
  - [ ] RLS policies are enabled and tested
  - [ ] Users can only access their own data
  - [ ] Admin/lawyer roles are properly restricted

- [ ] **API Security:**
  - [ ] Rate limiting is enabled (already implemented)
  - [ ] Webhook signature verification is working
  - [ ] Input validation is in place

- [ ] **File Upload:**
  - [ ] File type validation is working
  - [ ] File size limits are enforced
  - [ ] Uploaded files are stored securely

- [ ] **HTTPS:**
  - [ ] All connections use HTTPS
  - [ ] No mixed content warnings

- [ ] **CORS:**
  - [ ] CORS is properly configured (if needed)

## Monitoring & Logging

- [ ] **Error Tracking:**
  - [ ] Set up error tracking service (e.g., Sentry, LogRocket)
  - [ ] Configure error logging in production
  - [ ] Set up alerts for critical errors

- [ ] **Application Monitoring:**
  - [ ] Set up application performance monitoring (APM)
  - [ ] Monitor database query performance
  - [ ] Monitor API response times

- [ ] **Logging:**
  - [ ] Verify structured logging is working
  - [ ] Set up log aggregation (if using a service)
  - [ ] Configure log retention policies

- [ ] **Analytics:**
  - [ ] Set up analytics tracking (if desired)
  - [ ] Configure conversion tracking
  - [ ] Set up dashboard for key metrics

## Backup & Recovery

- [ ] **Database Backups:**
  - [ ] Verify Supabase automatic backups are enabled
  - [ ] Test database restore procedure
  - [ ] Document backup schedule

- [ ] **File Storage Backups:**
  - [ ] Verify storage bucket backups (if available)
  - [ ] Document recovery procedures

- [ ] **Code Backup:**
  - [ ] Code is in version control (Git)
  - [ ] Deployment process is documented
  - [ ] Rollback procedure is documented

## Documentation

- [ ] **User Documentation:**
  - [ ] User guide/documentation is available
  - [ ] FAQ page is complete and accurate
  - [ ] Contact information is correct

- [ ] **Admin Documentation:**
  - [ ] Admin workflow is documented
  - [ ] KYC verification process is documented
  - [ ] Contract assignment process is documented

- [ ] **Technical Documentation:**
  - [ ] API documentation (if applicable)
  - [ ] Database schema is documented
  - [ ] Deployment process is documented

## Performance Optimization

- [ ] **Database:**
  - [ ] All performance indexes are created (migration 005)
  - [ ] Query performance is acceptable
  - [ ] Database connections are pooled properly

- [ ] **Frontend:**
  - [ ] Images are optimized
  - [ ] Code splitting is working
  - [ ] Bundle size is reasonable
  - [ ] Lazy loading is implemented where appropriate

- [ ] **Caching:**
  - [ ] Static assets are cached
  - [ ] API responses are cached where appropriate
  - [ ] CDN is configured (if applicable)

## Compliance & Legal

- [ ] **Privacy Policy:**
  - [ ] Privacy policy is published and accessible
  - [ ] Privacy policy URL is correct in app

- [ ] **Terms of Service:**
  - [ ] Terms of service are published and accessible
  - [ ] Terms acceptance is required where appropriate

- [ ] **Legal Disclaimers:**
  - [ ] Legal disclaimers are displayed
  - [ ] "No AI for contract review" disclaimer is visible

- [ ] **Data Protection:**
  - [ ] GDPR compliance (if applicable)
  - [ ] Data retention policies are documented
  - [ ] User data deletion process is available

## Go-Live Final Checks

- [ ] All tests pass
- [ ] No console errors in production
- [ ] All critical features are working
- [ ] Email notifications are sending correctly
- [ ] Payment processing is working
- [ ] File uploads/downloads are working
- [ ] Admin and lawyer dashboards are functional
- [ ] Error tracking is configured and working
- [ ] Monitoring is set up
- [ ] Backup procedures are in place
- [ ] Support contact information is correct
- [ ] Documentation is complete

## Post-Launch

- [ ] Monitor application for 24-48 hours after launch
- [ ] Watch for errors in error tracking service
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Address any critical issues immediately
- [ ] Plan for scaling if traffic increases

## Rollback Procedure

If critical issues are discovered:

1. **Immediate Rollback:**
   - Revert to previous deployment (Vercel: use dashboard, others: follow platform instructions)
   - Verify rollback is successful

2. **Database Rollback (if needed):**
   - Restore from backup if database changes need to be reverted
   - Document what was rolled back

3. **Communication:**
   - Notify users if service is affected
   - Post status updates

## Support & Maintenance

- [ ] Set up support channels (email, chat, etc.)
- [ ] Create runbook for common issues
- [ ] Schedule regular maintenance windows
- [ ] Plan for regular security updates
- [ ] Schedule database maintenance
- [ ] Plan for dependency updates

## Notes

- All migrations use `IF NOT EXISTS` clauses where applicable for safety
- Rate limiting is implemented to prevent abuse
- Error boundaries are in place to prevent full app crashes
- Logging is structured and ready for production monitoring
- All API routes have proper error handling and validation
