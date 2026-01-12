# Fix Email Deliverability Issues

## Problem
- Emails are going to spam/junk folder
- Emails not being received in some email providers (e.g., Gmail)

## Root Causes

### 1. **Missing SPF/DKIM Records**
   - Your domain doesn't have proper email authentication records
   - Email providers can't verify the sender
   - Result: Emails marked as spam

### 2. **Unverified Sender Domain**
   - Using unverified domain in Resend
   - Using generic email addresses (e.g., `noreply@legalease.com` without domain verification)

### 3. **Email Content Issues**
   - Spam trigger words
   - Poor HTML formatting
   - Missing plain text version

### 4. **Sender Reputation**
   - New domain/email address
   - Low sending volume
   - High bounce rates

## Solutions

### Solution 1: Verify Your Domain in Resend (CRITICAL)

1. **Go to Resend Dashboard**
   - Navigate to https://resend.com/domains
   - Click "Add Domain"

2. **Add Your Domain**
   - Enter your domain (e.g., `legalease.com`)
   - Resend will provide DNS records to add

3. **Add DNS Records to Your Domain**
   You need to add these records in your domain's DNS settings:

   **SPF Record:**
   ```
   Type: TXT
   Name: @ (or your domain)
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM Records:**
   Resend will provide 3 DKIM records like:
   ```
   Type: CNAME
   Name: resend._domainkey
   Value: [provided by Resend]
   ```

   **DMARC Record (Recommended):**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
   ```

4. **Verify Domain in Resend**
   - Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)
   - Click "Verify" in Resend dashboard
   - All records should show as verified

5. **Update EMAIL_FROM Environment Variable**
   ```env
   EMAIL_FROM=noreply@yourdomain.com  # Use your verified domain
   ```

### Solution 2: Use Verified Domain Email Address

**Before (Bad):**
```env
EMAIL_FROM=noreply@legalease.com  # If domain not verified
```

**After (Good):**
```env
EMAIL_FROM=noreply@yourdomain.com  # Use your actual verified domain
```

### Solution 3: Improve Email Content

1. **Avoid Spam Trigger Words**
   - Avoid: "Free", "Click here", "Limited time", "Act now"
   - Use: "Verify", "Complete", "Welcome"

2. **Include Plain Text Version**
   - Our email function already includes this ✅

3. **Proper HTML Structure**
   - Our email templates are well-structured ✅

### Solution 4: Warm Up Your Domain (For New Domains)

If you're using a new domain:
1. Start with low email volume
2. Gradually increase sending
3. Monitor bounce rates
4. Build sender reputation over time

### Solution 5: Check Email Service Configuration

Verify your `.env.local` has:
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com  # Must be verified domain
```

## Step-by-Step: Verify Domain in Resend

### Step 1: Add Domain to Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `legalease.com`)
4. Click **"Add"**

### Step 2: Get DNS Records

Resend will show you DNS records to add:
- SPF record (TXT)
- DKIM records (CNAME) - usually 3 records
- DMARC record (TXT) - optional but recommended

### Step 3: Add DNS Records

**Where to add:**
- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Navigate to DNS settings
- Add the records provided by Resend

**Example (Cloudflare):**
1. Go to Cloudflare Dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each record provided by Resend

### Step 4: Wait for DNS Propagation

- Usually takes 1-2 hours
- Can take up to 48 hours
- Check propagation: https://dnschecker.org

### Step 5: Verify in Resend

1. Go back to Resend dashboard
2. Click **"Verify"** next to your domain
3. All records should show ✅ verified

### Step 6: Update Environment Variables

```env
EMAIL_FROM=noreply@yourdomain.com  # Use verified domain
```

### Step 7: Test Email Delivery

```bash
# Test email endpoint
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## For Gmail Specifically

### Why Gmail Might Not Receive Emails

1. **Strict Spam Filters**
   - Gmail has very strict spam filters
   - Unverified domains are often blocked

2. **Missing Authentication**
   - SPF/DKIM records not set up
   - DMARC not configured

3. **Sender Reputation**
   - New domain with no sending history
   - Low sender reputation

### Solutions for Gmail

1. **Verify Domain** (Most Important)
   - Add SPF/DKIM records
   - Verify domain in Resend

2. **Use Gmail for Testing Initially**
   - Send test emails to Gmail
   - Mark as "Not Spam" if in spam
   - This helps build reputation

3. **Check Gmail Spam Folder**
   - Even with proper setup, initial emails might go to spam
   - Mark as "Not Spam" to train Gmail

4. **Request Gmail Whitelist** (Advanced)
   - Contact Gmail support
   - Request domain whitelisting
   - Usually for high-volume senders

## Quick Checklist

- [ ] Domain added to Resend
- [ ] SPF record added to DNS
- [ ] DKIM records added to DNS (all 3)
- [ ] DMARC record added (recommended)
- [ ] Domain verified in Resend dashboard
- [ ] `EMAIL_FROM` uses verified domain
- [ ] Test email sent successfully
- [ ] Checked spam folder
- [ ] Marked as "Not Spam" if in spam

## Testing Email Deliverability

### Test 1: Check DNS Records

```bash
# Check SPF record
dig TXT yourdomain.com | grep spf

# Check DKIM records
dig TXT resend._domainkey.yourdomain.com

# Check DMARC record
dig TXT _dmarc.yourdomain.com
```

### Test 2: Use Email Testing Tools

- **Mail-Tester**: https://www.mail-tester.com
  - Send email to provided address
  - Get deliverability score
  - See what needs fixing

- **MXToolbox**: https://mxtoolbox.com
  - Check SPF/DKIM records
  - Verify DNS configuration

### Test 3: Send Test Emails

```bash
# Test to multiple providers
# Gmail, Outlook, Yahoo, etc.
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

## Common Issues

### Issue: "Domain not verified"

**Solution:**
- Add all DNS records provided by Resend
- Wait for DNS propagation
- Verify in Resend dashboard

### Issue: "Emails still going to spam after verification"

**Solution:**
- Wait 24-48 hours for DNS to fully propagate
- Mark emails as "Not Spam" in your inbox
- Build sender reputation by sending regularly
- Check email content for spam triggers

### Issue: "Gmail not receiving emails at all"

**Solution:**
- Verify domain is properly set up
- Check Gmail spam folder
- Use Mail-Tester to check deliverability score
- Consider using a subdomain for email (e.g., `mail.yourdomain.com`)

## Next Steps

1. ✅ **Verify your domain in Resend** (Most Important)
2. ✅ **Add SPF/DKIM/DMARC records**
3. ✅ **Update EMAIL_FROM to use verified domain**
4. ✅ **Test email delivery**
5. ✅ **Monitor spam rates**
6. ✅ **Build sender reputation over time**

## Resources

- **Resend Domain Setup**: https://resend.com/docs/dashboard/domains/introduction
- **SPF Record Guide**: https://www.dmarcanalyzer.com/spf/
- **DKIM Setup Guide**: https://www.dmarcanalyzer.com/dkim/
- **Mail-Tester**: https://www.mail-tester.com
- **MXToolbox**: https://mxtoolbox.com

## Summary

The main issue is **domain verification**. Once you:
1. Add your domain to Resend
2. Add SPF/DKIM records to your DNS
3. Verify the domain
4. Update `EMAIL_FROM` to use the verified domain

Your emails should have much better deliverability and won't go to spam.
