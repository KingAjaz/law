# Resend API Setup Guide

## Quick Setup Steps

### 1. Sign Up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" and create an account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **"Create API Key"**
4. Give it a name (e.g., "LegalEase Production" or "LegalEase Development")
5. Select the permissions (at minimum, you need "Sending access")
6. Click **"Add"**
7. **Copy the API key immediately** - it starts with `re_` and you won't be able to see it again!

### 3. Verify Your Domain (Production)

For production use, you need to verify your sending domain:

1. Go to **Domains** in the Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `legalease.com`)
4. Follow the DNS verification steps:
   - Add the provided DNS records to your domain's DNS settings
   - Wait for verification (usually takes a few minutes)
5. Once verified, you can send emails from addresses like `noreply@legalease.com`

**Note:** For development/testing, you can use Resend's test domain without verification.

### 4. Configure Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist in the root of your project):

```env
# Email Service Configuration
EMAIL_SERVICE=resend

# Resend API Key (required)
RESEND_API_KEY=re_your_actual_api_key_here

# Email sender address
# For development: Use Resend's test domain (e.g., onboarding@resend.dev)
# For production: Use your verified domain (e.g., noreply@legalease.com)
EMAIL_FROM=LegalEase <onboarding@resend.dev>

# Admin email for notifications (optional - defaults to NEXT_PUBLIC_CONTACT_EMAIL)
ADMIN_EMAIL=admin@legalease.com

# Contact email (used as fallback)
NEXT_PUBLIC_CONTACT_EMAIL=support@legalease.com
```

### 5. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Trigger an email notification (e.g., sign up a new user, submit KYC, etc.)

3. Check the Resend dashboard:
   - Go to **Logs** in the Resend dashboard
   - You should see your email being sent
   - Check the status (delivered, bounced, etc.)

4. Check your email inbox (and spam folder)

### 6. Development vs Production

#### Development Mode
- Set `EMAIL_SERVICE=console` to log emails to console instead of sending
- Or use Resend's test domain: `onboarding@resend.dev`
- No domain verification needed for testing

#### Production Mode
- Set `EMAIL_SERVICE=resend`
- Use your verified domain in `EMAIL_FROM`
- Ensure `RESEND_API_KEY` is set in your production environment (Vercel, etc.)

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly and starts with `re_`
2. **Check Service**: Verify `EMAIL_SERVICE=resend` is set
3. **Check Logs**: Look at Resend dashboard → Logs for error messages
4. **Check Domain**: If using custom domain, ensure it's verified
5. **Check Rate Limits**: Free tier has limits (100 emails/day)

### Common Errors

- **"Invalid API key"**: Check that your API key is correct and hasn't been revoked
- **"Domain not verified"**: Verify your domain in Resend dashboard or use test domain
- **"Rate limit exceeded"**: Upgrade your Resend plan or wait for rate limit reset
- **"Email bounced"**: Check recipient email address is valid

### Testing Without Sending Real Emails

Set `EMAIL_SERVICE=console` in `.env.local`:
```env
EMAIL_SERVICE=console
```

This will log all emails to the console instead of sending them, useful for development.

## Resend Pricing

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month - 50,000 emails/month
- **Business Tier**: Custom pricing for higher volumes

Check [Resend Pricing](https://resend.com/pricing) for current plans.

## Security Notes

⚠️ **Important**: Never commit your `.env.local` file to git!

- The `.env.local` file should be in `.gitignore`
- For production, add environment variables in your hosting platform (Vercel, etc.)
- Rotate API keys if they're ever exposed
- Use different API keys for development and production

## Next Steps

Once Resend is configured:

1. ✅ Test welcome email (sign up a new user)
2. ✅ Test KYC submission notification (submit KYC)
3. ✅ Test payment confirmation (make a test payment)
4. ✅ Test contract assignment (assign a contract)
5. ✅ Monitor Resend dashboard for delivery rates

All email notifications are now active! 🎉
