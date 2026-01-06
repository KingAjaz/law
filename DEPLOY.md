# Deployment Guide

## GitHub Setup

1. Create a new repository on GitHub: https://github.com/new
   - Name: `legalease` (or your preferred name)
   - Description: "LegalEase - Professional contract review services by licensed Nigerian lawyers"
   - Keep it **Public** or **Private** (your choice)
   - **DO NOT** initialize with README, .gitignore, or license

2. After creating the repo, run these commands:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables with your actual Vercel URL
2. Configure Paystack webhook URL:
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-app.vercel.app/api/paystack/webhook`
3. Update Supabase Auth redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to allowed redirect URLs

## Important Notes

- Never commit `.env` files to GitHub
- All environment variables must be set in Vercel
- The app will automatically redeploy on every push to main branch
- Check Vercel logs if deployment fails
