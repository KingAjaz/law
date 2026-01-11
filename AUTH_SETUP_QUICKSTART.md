# Authentication Setup Quick Start Guide

This guide will help you set up authentication so users can create accounts.

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Supabase account (free tier works)
- [ ] Git repository cloned

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name (e.g., "LegalEase")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be created

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values (you'll need them for `.env.local`):
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")
   - **service_role key** (under "Project API keys" → "service_role" - **Keep this secret!**)

## Step 3: Run Database Migrations

The database schema needs to be set up before accounts can be created. This includes the `profiles` table and the trigger that automatically creates profiles when users sign up.

### Option A: Using Supabase Dashboard (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy the **entire contents** of the file
5. Paste into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message
8. Verify: Go to **Table Editor** → You should see a `profiles` table

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not installed)
# Windows (using Scoop):
scoop install supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 4: Configure Environment Variables

1. In your project root, create a file named `.env.local` (if it doesn't exist)
2. Add the following (replace with your actual values):

```env
# Supabase (REQUIRED for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Paystack (REQUIRED for payments - use test keys for now)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-test-public-key
PAYSTACK_SECRET_KEY=sk_test_your-test-secret-key

# Google OAuth (OPTIONAL - for reference only)
# NOTE: These credentials must be configured in Supabase Dashboard → Authentication → Providers → Google
# The app uses Supabase's OAuth configuration, not these env vars directly
# GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
# GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client (it's server-side only)
- For development, Paystack test keys are fine (get them from https://paystack.com)

## Step 5: Configure Supabase Authentication

### Enable Email/Password Authentication (Required)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled** (should be enabled by default)
4. **Email Confirmations**: 
   - For development: **Disable** (users can login immediately after signup)
   - For production: **Enable** (users must verify email before login)

### Enable Magic Link (Optional - for passwordless login)

1. In **Authentication** → **Providers** → **Email**
2. Make sure "Enable email confirmations" is enabled
3. Magic link works automatically with email provider

### Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
6. Copy the **Client ID** and **Client Secret**
7. In Supabase dashboard: **Authentication** → **Providers** → **Google**
8. Enable Google provider
9. Paste Client ID and Client Secret
10. Click "Save"

### Configure URL Settings

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## Step 6: Install Dependencies & Start Server

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

## Step 7: Test Account Creation

1. Open http://localhost:3000/signup
2. Fill in the signup form:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Create account"
4. You should see: "Account created! Please check your email to verify your account."
5. Go to http://localhost:3000/login
6. Sign in with the credentials you just created

### Test Google OAuth (if configured)

1. On the signup or login page, click "Sign up/ Sign in with Google"
2. You should be redirected to Google's consent screen
3. After authorizing, you should be redirected back and logged in

## Troubleshooting

### "Failed to create account" error

**Check:**
- ✅ Environment variables are set correctly in `.env.local`
- ✅ Database migration (`001_initial_schema.sql`) has been run
- ✅ Restart the dev server after adding `.env.local` (variables load on startup)
- ✅ Check browser console for detailed error messages
- ✅ Check Supabase dashboard → Authentication → Users (see if user was created but profile wasn't)

### "Profile not created" error

**Check:**
- ✅ The `handle_new_user()` trigger function exists in the database
- ✅ Run the migration again: Copy and paste `001_initial_schema.sql` into SQL Editor

### "Invalid API key" error

**Check:**
- ✅ Copied the correct keys from Supabase dashboard
- ✅ No extra spaces or quotes around the values in `.env.local`
- ✅ Restarted the dev server after updating `.env.local`

### Google OAuth not working

**Check:**
- ✅ Google OAuth is enabled in Supabase dashboard
- ✅ Client ID and Secret are correct
- ✅ Redirect URI is correctly configured in Google Cloud Console
- ✅ Redirect URI matches exactly: `https://your-project-id.supabase.co/auth/v1/callback`

### Email verification not working

**For Development:**
- Disable email confirmation in Supabase: **Authentication** → **Providers** → **Email** → Uncheck "Enable email confirmations"
- Users can login immediately after signup

**For Production:**
- Enable email confirmation
- Configure SMTP settings in Supabase: **Settings** → **Auth** → **SMTP Settings**
- Or use Supabase's built-in email service (has sending limits)

## Next Steps

After account creation is working:

1. ✅ Test all authentication methods (email/password, Google OAuth, magic link)
2. ✅ Create admin/lawyer accounts (see SETUP.md)
3. ✅ Set up Paystack for payments (if not done)
4. ✅ Configure email service for production (if needed)
5. ✅ Review AUTHENTICATION_REVIEW.md for detailed testing checklist

## Quick Reference

**Essential Files:**
- `.env.local` - Environment variables (create this file)
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `app/signup/page.tsx` - Signup page
- `app/login/page.tsx` - Login page
- `app/auth/callback/route.ts` - OAuth/magic link callback handler

**Key Supabase Settings:**
- Authentication → Providers → Email (enable)
- Authentication → URL Configuration (set Site URL and Redirect URLs)
- SQL Editor (run migrations)

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (for payments)
- `PAYSTACK_SECRET_KEY` (for payments)
