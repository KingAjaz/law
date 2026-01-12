# Fix EMAIL_FROM Format Error

## Error Message
```
Invalid `from` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.
```

## Problem
Your `EMAIL_FROM` environment variable is not in the correct format that Resend requires.

## Valid Formats

Resend accepts **only** these two formats:

### Format 1: Simple Email (Recommended)
```env
EMAIL_FROM=noreply@yourdomain.com
```

### Format 2: Name + Email
```env
EMAIL_FROM=LegalEase <noreply@yourdomain.com>
```

## Invalid Formats (Will Cause Error)

❌ **Wrong:**
```env
EMAIL_FROM=LegalEase noreply@yourdomain.com  # Missing angle brackets
EMAIL_FROM=<noreply@yourdomain.com>  # Missing name before brackets
EMAIL_FROM=noreply@yourdomain.com <noreply@yourdomain.com>  # Duplicate
EMAIL_FROM=  # Empty
EMAIL_FROM=noreply  # Missing domain
EMAIL_FROM=@yourdomain.com  # Missing username
```

## How to Fix

### Step 1: Check Your Current EMAIL_FROM

**In Vercel:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `EMAIL_FROM`
3. Check the current value

**In Local:**
```bash
# Check .env.local
cat .env.local | grep EMAIL_FROM
```

### Step 2: Fix the Format

**Option A: Simple Email (Easiest)**
```env
EMAIL_FROM=noreply@yourdomain.com
```
Replace `yourdomain.com` with your actual verified domain.

**Option B: With Name**
```env
EMAIL_FROM=LegalEase <noreply@yourdomain.com>
```
Make sure there's a space between the name and `<`, and the email is inside angle brackets.

### Step 3: Update Environment Variable

**In Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Find `EMAIL_FROM`
3. Click **Edit**
4. Update to correct format
5. Click **Save**
6. **Redeploy** your application

**In Local (.env.local):**
```env
# Update this line
EMAIL_FROM=noreply@yourdomain.com
```

### Step 4: Verify

After updating, test sending an email:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Check Resend logs - the error should be gone.

## Common Mistakes

1. **Extra spaces:**
   - ❌ `EMAIL_FROM=LegalEase<noreply@domain.com>` (no space)
   - ✅ `EMAIL_FROM=LegalEase <noreply@domain.com>` (space before <)

2. **Missing angle brackets:**
   - ❌ `EMAIL_FROM=LegalEase noreply@domain.com`
   - ✅ `EMAIL_FROM=LegalEase <noreply@domain.com>`

3. **Using unverified domain:**
   - ❌ `EMAIL_FROM=noreply@legalease.com` (if you verified `yourdomain.com`)
   - ✅ `EMAIL_FROM=noreply@yourdomain.com` (matches verified domain)

## Quick Fix

**Simplest solution - use simple email format:**

```env
EMAIL_FROM=noreply@yourdomain.com
```

Replace `yourdomain.com` with the domain you verified in Resend.

## After Fixing

1. ✅ Update `EMAIL_FROM` to correct format
2. ✅ Redeploy (if using Vercel)
3. ✅ Test email sending
4. ✅ Check Resend logs - error should be gone
5. ✅ Emails should now send successfully

## Code Fix

The code has been updated to automatically normalize and validate the EMAIL_FROM format. If the format is invalid, it will:
- Log a clear error message
- Show the current invalid value
- Show the required format
- Return false (email won't be sent)

This helps identify the issue quickly.
