# Quick Fix: Emails Going to Spam

## Your Issue
- ✅ Emails are being sent (good!)
- ❌ Going to junk/spam in Outlook
- ❌ Not received in Gmail

## Root Cause
Your domain is **not verified** in Resend, so email providers can't verify the sender and mark emails as spam.

## Quick Fix (5 Steps)

### Step 1: Verify Your Domain in Resend

1. Go to **Resend Dashboard** → **Domains**: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **"Add"**

### Step 2: Add DNS Records

Resend will show you DNS records to add. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Records:**
Resend provides 3 CNAME records - add all of them.

**DMARC Record (Recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
```

### Step 3: Wait for DNS Propagation

- Usually 1-2 hours
- Can take up to 48 hours
- Check: https://dnschecker.org

### Step 4: Verify in Resend

1. Go back to Resend dashboard
2. Click **"Verify"** next to your domain
3. All records should show ✅

### Step 5: Update Environment Variable

Make sure `EMAIL_FROM` uses your verified domain:

```env
EMAIL_FROM=noreply@yourdomain.com  # Use your verified domain, not legalease.com
```

## Why This Fixes It

- **SPF Record**: Tells email providers that Resend is authorized to send emails from your domain
- **DKIM Records**: Cryptographically signs emails to prove they're from your domain
- **DMARC Record**: Tells providers what to do with unauthenticated emails

Without these, email providers can't verify the sender → emails go to spam.

## For Gmail Specifically

Gmail has very strict spam filters. After verifying your domain:

1. **Check Spam Folder**: Even with proper setup, initial emails might go to spam
2. **Mark as "Not Spam"**: This trains Gmail
3. **Wait 24-48 hours**: DNS needs time to propagate globally
4. **Build Reputation**: Send regular emails to build sender reputation

## Test After Fixing

```bash
# Test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

Then check:
- ✅ Inbox (not spam)
- ✅ Gmail receives it
- ✅ Outlook receives it in inbox

## Still Going to Spam?

1. **Wait 24-48 hours** for DNS to fully propagate
2. **Mark emails as "Not Spam"** in your inbox
3. **Check email content** - avoid spam trigger words
4. **Use Mail-Tester**: https://www.mail-tester.com
   - Send email to provided address
   - Get deliverability score
   - See what needs fixing

## Summary

**The fix:** Verify your domain in Resend and add SPF/DKIM records.

**Time:** 1-2 hours (DNS propagation)

**Result:** Emails go to inbox instead of spam ✅

See `FIX_EMAIL_DELIVERABILITY.md` for detailed instructions.
