# Fix "Unsupported provider: provider is not enabled" Error

This error occurs when the app tries to use Google OAuth, but it's not enabled in your Supabase project.

## Solution Options

### Option 1: Enable Google OAuth in Supabase (Recommended if you want OAuth)

If you want users to be able to sign in with Google:

1. **Set up Google OAuth in Google Cloud Console:**
   - Go to https://console.cloud.google.com/
   - Create a new project (or use existing)
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - (Replace `your-project-id` with your actual Supabase project ID)

2. **Copy Client ID and Client Secret**

3. **Enable in Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Find **Google** provider
   - Click to enable it
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

4. **Test:**
   - Go to http://localhost:3000/login
   - Click "Sign in with Google"
   - Should redirect to Google consent screen

### Option 2: Remove Google OAuth Buttons (If you don't want OAuth)

If you only want email/password authentication, you can remove the Google OAuth buttons from the UI. The code can be updated to hide these buttons.

**Note:** The buttons are already in the code but won't work until Google OAuth is configured. If you remove them, users will only be able to use email/password authentication.

## Quick Check: Is the Error Happening After Login?

If you're seeing this error **after** successfully logging in with email/password, it might be:

1. **A redirect issue** - Check browser console and network tab
2. **An API call trying to use OAuth** - Check which page you're on when the error appears
3. **A cached redirect** - Try clearing browser cache or using incognito mode

## Current Status

- ✅ Email/Password authentication: Working
- ❌ Google OAuth: Not configured (causes error if button is clicked)
- ✅ Magic Link: Should work (part of email provider)

## Recommendation

For development, if you don't need OAuth right now:
- You can leave the buttons (they just won't work until configured)
- OR remove them to avoid confusion
- Focus on email/password authentication first

For production:
- Either configure Google OAuth properly
- OR remove the buttons if you don't need OAuth
