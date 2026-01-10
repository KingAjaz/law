# Google Authentication Quick Start

## Quick Setup Checklist

### 1. Google Cloud Console Setup (5 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a project or select existing one
- [ ] Enable Google+ API (or People API)
- [ ] Configure OAuth consent screen (External, basic info)
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add authorized redirect URIs:
  - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (for development)
  - `https://your-domain.com/auth/callback` (for production)
- [ ] Copy Client ID and Client Secret

### 2. Supabase Dashboard Setup (3 minutes)

- [ ] Go to [Supabase Dashboard](https://app.supabase.com/)
- [ ] Navigate to **Authentication** > **Providers**
- [ ] Enable **Google** provider
- [ ] Enter Google OAuth Client ID
- [ ] Enter Google OAuth Client Secret
- [ ] Save changes

### 3. Configure Redirect URLs in Supabase

- [ ] Go to **Authentication** > **URL Configuration**
- [ ] Set Site URL:
  - Development: `http://localhost:3000`
  - Production: `https://your-production-domain.com`
- [ ] Add Redirect URLs:
  ```
  http://localhost:3000/auth/callback
  https://your-production-domain.com/auth/callback
  ```
- [ ] Save changes

### 4. Update Database (if not already done)

Run this SQL in Supabase SQL Editor to ensure the trigger handles Google OAuth metadata correctly:

```sql
-- Update the function to handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract full_name from various possible locations in metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.user_metadata->>'full_name',
    NEW.user_metadata->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_full_name,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(NEW.email, profiles.email),
    full_name = COALESCE(NULLIF(user_full_name, ''), profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Test the Integration

- [ ] Start your development server: `npm run dev`
- [ ] Navigate to `http://localhost:3000/login` or `/signup`
- [ ] Click "Sign in with Google" or "Sign up with Google"
- [ ] Complete Google OAuth flow
- [ ] Verify:
  - You're redirected back to your app
  - User is created in Supabase Authentication > Users
  - Profile is created in `profiles` table
  - You're redirected to dashboard

## Common Issues & Solutions

### ❌ "Redirect URI mismatch"

**Solution**: Ensure the redirect URI in Google Cloud Console exactly matches:
- Supabase callback: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Your app callback: `http://localhost:3000/auth/callback`

### ❌ "Invalid client ID"

**Solution**: 
- Double-check Client ID in Supabase matches Google Cloud Console
- Remove any extra spaces
- Make sure you're using the correct project credentials

### ❌ Profile not created

**Solution**:
- Check if the database trigger `on_auth_user_created` exists
- Verify the trigger function is working
- Manually check the `auth.users` table for the new user

### ❌ OAuth button not working

**Solution**:
- Check browser console for errors
- Verify environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure you're using the correct Supabase project

## What Happens When User Signs In with Google?

1. User clicks "Sign in with Google" button
2. User is redirected to Google's consent screen
3. User authorizes your app
4. Google redirects to Supabase callback URL with authorization code
5. Supabase exchanges code for user session
6. Supabase creates user in `auth.users` table
7. Database trigger `handle_new_user()` fires
8. Profile is automatically created in `profiles` table with:
   - User ID
   - Email from Google account
   - Full name from Google account (if available)
   - Default role: 'user'
9. User is redirected to your app's `/auth/callback` route
10. Callback route redirects to dashboard

## Need More Help?

See the detailed guide: [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
