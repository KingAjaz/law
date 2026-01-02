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
4. Enable Google OAuth in Authentication > Providers (optional)

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

## Important Notes

- **NO AI is used for contract review** - All reviews are performed by licensed lawyers only
- AI is used only for the FAQ chatbot
- Make sure to configure Supabase storage bucket with proper RLS policies
- Test Paystack integration in test mode before going live
- All legal disclaimers should be displayed to users

## Production Deployment

1. Deploy to Vercel, Netlify, or your preferred hosting platform
2. Update environment variables in your hosting platform
3. Update Paystack webhook URL to production URL
4. Test all flows thoroughly before going live
