# Quick Fix: Email Verification Not Working

## The Problem

You're not receiving verification emails even though you've set up SMTP in Supabase.

## Root Cause

Supabase sends verification emails through its own system (not your app's email service). Even if SMTP is configured, emails might not be sent due to:
- SMTP configuration issues
- Email confirmations disabled
- Email templates not configured
- Rate limits
- Emails going to spam

## Quick Fixes (Choose One)

### Option 1: Disable Email Verification (Development Only) ⚡ FASTEST

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Email Auth**, disable **"Enable email confirmations"**
3. Save changes

✅ **Result**: Users can sign up and log in immediately without email verification.

⚠️ **Warning**: Only for development! Enable this in production.

### Option 2: Manually Verify Users (Development) ⚡ FAST

Run this SQL in Supabase SQL Editor:

```sql
-- Verify a specific user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- Or verify all unverified users (DEVELOPMENT ONLY)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

### Option 3: Fix Supabase SMTP Configuration 🔧 RECOMMENDED FOR PRODUCTION

1. **Go to Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**

2. **Verify SMTP is enabled and configured:**
   - ✅ Custom SMTP: **Enabled**
   - ✅ Host: `smtp.resend.com` (or your SMTP provider)
   - ✅ Port: `465` (SSL) or `587` (TLS)
   - ✅ Username: `resend` (for Resend) or your SMTP username
   - ✅ Password: Your Resend API key (starts with `re_`) or SMTP password
   - ✅ Sender Email: Verified email address (e.g., `noreply@yourdomain.com`)
   - ✅ Sender Name: `LegalEase`

3. **Test SMTP:**
   - Click **"Send test email"** in SMTP settings
   - Enter your email
   - Check inbox (and spam folder)

4. **Check Email Settings:**
   - Go to **Authentication** → **Settings**
   - Ensure **"Enable email confirmations"** is **ON**

5. **Check Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - Verify **"Confirm signup"** template exists and is enabled

## Test Your Setup

### Test 1: Check Email Configuration

```bash
# Visit in browser (development only)
http://localhost:3000/api/email-config
```

### Test 2: Test Custom Email Service

```bash
# Make POST request
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Test 3: Check Supabase Logs

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for signup events and email sending errors

## Common Issues

### "SMTP connection failed"
- ✅ Verify SMTP credentials are correct
- ✅ Check firewall/network restrictions
- ✅ Try different port (465 vs 587)
- ✅ For Resend: Username should be `resend`, password is your API key

### "Email rate limit exceeded"
- ✅ Wait 24 hours for limit to reset
- ✅ Upgrade Supabase plan
- ✅ Use custom SMTP (bypasses limits)

### "Emails going to spam"
- ✅ Check spam folder
- ✅ Configure SPF/DKIM for your domain
- ✅ Use verified domain email

## Still Not Working?

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Full Guide:** See `DEBUG_EMAIL_ISSUES.md`
3. **Use Manual Verification:** Run SQL script (Option 2 above)

## Summary

- **For Development:** Disable email verification or manually verify users
- **For Production:** Fix Supabase SMTP configuration
- **Always:** Check spam folder and Supabase logs
