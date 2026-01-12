# Check Your Email Configuration

## Critical Issue: EMAIL_FROM Must Match Verified Domain

Your `EMAIL_FROM` environment variable **MUST** use the exact domain you verified in Resend.

## How to Check

### Step 1: Check Your Verified Domain in Resend

1. Go to **Resend Dashboard** → **Domains**: https://resend.com/domains
2. Note the domain you verified (e.g., `yourdomain.com`)
3. All records should show ✅ **"Verified"**

### Step 2: Check Your EMAIL_FROM Environment Variable

**In Vercel (Production):**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `EMAIL_FROM`
3. Check the value

**In Local (.env.local):**
```bash
# Check your .env.local file
cat .env.local | grep EMAIL_FROM
```

### Step 3: Verify They Match

**✅ CORRECT:**
```env
EMAIL_FROM=noreply@yourdomain.com
# Where 'yourdomain.com' matches the domain verified in Resend
```

**❌ WRONG:**
```env
EMAIL_FROM=noreply@legalease.com
# If you verified 'yourdomain.com' but using 'legalease.com'
```

**❌ WRONG:**
```env
EMAIL_FROM=LegalEase <noreply@legalease.com>
# Domain doesn't match verified domain
```

## Quick Diagnostic

Visit this endpoint (development only):
```
http://localhost:3000/api/email-config
```

It will show:
- Your current EMAIL_FROM
- Extracted domain
- Whether it matches verified domain

## Common Mistakes

1. **Using default domain**: `noreply@legalease.com` (not verified)
2. **Domain mismatch**: Verified `yourdomain.com` but using `legalease.com`
3. **Wrong format**: `LegalEase <noreply@domain.com>` (should be just email)

## Fix It

1. **Verify your domain in Resend** (if not done)
2. **Update EMAIL_FROM** to use verified domain:
   ```env
   EMAIL_FROM=noreply@yourdomain.com  # Use your verified domain
   ```
3. **Redeploy** (if using Vercel)
4. **Test** email delivery

## Why This Matters

- **Outlook**: Will mark as spam if domain doesn't match
- **Gmail**: Will block emails completely if domain not verified
- **All Providers**: Need SPF/DKIM to match sender domain

## Next Steps

1. ✅ Check verified domain in Resend
2. ✅ Check EMAIL_FROM environment variable
3. ✅ Make sure they match exactly
4. ✅ Update if needed
5. ✅ Redeploy
6. ✅ Test email delivery
