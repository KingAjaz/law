# Fix Vercel Redirect to Localhost Issue

## Problem

After clicking email verification/reset links on your Vercel deployment, users are redirected to `localhost:3000` instead of your Vercel domain.

## Root Cause

Supabase uses the **Site URL** configured in the Supabase Dashboard to generate email links. If this is still set to `http://localhost:3000`, all email links will point to localhost.

## Solution

You need to update the Site URL and Redirect URLs in your Supabase Dashboard:

### Step 1: Update Supabase Dashboard Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the following settings:

   **Site URL:**
   ```
   https://your-vercel-app.vercel.app
   ```
   Replace `your-vercel-app` with your actual Vercel deployment URL (e.g., `law-app-xyz.vercel.app`)

   **Redirect URLs:**
   Add both development and production URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   https://your-vercel-app.vercel.app/auth/callback
   ```
   
   Also add the verify-email redirect if needed:
   ```
   http://localhost:3000/auth/verify-email
   https://your-vercel-app.vercel.app/auth/verify-email
   ```

5. Click **Save** to apply changes

### Step 2: Update Vercel Environment Variables

Make sure your Vercel deployment has the correct `NEXT_PUBLIC_APP_URL` environment variable:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Ensure `NEXT_PUBLIC_APP_URL` is set to:
   ```
   https://your-vercel-app.vercel.app
   ```
   (Or your custom domain if you have one configured)

5. If you updated it, you'll need to **redeploy** your application for the changes to take effect.

### Step 3: Verify the Fix

1. Try signing up with a new email address
2. Check the email verification link in your inbox
3. Click the link - it should now redirect to your Vercel domain, not localhost

## Important Notes

- **Site URL** is the base URL that Supabase uses for email links (confirmation, password reset, magic links)
- **Redirect URLs** are the allowed callback URLs where users can be redirected after authentication
- Both must include your production Vercel URL
- Changes take effect immediately - no need to wait
- Existing users who already received emails with localhost links will need to request new verification emails

## Custom Domain

If you're using a custom domain (e.g., `app.legalease.com`), use that instead of the Vercel subdomain:

**Site URL:**
```
https://app.legalease.com
```

**Redirect URLs:**
```
https://app.legalease.com/auth/callback
https://app.legalease.com/auth/verify-email
```

## Troubleshooting

### Still redirecting to localhost?

1. **Clear browser cache** - Old redirects might be cached
2. **Request a new verification email** - Old emails contain the old URL
3. **Double-check Supabase Dashboard** - Ensure the Site URL is saved correctly
4. **Check Vercel logs** - Look for any environment variable issues

### Multiple Environments

If you have staging and production environments:

**Site URL:** Use your production URL (this is the primary one)

**Redirect URLs:** Include all environments:
```
http://localhost:3000/auth/callback
https://staging.legalease.com/auth/callback
https://app.legalease.com/auth/callback
```

This allows the same Supabase project to work across all environments.
