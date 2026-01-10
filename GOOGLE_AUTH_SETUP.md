# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your application.

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable Google+ API (if needed)

1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" (or "People API")
3. Click **Enable** (Note: Google+ API is deprecated, but some configurations might still reference it. The People API is the modern replacement)

### 1.3 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name: Your app name (e.g., "LegalEase")
     - User support email: Your email
     - Developer contact information: Your email
   - Click **Save and Continue**
   - Add scopes (default is usually fine): `email`, `profile`, `openid`
   - Click **Save and Continue**
   - Add test users (optional for development)
   - Click **Save and Continue**
   - Review and click **Back to Dashboard**

4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "LegalEase Web Client" (or your preferred name)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     ```
   - Click **Create**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Configure Supabase

### 2.1 Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Toggle the **Enable Google provider** switch

### 2.2 Add Google OAuth Credentials

1. In the Google provider settings, enter:
   - **Client ID (for OAuth)**: Your Google OAuth Client ID
   - **Client Secret (for OAuth)**: Your Google OAuth Client Secret
2. Click **Save**

### 2.3 Configure Redirect URLs in Supabase

1. Navigate to **Authentication** > **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`
3. Add **Redirect URLs** (add each on a new line):
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```
4. Click **Save**

## Step 3: Verify Your Setup

### 3.1 Check Your Application Code

The following files should already be configured:

- ✅ `lib/auth.ts` - Contains `signInWithOAuth` function
- ✅ `app/login/page.tsx` - Has Google sign-in button
- ✅ `app/signup/page.tsx` - Has Google sign-up button
- ✅ `app/auth/callback/route.ts` - Handles OAuth callbacks

### 3.2 Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login` or `http://localhost:3000/signup`

3. Click the **"Sign in with Google"** or **"Sign up with Google"** button

4. You should be redirected to Google's consent screen

5. After authorizing, you should be redirected back to your app

6. Check that:
   - User is created in Supabase (Authentication > Users)
   - Profile is created in the `profiles` table
   - User is redirected to the dashboard

## Step 4: Production Deployment

### 4.1 Update Google Cloud Console

1. In your Google OAuth client settings, add production URLs:
   - **Authorized JavaScript origins**: Add your production domain
   - **Authorized redirect URIs**: Add your production callback URL

### 4.2 Update Supabase Configuration

1. Update **Site URL** in Supabase to your production URL
2. Add production redirect URL to the list
3. Ensure your production environment variables are set

### 4.3 Environment Variables

Make sure these are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Ensure the redirect URI in Google Cloud Console matches exactly:
- For Supabase: `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
- For your app: `http://localhost:3000/auth/callback` (dev) or `https://your-domain.com/auth/callback` (prod)

### Issue: "Invalid client ID"

**Solution**: 
- Double-check the Client ID in Supabase matches the one from Google Cloud Console
- Ensure there are no extra spaces or characters

### Issue: User not created in profiles table

**Solution**: 
- Check the database trigger in `supabase/migrations/001_initial_schema.sql`
- Ensure the trigger `on_auth_user_created` is active
- Manually check if the profile was created with the correct user ID

### Issue: OAuth button not working

**Solution**:
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure you're using the correct Supabase project URL and keys

## Important Notes

1. **Google OAuth Consent Screen**: For external apps, Google requires verification if you want to publish. For development and testing, you can add test users without verification.

2. **Redirect URI**: The most common mistake is incorrect redirect URIs. Make sure:
   - The URI in Google Cloud Console matches Supabase's callback URL
   - The URI in your app matches the callback route

3. **HTTPS in Production**: Google requires HTTPS for production OAuth flows. Ensure your production domain has a valid SSL certificate.

4. **Email Verification**: OAuth providers (like Google) automatically verify emails, so users who sign in with Google don't need email verification.

5. **User Profile Data**: When a user signs in with Google, their profile (full_name, email) is automatically populated from their Google account.

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Security Best Practices

1. **Never commit credentials**: Keep Client ID and Client Secret in environment variables
2. **Use environment-specific credentials**: Separate OAuth apps for development and production
3. **Regularly rotate secrets**: Update OAuth credentials periodically
4. **Monitor usage**: Check Google Cloud Console for unusual activity
5. **Implement rate limiting**: Protect your authentication endpoints
