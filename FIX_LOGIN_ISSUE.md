# Fix Login Issue - Email Verification Required

## Problem

Users can create accounts but get "Invalid credentials" when trying to log in.

## Root Cause

Supabase requires email verification before users can log in with email/password. When a user signs up:
1. Account is created in Supabase
2. Verification email is sent
3. User cannot log in until email is verified
4. Login attempt returns "Invalid credentials" (misleading error)

## Solution

### Option 1: Disable Email Verification (Development Only)

For development/testing, you can disable email confirmation in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, find **"Enable email confirmations"**
4. **Disable** it (toggle off)
5. Save changes

⚠️ **Warning**: Only do this for development! Production should require email verification.

### Option 2: Verify Email Before Login (Recommended for Production)

The system now:
- ✅ Shows clear error message when email is not verified
- ✅ Redirects to verification page
- ✅ Allows resending verification email from login page
- ✅ Provides helpful instructions

**Steps for users:**
1. Sign up with email/password
2. Check email inbox for verification link
3. Click the verification link
4. Email is verified automatically
5. Now they can log in

### Option 3: Use Magic Link (No Password Needed)

Users can use the "Magic Link" option on the login page:
- No password required
- Email verification happens automatically
- More secure and user-friendly

## Testing

### Test Email Verification Flow

1. **Sign up a new user:**
   - Go to `/signup`
   - Enter email and password
   - Account created ✅

2. **Try to log in (should fail):**
   - Go to `/login`
   - Enter same email/password
   - Should see: "Please verify your email before logging in"

3. **Check email:**
   - Look for verification email from Supabase
   - Click the verification link
   - Should redirect to `/auth/verify-email` or `/auth/callback`

4. **Log in again:**
   - Go to `/login`
   - Enter email/password
   - Should work now ✅

### If Verification Email Not Received

1. Check spam folder
2. Use "Resend Verification Email" on login page
3. Or go to `/auth/verify-email` and resend
4. Check Supabase dashboard → Authentication → Users → check if email is confirmed

## Supabase Email Configuration

### Check Email Settings

1. Go to Supabase Dashboard
2. **Authentication** → **Settings** → **Email Templates**
3. Verify "Confirm signup" template is configured
4. Check SMTP settings if using custom email provider

### Email Provider Options

- **Supabase Default**: Uses Supabase's email service (free tier limited)
- **Custom SMTP**: Configure your own email provider
- **Resend**: Can be configured for transactional emails (separate from auth emails)

## Common Issues

### Issue: "Invalid credentials" even after verification

**Solution:**
- Double-check email and password are correct
- Check Supabase dashboard to confirm email is verified
- Try password reset if needed

### Issue: Verification email not sending

**Solution:**
- Check Supabase email settings
- Verify SMTP configuration if using custom provider
- Check Supabase logs for email sending errors
- Try resending from `/auth/verify-email` page

### Issue: Verification link expired

**Solution:**
- Request a new verification email
- Links typically expire after 1 hour
- Use "Resend Verification Email" feature

## Code Changes Made

1. ✅ Improved login error handling to detect unverified emails
2. ✅ Added redirect to verification page when email not verified
3. ✅ Added "Resend verification email" option on login page
4. ✅ Better error messages for users

## Next Steps

1. **For Development**: Consider disabling email confirmation temporarily
2. **For Production**: Keep email verification enabled for security
3. **Test the flow**: Sign up → Verify email → Login
4. **Monitor**: Check Supabase logs for any email sending issues
