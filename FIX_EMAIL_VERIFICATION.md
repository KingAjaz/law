# Fix Email Verification Not Sending

## Problem

Users are not receiving email verification emails after signing up, preventing them from logging in.

## Quick Fix for Development

### Option 1: Disable Email Verification (Fastest)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Email Auth**, find **"Enable email confirmations"**
3. **Disable** it (toggle off)
4. Save changes

✅ **Result**: Users can now sign up and log in immediately without email verification.

⚠️ **Warning**: Only use this for development! Production should require email verification.

### Option 2: Manually Verify Users

Run this SQL in Supabase SQL Editor to verify a specific user:

```sql
-- Replace 'user@example.com' with the actual email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

Or verify all unverified users (development only):

```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

See `scripts/verify-user-email.sql` for a ready-to-use script.

## Root Causes

1. **Supabase Email Service Not Configured**: Free tier has limited email sending
2. **SMTP Not Configured**: Custom SMTP not set up
3. **Email Going to Spam**: Verification emails in spam folder
4. **Email Rate Limits**: Supabase free tier has daily limits
5. **Email Templates Not Configured**: Email templates might be disabled

## Solutions

### Solution 1: Configure Supabase SMTP (Recommended for Production)

1. **Go to Supabase Dashboard**
   - Navigate to **Project Settings** → **Auth** → **SMTP Settings**

2. **Configure SMTP Provider** (choose one):
   
   **Option A: Use Resend (Recommended)**
   - Sign up at https://resend.com
   - Get your SMTP credentials from Resend dashboard
   - In Supabase, enable "Custom SMTP"
   - Enter Resend SMTP settings:
     - Host: `smtp.resend.com`
     - Port: `465` (SSL) or `587` (TLS)
     - Username: `resend`
     - Password: Your Resend API key (starts with `re_`)
     - Sender email: Your verified domain email (e.g., `noreply@yourdomain.com`)
     - Sender name: `LegalEase`

   **Option B: Use Gmail SMTP**
   - Enable 2-factor authentication on Gmail
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - In Supabase:
     - Host: `smtp.gmail.com`
     - Port: `587`
     - Username: Your Gmail address
     - Password: App password (not your regular password)
     - Sender email: Your Gmail address

   **Option C: Use SendGrid, Mailgun, or other SMTP provider**
   - Follow your provider's SMTP configuration guide
   - Enter credentials in Supabase SMTP settings

3. **Test Email Sending**
   - Go to **Authentication** → **Users**
   - Click on a user
   - Click "Send magic link" or "Resend confirmation email"
   - Check if email is received

### Solution 2: Check Supabase Email Settings

1. **Enable Email Confirmations**
   - Go to **Authentication** → **Settings**
   - Under **Email Auth**, ensure "Enable email confirmations" is **ON**

2. **Check Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Verify "Confirm signup" template exists and is enabled
   - Customize if needed

3. **Check Rate Limits**
   - Supabase free tier: Limited emails per day
   - Check **Project Settings** → **Usage** for email quota
   - Upgrade plan if needed

### Solution 3: For Development - Disable Email Verification

If you're in development and don't need email verification:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, find **"Enable email confirmations"**
3. **Disable** it (toggle off)
4. Save changes

⚠️ **Warning**: Only for development! Users can now sign up and log in without email verification.

### Solution 4: Manually Verify Users (Development/Testing)

Create a script to manually verify users in Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user who needs verification
3. Click on the user
4. Click **"Confirm email"** button
5. User can now log in

Or use SQL in Supabase SQL Editor:

```sql
-- Manually confirm email for a user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Solution 5: Check Email Delivery

1. **Check Spam Folder**: Verification emails often go to spam
2. **Check Supabase Logs**:
   - Go to **Logs** → **Auth Logs**
   - Look for email sending errors
3. **Test with Different Email Provider**:
   - Try Gmail, Outlook, etc.
   - Some email providers block Supabase emails

## Quick Fix Script

Create a SQL script to manually verify all unverified users (development only):

```sql
-- Verify all users who haven't verified their email (DEVELOPMENT ONLY)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

⚠️ **Only run this in development!**

## Testing Email Configuration

### Test 1: Check Supabase Email Service

1. Go to **Authentication** → **Users**
2. Create a test user or find existing user
3. Click "Send magic link"
4. Check if email is received

### Test 2: Check SMTP Configuration

1. In Supabase, go to **Project Settings** → **Auth** → **SMTP Settings**
2. Click "Send test email"
3. Enter your email address
4. Check if test email is received

### Test 3: Check Email Templates

1. Go to **Authentication** → **Email Templates**
2. Preview "Confirm signup" template
3. Ensure it's properly configured

## Common Issues

### Issue: "Email rate limit exceeded"

**Solution:**
- Wait for rate limit to reset (usually 24 hours)
- Upgrade Supabase plan
- Configure custom SMTP (bypasses Supabase limits)

### Issue: "SMTP connection failed"

**Solution:**
- Verify SMTP credentials are correct
- Check firewall/network restrictions
- Try different SMTP port (465 vs 587)
- Verify sender email is correct

### Issue: "Emails going to spam"

**Solution:**
- Configure SPF/DKIM records for your domain
- Use a verified domain email address
- Avoid spam trigger words in email content
- Ask users to whitelist your email address

## Recommended Setup for Production

1. **Use Resend for SMTP** (best deliverability)
   - Sign up for Resend
   - Verify your domain
   - Configure in Supabase SMTP settings
   - Use verified domain email as sender

2. **Keep Email Verification Enabled**
   - Important for security
   - Prevents fake accounts
   - Required for password resets

3. **Monitor Email Delivery**
   - Check Supabase logs regularly
   - Monitor bounce rates
   - Set up email delivery alerts

## Next Steps

1. ✅ Check Supabase email settings
2. ✅ Configure SMTP (Resend recommended)
3. ✅ Test email sending
4. ✅ Verify email templates are enabled
5. ✅ For development: Consider disabling email confirmation temporarily
