# Troubleshoot Outlook Spam & Gmail Not Receiving

## Your Current Issue
- ✅ SPF, DKIM, DMARC set up in Resend
- ❌ Still going to spam in Outlook
- ❌ Not receiving at all in Gmail

## Immediate Checks

### 1. Verify Domain is Actually Verified in Resend

1. Go to **Resend Dashboard** → **Domains**: https://resend.com/domains
2. Check your domain status:
   - ✅ All records should show **"Verified"** (green checkmarks)
   - ❌ If any show "Pending" or "Failed", fix those first

### 2. Check EMAIL_FROM Uses Verified Domain

**Critical:** Your `EMAIL_FROM` must use the **exact domain** you verified in Resend.

**Check your `.env.local` or Vercel environment variables:**

```env
# Must match the domain you verified in Resend
EMAIL_FROM=noreply@yourdomain.com  # Replace 'yourdomain.com' with your actual verified domain
```

**Common Mistakes:**
- ❌ `EMAIL_FROM=noreply@legalease.com` (if you verified `yourdomain.com`)
- ❌ `EMAIL_FROM=LegalEase <noreply@legalease.com>` (if domain doesn't match)
- ✅ `EMAIL_FROM=noreply@yourdomain.com` (matches verified domain)

### 3. Verify DNS Records Are Actually Live

Even if you added them, they might not be propagated yet.

**Test DNS Records:**

```bash
# Check SPF record
nslookup -type=TXT yourdomain.com

# Check DKIM records (Resend provides 3, check all)
nslookup -type=CNAME resend._domainkey.yourdomain.com

# Check DMARC record
nslookup -type=TXT _dmarc.yourdomain.com
```

**Or use online tools:**
- https://mxtoolbox.com/spf.aspx
- https://dnschecker.org
- https://www.dmarcanalyzer.com

### 4. Check Resend Email Logs

1. Go to **Resend Dashboard** → **Emails**: https://resend.com/emails
2. Check recent emails:
   - Look for bounce/delivery status
   - Check if emails are being sent successfully
   - Look for any error messages

## For Outlook Specifically

### Why Outlook Still Marks as Spam

1. **Domain Reputation**
   - New domains have low reputation
   - Outlook is very strict with new senders

2. **DNS Propagation**
   - DNS changes can take 24-48 hours globally
   - Outlook might not see updated records yet

3. **Email Content**
   - Outlook scans email content
   - Certain words/phrases trigger spam filters

### Solutions for Outlook

#### Solution 1: Wait for DNS Propagation (24-48 hours)
- DNS changes take time to propagate globally
- Outlook servers might not have updated records yet
- Wait 24-48 hours after adding DNS records

#### Solution 2: Mark as "Not Junk" in Outlook
1. Find the email in Junk folder
2. Right-click → **"Mark as Not Junk"**
3. Add sender to Safe Senders list
4. This trains Outlook's filter

#### Solution 3: Add to Safe Senders
1. In Outlook, go to **Settings** → **Mail** → **Junk Email**
2. Add `noreply@yourdomain.com` to **Safe Senders**
3. Future emails should go to inbox

#### Solution 4: Check Email Content
Review your email templates for spam trigger words:
- Avoid: "Free", "Click here", "Act now", "Limited time"
- Use: "Verify", "Complete", "Welcome", "Confirm"

#### Solution 5: Use Mail-Tester
1. Go to https://www.mail-tester.com
2. Get a test email address
3. Send test email from your app
4. Check the score (aim for 8+/10)
5. Fix any issues it identifies

## For Gmail Specifically

### Why Gmail Not Receiving Emails

1. **Gmail Blocking**
   - Gmail has very strict filters
   - Might be blocking emails completely
   - Not even going to spam

2. **Domain Reputation**
   - New domains are often blocked
   - Gmail requires high sender reputation

3. **Missing Authentication**
   - Even with SPF/DKIM, Gmail might not trust new domains
   - Requires time to build reputation

### Solutions for Gmail

#### Solution 1: Check Gmail Spam Folder
- Gmail might be silently filtering
- Check **Spam** folder thoroughly
- Check **All Mail** folder
- Search for emails from your domain

#### Solution 2: Check Gmail Filters
1. Go to Gmail → **Settings** → **Filters and Blocked Addresses**
2. Check if your domain is blocked
3. Remove any blocks

#### Solution 3: Use Gmail for Testing
1. Send test email to your Gmail
2. Check **Spam** folder
3. If in spam, mark as **"Not Spam"**
4. This helps build reputation

#### Solution 4: Check Gmail Postmaster Tools
1. Go to https://postmaster.google.com
2. Add your domain
3. Verify ownership
4. Check delivery statistics
5. See if Gmail is blocking your domain

#### Solution 5: Use Mail-Tester for Gmail
1. Use https://www.mail-tester.com
2. Send test email
3. Check Gmail-specific issues
4. Fix any problems identified

#### Solution 6: Warm Up Your Domain (For Gmail)
Gmail requires domain warm-up for new domains:
1. Start with 10-20 emails per day
2. Gradually increase to 50-100 per day
3. Build reputation over 2-4 weeks
4. Monitor bounce rates

## Step-by-Step Debugging

### Step 1: Verify Configuration

```bash
# Check your environment variables
# Make sure EMAIL_FROM matches verified domain
echo $EMAIL_FROM
```

### Step 2: Test DNS Records

```bash
# Test SPF
dig TXT yourdomain.com +short | grep spf

# Test DKIM (check all 3 records Resend provided)
dig CNAME resend._domainkey.yourdomain.com +short

# Test DMARC
dig TXT _dmarc.yourdomain.com +short
```

### Step 3: Send Test Email

```bash
# Test email endpoint
curl -X POST https://yourdomain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@outlook.com"}'
```

### Step 4: Check Resend Logs

1. Go to Resend Dashboard → Emails
2. Find your test email
3. Check delivery status
4. Look for bounce/delivery errors

### Step 5: Use Mail-Tester

1. Go to https://www.mail-tester.com
2. Get test email address
3. Send test email
4. Check score and fix issues

## Common Issues & Fixes

### Issue 1: "Domain verified but emails still spam"

**Possible Causes:**
- DNS not fully propagated (wait 24-48 hours)
- EMAIL_FROM doesn't match verified domain
- Low sender reputation

**Fix:**
1. Verify EMAIL_FROM matches verified domain exactly
2. Wait 24-48 hours for DNS propagation
3. Mark emails as "Not Spam" to build reputation
4. Use Mail-Tester to identify issues

### Issue 2: "Gmail not receiving emails at all"

**Possible Causes:**
- Gmail blocking domain completely
- Domain reputation too low
- Missing authentication

**Fix:**
1. Check Gmail spam folder thoroughly
2. Check Gmail filters/blocked addresses
3. Use Gmail Postmaster Tools
4. Warm up domain gradually
5. Verify all DNS records are correct

### Issue 3: "Outlook spam but other providers work"

**Possible Causes:**
- Outlook has stricter filters
- Domain reputation low
- Email content triggers filters

**Fix:**
1. Mark as "Not Junk" in Outlook
2. Add to Safe Senders
3. Review email content
4. Wait for reputation to build

## Quick Fix Checklist

- [ ] Domain verified in Resend (all records ✅)
- [ ] EMAIL_FROM matches verified domain exactly
- [ ] DNS records propagated (check with dnschecker.org)
- [ ] Tested with Mail-Tester (score 8+/10)
- [ ] Checked Resend email logs for errors
- [ ] Marked emails as "Not Spam" in Outlook
- [ ] Added to Safe Senders in Outlook
- [ ] Checked Gmail spam folder
- [ ] Checked Gmail filters/blocked addresses
- [ ] Used Gmail Postmaster Tools
- [ ] Waited 24-48 hours for DNS propagation

## Immediate Actions

### For Outlook:
1. **Mark as "Not Junk"** - Find email in Junk, right-click, mark as not junk
2. **Add to Safe Senders** - Add your email address to safe senders list
3. **Wait 24-48 hours** - DNS needs time to propagate

### For Gmail:
1. **Check Spam Folder** - Thoroughly check spam and all mail
2. **Check Filters** - Make sure domain isn't blocked
3. **Use Postmaster Tools** - Add domain and check delivery stats
4. **Warm Up Domain** - Start with low volume, gradually increase

## Testing Tools

1. **Mail-Tester**: https://www.mail-tester.com
   - Get deliverability score
   - See specific issues
   - Gmail/Outlook specific checks

2. **MXToolbox**: https://mxtoolbox.com
   - Check SPF/DKIM records
   - Verify DNS configuration

3. **DNS Checker**: https://dnschecker.org
   - Check DNS propagation globally
   - See if records are live worldwide

4. **Gmail Postmaster**: https://postmaster.google.com
   - Check Gmail delivery stats
   - See if Gmail is blocking

## Next Steps

1. ✅ **Verify EMAIL_FROM matches verified domain**
2. ✅ **Check DNS records are actually live** (use dnschecker.org)
3. ✅ **Use Mail-Tester** to get deliverability score
4. ✅ **Check Resend email logs** for delivery status
5. ✅ **Mark as "Not Spam"** in Outlook
6. ✅ **Check Gmail spam folder** thoroughly
7. ✅ **Wait 24-48 hours** for DNS propagation
8. ✅ **Warm up domain** gradually for Gmail

## Summary

**Most Likely Issues:**
1. EMAIL_FROM doesn't match verified domain
2. DNS records not fully propagated (need 24-48 hours)
3. Low sender reputation (new domain)
4. Gmail blocking silently (check spam folder)

**Quick Fixes:**
- Verify EMAIL_FROM configuration
- Wait 24-48 hours for DNS
- Mark as "Not Spam" in Outlook
- Check Gmail spam folder
- Use Mail-Tester to identify issues
