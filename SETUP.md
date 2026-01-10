# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Paystack account (for payments)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Set up storage bucket (see `supabase/storage-setup.md`)
4. Configure Authentication Providers in Supabase Dashboard:
   - **Email/Password**: Enabled by default
   - **Magic Link (OTP)**: Go to Authentication > Providers > Email, enable "Enable email confirmations"
   - **Google OAuth**: 
     - Go to Authentication > Providers
     - Enable Google provider
     - Add your Google OAuth Client ID and Secret
   - **GitHub OAuth** (optional):
     - Go to Authentication > Providers
     - Enable GitHub provider
     - Add your GitHub OAuth App Client ID and Secret
   - **Facebook OAuth** (optional):
     - Go to Authentication > Providers
     - Enable Facebook provider
     - Add your Facebook App ID and Secret

5. Configure Email Templates (optional):
   - Go to Authentication > Email Templates
   - Customize the confirmation email and password reset email templates

6. Configure Site URL and Redirect URLs:
   - Go to Authentication > URL Configuration
   - Site URL: `http://localhost:3000` (for development) or your production URL
   - Redirect URLs: Add `http://localhost:3000/auth/callback` and your production callback URL

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Paystack Webhook

1. Go to your Paystack dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
4. Select events: `charge.success`

## Step 5: Create Admin/Lawyer Accounts

To create admin or lawyer accounts, you can either:

1. **Via Supabase Dashboard:**
   - Go to Authentication > Users
   - Create a user
   - Go to Table Editor > profiles
   - Update the `role` field to 'admin' or 'lawyer'

2. **Via SQL:**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
   UPDATE profiles SET role = 'lawyer' WHERE email = 'lawyer@example.com';
   ```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Methods

The application supports the following authentication methods:

### 1. Email/Password Authentication
- Users can sign up and sign in with email and password
- Password requirements: Minimum 6 characters
- Email verification required for new accounts

### 2. Magic Link Authentication (Passwordless)
- Users can sign in without a password
- A magic link is sent to their email
- Click the link to authenticate automatically

### 3. OAuth Authentication
- **Google**: Sign in/sign up with Google account
- **GitHub**: Sign in/sign up with GitHub account (optional)
- **Facebook**: Sign in/sign up with Facebook account (optional)

### 4. Password Reset
- Users can request a password reset via email
- Secure password reset flow with email verification

### Authentication Routes

- `/login` - Sign in page (password or magic link)
- `/signup` - Sign up page (password or magic link)
- `/reset-password` - Request password reset
- `/auth/reset-password-confirm` - Set new password (after clicking reset link)
- `/auth/verify-email` - Email verification page
- `/auth/callback` - OAuth and magic link callback handler

## Important Notes

- **NO AI is used for contract review** - All reviews are performed by licensed lawyers only
- AI is used only for the FAQ chatbot
- Make sure to configure Supabase storage bucket with proper RLS policies
- Test Paystack integration in test mode before going live
- All legal disclaimers should be displayed to users
- Test all authentication flows (email/password, magic link, OAuth) before going live
- Ensure email templates are configured properly in Supabase dashboard

## Production Deployment

1. Deploy to Vercel, Netlify, or your preferred hosting platform
2. Update environment variables in your hosting platform
3. Update Paystack webhook URL to production URL
4. Test all flows thoroughly before going live
