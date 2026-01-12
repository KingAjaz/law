# Email Notifications Setup Guide

## Overview

The email notification system has been implemented using Resend as the email service provider. All notification functions are available in `lib/email.ts`.

## Email Service Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Email Service (optional - defaults to 'console' for development)
EMAIL_SERVICE=resend

# Resend API Key (required if using Resend)
RESEND_API_KEY=re_your_resend_api_key_here

# Email sender address (optional - defaults to NEXT_PUBLIC_CONTACT_EMAIL)
EMAIL_FROM=LegalEase <noreply@legalease.com>

# Admin email for notifications (optional - defaults to NEXT_PUBLIC_CONTACT_EMAIL)
ADMIN_EMAIL=admin@legalease.com
```

### Getting Resend API Key

1. Sign up at https://resend.com
2. Go to API Keys section
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

### Development Mode

If `EMAIL_SERVICE` is not set or set to `console`, emails will be logged to the console instead of being sent. This is useful for development.

## Implemented Notifications

### User Notifications

1. **Welcome Email** - Sent when user signs up
   - Function: `sendWelcomeEmail(userEmail, userName)`
   - Status: ✅ Integrated in `app/auth/callback/route.ts`
   - Triggers: When a new user completes email verification or OAuth signup

2. **KYC Approval Email** - Sent when admin approves KYC
   - Function: `sendKYCApprovalEmail(userEmail, userName)`
   - Status: ✅ Integrated in `app/api/kyc/verify/route.ts`
   - Triggers: When admin approves a KYC submission

3. **KYC Rejection Email** - Sent when admin rejects KYC
   - Function: `sendKYCRejectionEmail(userEmail, userName, reason?)`
   - Status: ✅ Integrated in `app/api/kyc/verify/route.ts`
   - Triggers: When admin rejects a KYC submission

4. **Payment Confirmation Email** - Sent when payment is confirmed
   - Function: `sendPaymentConfirmationEmail(userEmail, userName, amount, contractTitle, paymentReference)`
   - Status: ✅ Integrated in `app/api/paystack/webhook/route.ts`
   - Triggers: When payment webhook receives success event

5. **Contract Review Completion Email** - Sent when contract review is completed
   - Function: `sendReviewCompletionEmail(userEmail, userName, contractTitle, lawyerName)`
   - Status: ✅ Integrated in `app/api/contracts/complete-review/route.ts`
   - Triggers: When lawyer uploads reviewed contract file

6. **Contract Assignment Notification** - Sent when contract is assigned to a lawyer
   - Function: `sendContractAssignmentNotificationToUser(userEmail, userName, contractTitle, lawyerName)`
   - Status: ✅ Integrated in `app/api/contracts/assign/route.ts`
   - Triggers: When admin assigns a contract to a lawyer (or admin-lawyer assigns to themselves)

7. **Contract Under Review Notification** - Sent when lawyer starts reviewing
   - Function: `sendContractUnderReviewEmail(userEmail, userName, contractTitle, lawyerName)`
   - Status: ✅ Integrated in `app/api/contracts/update-status/route.ts`
   - Triggers: When contract status changes to 'under_review'

7. **Payment Failed Email** - Sent when payment fails
   - Function: `sendPaymentFailedEmail(userEmail, userName, amount, contractTitle, paymentReference, reason?)`
   - Status: ✅ Integrated in `app/api/paystack/webhook/route.ts`
   - Triggers: When payment webhook receives failed event

8. **Password Reset Completion Email** - Sent when password is successfully reset
   - Function: `sendPasswordResetCompletionEmail(userEmail, userName)`
   - Status: ✅ Integrated in `app/api/auth/password-reset-complete/route.ts` (called from reset password confirm page)
   - Triggers: When user successfully resets their password

9. **Email Verification Reminder** - Sent to users who haven't verified their email
   - Function: `sendEmailVerificationReminder(userEmail, userName)`
   - Status: ✅ Function available in `lib/email.ts`
   - Triggers: Can be called manually or via scheduled job (to be implemented)

### Admin Notifications

1. **New User Signup Notification** - Sent when a new user signs up
   - Function: `sendNewUserSignupEmailToAdmin(adminEmail, userEmail, userName, signupDate)`
   - Status: ✅ Integrated in `app/auth/callback/route.ts`
   - Triggers: When a new user completes signup (email or OAuth)
   - Recipients: All admin users (fetched from database)

2. **KYC Submission Notification** - Sent when user submits KYC
   - Function: `sendKYCSubmissionEmailToAdmin(adminEmail, userEmail, userName, kycId)`
   - Status: ✅ Integrated in `app/api/emails/send-notification/route.ts` (called from KYC page)
   - Triggers: When user completes and submits KYC form
   - Recipients: All admin users (fetched from database)

3. **Payment Notification** - Sent when payment is received
   - Function: `sendPaymentNotificationToAdmin(adminEmail, userEmail, userName, amount, contractTitle, paymentReference, contractId)`
   - Status: ✅ Integrated in `app/api/paystack/webhook/route.ts`
   - Triggers: When payment webhook receives success event
   - Recipients: All admin users (fetched from database)

4. **File Upload Notification** - Sent when user uploads contract file
   - Function: `sendFileUploadNotificationToAdmin(adminEmail, userEmail, userName, contractTitle, contractId, fileName)`
   - Status: ✅ Integrated in `app/api/contracts/upload/route.ts`
   - Triggers: When user uploads contract file after payment
   - Recipients: All admin users (fetched from database)

5. **Payment Failed Notification** - Sent when payment fails
   - Function: `sendPaymentFailedNotificationToAdmin(adminEmail, userEmail, userName, amount, contractTitle, paymentReference, contractId, reason?)`
   - Status: ✅ Integrated in `app/api/paystack/webhook/route.ts`
   - Triggers: When payment webhook receives failed event
   - Recipients: All admin users (fetched from database)

## Email Templates

All emails use a consistent HTML template with:
- LegalEase branding
- Professional styling
- Call-to-action buttons (where applicable)
- Contact information footer

## Helper Functions

- `getAdminEmails()` - Returns array of admin email addresses
- `sendEmail()` - Core email sending function (handles Resend/console modes)

## Testing

### Development Testing

1. Set `EMAIL_SERVICE=console` in `.env.local`
2. Emails will be logged to the console instead of being sent
3. Check the console output to verify email content

### Production Testing

1. Set `EMAIL_SERVICE=resend` and add your `RESEND_API_KEY`
2. Test each notification type by triggering the corresponding action
3. Check your Resend dashboard for delivery status

## Admin Email Configuration

The `getAdminEmails()` function automatically fetches admin email addresses from the database. It:
1. Queries the `profiles` table for all users with `role = 'admin'`
2. Returns all admin email addresses
3. Falls back to environment variables if database fetch fails:
   - `ADMIN_EMAIL` (single email)
   - `NEXT_PUBLIC_CONTACT_EMAIL` (fallback)
   - `admin@legalease.com` (default)

This ensures all admin users receive notifications without manual configuration.

## Complete Email Notification List

### User Notifications (10 total)
1. ✅ Welcome Email - New user signup
2. ✅ KYC Approval Email - KYC approved
3. ✅ KYC Rejection Email - KYC rejected
4. ✅ Payment Confirmation Email - Payment successful
5. ✅ Payment Failed Email - Payment failed
6. ✅ Contract Assignment Notification - Contract assigned to lawyer
7. ✅ Contract Under Review Notification - Lawyer started reviewing
8. ✅ Contract Review Completion Email - Review completed
9. ✅ Password Reset Completion Email - Password reset successful
10. ✅ Email Verification Reminder - Reminder to verify email (function available)

### Admin Notifications (5 total)
1. ✅ New User Signup Notification - New user registered
2. ✅ KYC Submission Notification - KYC submitted for review
3. ✅ Payment Notification - Payment received
4. ✅ Payment Failed Notification - Payment failed
5. ✅ File Upload Notification - Contract file uploaded

### Lawyer Notifications (1 total)
1. ✅ Contract Assignment Email - Contract assigned for review

## Admin-Lawyer Support

Since admins can also act as lawyers in your system:
- Admin users can receive contract assignment emails when contracts are assigned to them
- All admin notifications work for admin-lawyer users
- Contract assignment notifications properly handle both roles

## Future Enhancements

- [ ] Add batch email notifications
- [ ] Add email preferences/settings for users
- [ ] Schedule email verification reminder notifications (cron job or scheduled function)
- [ ] Add account security alerts (e.g., login from new device, password change notifications)
- [ ] Add weekly/monthly summary emails for users
- [ ] Add contract review deadline reminders

## Troubleshooting

### Emails not sending

1. Check that `RESEND_API_KEY` is set correctly
2. Verify `EMAIL_SERVICE=resend` is set
3. Check Resend dashboard for API errors
4. Check server logs for email sending errors

### Email delivery issues

1. Verify sender email domain is verified in Resend
2. Check spam folder
3. Verify recipient email addresses are valid
4. Check Resend dashboard for delivery status
