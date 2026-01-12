# Debug Email Issues - Comprehensive Guide

## Problem: Not Receiving Verification Emails

If you're not receiving verification emails (or any emails) even though you've set up SMTP in Supabase, follow these steps:

## Step 1: Test Your Custom Email Service

First, verify that your custom email service (Resend) is working:

### Option A: Use the Test Endpoint (Development Only)

```bash
# Make a POST request to test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Or use your browser's console:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-email@example.com' })
})
.then(r => r.json())
.then(console.log)
```

**Expected Result:**
- If `EMAIL_SERVICE=console`: Check your server console logs for the email content
- If `EMAIL_SERVICE=resend`: Check your email inbox (and spam folder)

### Option B: Check Environment Variables

Make sure these are set in your `.env.local`:

```env
# For Resend
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com  # Must be a verified domain in Resend

# Or for console logging (development)
EMAIL_SERVICE=console
```

## Step 2: Check Supabase SMTP Configuration

Supabase verification emails are sent by Supabase itself, not your application. Verify:

### 2.1 SMTP Settings in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
2. Verify:
   - ✅ **Custom SMTP** is **enabled**
   - ✅ **SMTP Host** is correct (e.g., `smtp.resend.com` or `smtp.gmail.com`)
   - ✅ **SMTP Port** is correct (465 for SSL, 587 for TLS)
   - ✅ **SMTP Username** is correct
   - ✅ **SMTP Password** is correct (for Resend, use your API key)
   - ✅ **Sender Email** is a verified email address
   - ✅ **Sender Name** is set

### 2.2 Test SMTP Connection

In Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**, click **"Send test email"**:
- Enter your email address
- Click "Send test email"
- Check your inbox (and spam folder)

**If test email fails:**
- Double-check SMTP credentials
- Verify sender email is correct
- Check firewall/network restrictions
- Try different SMTP port (465 vs 587)

## Step 3: Check Supabase Email Settings

### 3.1 Email Confirmations Enabled

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Email Auth**, verify:
   - ✅ **"Enable email confirmations"** is **ON** (for production)
   - ⚠️ For development, you can disable this to skip verification

### 3.2 Email Templates

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Verify:
   - ✅ **"Confirm signup"** template exists and is enabled
   - ✅ Template has proper content
   - ✅ Redirect URL is correct: `{{ .SiteURL }}/auth/callback?type=signup`

### 3.3 Site URL and Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Verify:
   - ✅ **Site URL** is set correctly:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`
   - ✅ **Redirect URLs** includes:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

## Step 4: Check Supabase Logs

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for:
   - Email sending errors
   - SMTP connection failures
   - Rate limit warnings
   - User signup events

**Common Errors:**
- `SMTP connection failed` → Check SMTP credentials
- `Email rate limit exceeded` → Wait or upgrade plan
- `Invalid sender email` → Verify sender email in SMTP settings

## Step 5: Use Manual Verification (Development Only)

If emails still aren't working, manually verify users for development:

### Option A: Use SQL Script

Run the script in `scripts/verify-user-email.sql`:

```sql
-- Verify a specific user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com'
  AND email_confirmed_at IS NULL;
```

### Option B: Use Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user
3. Click on the user
4. Click **"Confirm email"** button

### Option C: Use API Endpoint

```bash
# Resend verification email using admin API
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Step 6: Check Email Delivery

### 6.1 Check Spam Folder

Verification emails often go to spam. Check:
- Spam/Junk folder
- Promotions tab (Gmail)
- All Mail folder

### 6.2 Check Email Provider

Some email providers block Supabase emails:
- Try a different email provider (Gmail, Outlook, etc.)
- Whitelist Supabase sender email
- Check email provider's security settings

### 6.3 Check Rate Limits

Supabase free tier has email rate limits:
- Check **Project Settings** → **Usage** for email quota
- Wait for rate limit to reset (usually 24 hours)
- Upgrade plan if needed
- Use custom SMTP to bypass Supabase limits

## Step 7: Verify Environment Variables

Check your `.env.local` file:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# For email service (if using Resend)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 8: Common Issues and Solutions

### Issue: "SMTP connection failed"

**Solutions:**
- Verify SMTP credentials are correct
- Check firewall/network restrictions
- Try different SMTP port (465 vs 587)
- Verify sender email is correct
- For Resend: Use API key as password, username should be `resend`

### Issue: "Email rate limit exceeded"

**Solutions:**
- Wait for rate limit to reset (24 hours)
- Upgrade Supabase plan
- Use custom SMTP (bypasses Supabase limits)

### Issue: "Emails going to spam"

**Solutions:**
- Configure SPF/DKIM records for your domain
- Use a verified domain email address
- Avoid spam trigger words in email content
- Ask users to whitelist your email address

### Issue: "Email confirmations disabled"

**Solutions:**
- Go to **Authentication** → **Settings**
- Enable **"Enable email confirmations"**
- Save changes

## Step 9: Quick Fixes for Development

### Disable Email Verification (Development Only)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Email Auth**, disable **"Enable email confirmations"**
3. Save changes

⚠️ **Warning**: Only for development! Users can now sign up and log in without email verification.

### Manually Verify All Users (Development Only)

```sql
-- Verify all unverified users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

## Step 10: Test Complete Flow

1. **Sign up a new user:**
   ```bash
   # Use your signup page or API
   ```

2. **Check Supabase Auth Logs:**
   - Go to **Logs** → **Auth Logs**
   - Look for signup event
   - Check if email was sent

3. **Check your inbox:**
   - Check inbox
   - Check spam folder
   - Check console logs (if EMAIL_SERVICE=console)

4. **Verify email:**
   - Click verification link
   - Or manually verify using SQL/API

## Still Not Working?

1. **Check Supabase Status:** https://status.supabase.com
2. **Check Resend Status:** https://resend.com/status
3. **Review Supabase Documentation:** https://supabase.com/docs/guides/auth/auth-smtp
4. **Contact Support:**
   - Supabase: https://supabase.com/support
   - Resend: https://resend.com/support

## Summary Checklist

- [ ] Custom email service tested (`/api/test-email`)
- [ ] Supabase SMTP configured and tested
- [ ] Email confirmations enabled in Supabase
- [ ] Email templates configured
- [ ] Site URL and redirect URLs set correctly
- [ ] Checked Supabase Auth Logs for errors
- [ ] Checked spam folder
- [ ] Environment variables set correctly
- [ ] Tried different email provider
- [ ] Checked rate limits
- [ ] For development: Considered disabling email verification
