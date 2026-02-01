/**
 * Email notification service
 * Supports sending transactional emails for various events using Resend
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from './env'
import { PRICING_TIERS } from './constants'

// Initialize Resend client
let resend: Resend | null = null
try {
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    resend = new Resend(resendApiKey)
  }
} catch (error) {
  console.warn('Resend not initialized:', error)
}

interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Normalize and validate email FROM field for Resend
 * Resend requires: "email@example.com" or "Name <email@example.com>"
 */
function normalizeEmailFrom(emailFrom: string): string {
  if (!emailFrom || typeof emailFrom !== 'string') {
    throw new Error('EMAIL_FROM is required and must be a string')
  }

  // Trim whitespace
  emailFrom = emailFrom.trim()

  // If it's already in correct format "email@domain.com", return as is
  const simpleEmailRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/
  if (simpleEmailRegex.test(emailFrom)) {
    return emailFrom
  }

  // Check if it matches "Name <email@domain.com>" format
  const nameEmailRegex = /^[^<>]+<([^\s<>]+@[^\s<>]+\.[^\s<>]+)>$/
  const match = emailFrom.match(nameEmailRegex)
  if (match && match[1]) {
    return emailFrom // Already in correct format
  }

  // Try to extract email from various formats
  const emailMatch = emailFrom.match(/([^\s<>]+@[^\s<>]+\.[^\s<>]+)/)
  if (emailMatch && emailMatch[1]) {
    // Extract just the email address
    return emailMatch[1]
  }

  // If we can't parse it, throw error
  throw new Error(`Invalid EMAIL_FROM format: "${emailFrom}". Must be "email@example.com" or "Name <email@example.com>"`)
}

/**
 * Send email using Resend API
 */
async function sendEmail({ to, subject, html, text }: EmailData): Promise<boolean> {
  try {
    const emailFromRaw = process.env.EMAIL_FROM || getEnvVar('NEXT_PUBLIC_CONTACT_EMAIL', 'noreply@legalease.com')

    // Normalize and validate email FROM field
    let emailFrom: string
    try {
      emailFrom = normalizeEmailFrom(emailFromRaw)
    } catch (error: any) {
      console.error('Invalid EMAIL_FROM format:', error.message)
      console.error('Current EMAIL_FROM value:', emailFromRaw)
      console.error('Resend requires format: "email@example.com" or "Name <email@example.com>"')
      return false
    }

    const emailService = process.env.EMAIL_SERVICE || 'console'

    // Convert single email to array for Resend
    const toArray = Array.isArray(to) ? to : [to]

    switch (emailService) {
      case 'resend':
        if (!resend) {
          console.warn('Resend API key not configured. Set RESEND_API_KEY environment variable.')
          return false
        }

        const result = await resend.emails.send({
          from: emailFrom,
          to: toArray,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
          // Add headers to improve deliverability
          headers: {
            'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          // Add reply-to for better deliverability
          replyTo: process.env.EMAIL_REPLY_TO || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@legalease.com',
        })

        if (result.error) {
          console.error('Resend API error:', result.error)
          return false
        }

        return true

      case 'console':
      default:
        // Log email for development/debugging
        console.log('📧 Email would be sent:')
        console.log(`From: ${emailFrom}`)
        console.log(`To: ${toArray.join(', ')}`)
        console.log(`Subject: ${subject}`)
        console.log(`Body: ${text || html.substring(0, 200)}...`)
        return true
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Generate HTML email template
 */
function getEmailTemplate(title: string, content: string, actionText?: string, actionUrl?: string): string {
  const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@legalease.com'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Poppins, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">LegalEase</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #667eea; margin-top: 0;">${title}</h2>
    
    <div style="color: #555; font-size: 16px;">
      ${content}
    </div>
    
    ${actionText && actionUrl ? `
    <div style="margin: 30px 0; text-align: center;">
      <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600;">
        ${actionText}
      </a>
    </div>
    ` : ''}
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #888; font-size: 14px; margin: 0;">
      If you have any questions, please contact us at 
      <a href="mailto:${contactEmail}" style="color: #667eea;">${contactEmail}</a>
    </p>
    
    <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
      © ${new Date().getFullYear()} LegalEase. All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim()
}

// ============================================
// USER NOTIFICATIONS
// ============================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = 'Welcome to LegalEase!'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Welcome to LegalEase! We're excited to have you on board.</p>
    
    <p>Your account has been successfully created. To get started, please complete your KYC (Know Your Customer) verification, which is required before you can submit contracts for review.</p>
    
    <p>Once your KYC is approved, you'll be able to:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
      <li>Submit contracts for review</li>
      <li>Make payments securely</li>
      <li>Track your contract reviews</li>
      <li>Download reviewed documents</li>
    </ul>
    
    <p>If you have any questions, our support team is here to help!</p>
  `

  const html = getEmailTemplate(
    'Welcome to LegalEase!',
    content,
    'Complete KYC Verification',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kyc`
  )

  const text = `Welcome to LegalEase!\n\nDear ${userName || 'there'},\n\nWelcome to LegalEase! We're excited to have you on board.\n\nYour account has been successfully created. To get started, please complete your KYC (Know Your Customer) verification, which is required before you can submit contracts for review.\n\nComplete your KYC: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kyc`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send KYC approval email to user
 */
export async function sendKYCApprovalEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = 'KYC Verification Approved - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Great news! Your KYC (Know Your Customer) verification has been approved.</p>
    
    <p>You can now:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
      <li>Submit contracts for review</li>
      <li>Make payments securely</li>
      <li>Access all platform features</li>
    </ul>
    
    <p>We're ready to help you with your contract review needs!</p>
  `

  const html = getEmailTemplate(
    'KYC Verification Approved',
    content,
    'Go to Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `KYC Verification Approved\n\nDear ${userName || 'there'},\n\nGreat news! Your KYC verification has been approved. You can now submit contracts for review and access all platform features.\n\nGo to dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send KYC rejection email to user
 */
export async function sendKYCRejectionEmail(userEmail: string, userName: string, reason?: string): Promise<boolean> {
  const subject = 'KYC Verification - Action Required - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>We regret to inform you that your KYC (Know Your Customer) verification was not approved at this time.</p>
    
    ${reason ? `
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>Reason:</strong></p>
      <p style="margin: 5px 0 0 0;">${reason}</p>
    </div>
    ` : ''}
    
    <p>Please review the information you provided and ensure all documents are clear and valid. You can resubmit your KYC verification after making the necessary corrections.</p>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
  `

  const html = getEmailTemplate(
    'KYC Verification - Action Required',
    content,
    'Resubmit KYC',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kyc`
  )

  const text = `KYC Verification - Action Required\n\nDear ${userName || 'there'},\n\nWe regret to inform you that your KYC verification was not approved at this time.${reason ? `\n\nReason: ${reason}` : ''}\n\nPlease review the information you provided and resubmit your KYC verification.\n\nResubmit KYC: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kyc`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send payment confirmation email to user
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: number,
  contractTitle: string,
  paymentReference: string
): Promise<boolean> {
  const subject = 'Payment Confirmed - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Thank you for your payment! We have successfully received your payment of <strong>₦${amount.toLocaleString()}</strong> for the contract review of <strong>"${contractTitle}"</strong>.</p>
    
    <p><strong>Payment Reference:</strong> ${paymentReference}</p>
    
    <p>Your contract is now being processed and will be assigned to one of our licensed lawyers for review. You will receive another email once the contract has been assigned.</p>
    
    <p>You can track the status of your contract review in your dashboard.</p>
  `

  const html = getEmailTemplate(
    'Payment Confirmed',
    content,
    'View Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `Payment Confirmed\n\nDear ${userName || 'there'},\n\nThank you for your payment! We have successfully received your payment of ₦${amount.toLocaleString()} for the contract review of "${contractTitle}".\n\nPayment Reference: ${paymentReference}\n\nYour contract is now being processed and will be assigned to one of our licensed lawyers for review.\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send contract assignment email to lawyer
 */
export async function sendContractAssignmentEmail(
  lawyerEmail: string,
  lawyerName: string,
  contractTitle: string,
  contractId: string,
  userName: string,
  pricingTier: string
): Promise<boolean> {
  const tierInfo = PRICING_TIERS[pricingTier as keyof typeof PRICING_TIERS]

  const subject = 'New Contract Assigned - LegalEase'
  const content = `
    <p>Dear ${lawyerName || 'there'},</p>
    
    <p>A new contract has been assigned to you for review:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Contract Title:</strong> ${contractTitle}</p>
      <p style="margin: 5px 0 0 0;"><strong>Client:</strong> ${userName}</p>
      <p style="margin: 5px 0 0 0;"><strong>Pricing Tier:</strong> ${tierInfo?.name || pricingTier}</p>
    </div>
    
    <p>Please log in to your lawyer dashboard to access the contract and begin the review process.</p>
  `

  const html = getEmailTemplate(
    'New Contract Assigned',
    content,
    'Review Contract',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lawyer`
  )

  const text = `New Contract Assigned\n\nDear ${lawyerName || 'there'},\n\nA new contract has been assigned to you for review:\n\nContract Title: ${contractTitle}\nClient: ${userName}\nPricing Tier: ${tierInfo?.name || pricingTier}\n\nPlease log in to your lawyer dashboard to access the contract and begin the review process.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lawyer`

  return await sendEmail({ to: lawyerEmail, subject, html, text })
}

/**
 * Send contract review completion email to user
 */
export async function sendReviewCompletionEmail(
  userEmail: string,
  userName: string,
  contractTitle: string,
  lawyerName: string
): Promise<boolean> {
  const subject = 'Contract Review Completed - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Great news! The review of your contract <strong>"${contractTitle}"</strong> has been completed by ${lawyerName}.</p>
    
    <p>The reviewed document is now available in your dashboard. You can download it and review the lawyer's feedback and recommendations.</p>
    
    <p>If you have any questions about the review or need clarification on any points, please don't hesitate to contact us.</p>
  `

  const html = getEmailTemplate(
    'Contract Review Completed',
    content,
    'Download Reviewed Document',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `Contract Review Completed\n\nDear ${userName || 'there'},\n\nGreat news! The review of your contract "${contractTitle}" has been completed by ${lawyerName}.\n\nThe reviewed document is now available in your dashboard. You can download it and review the lawyer's feedback and recommendations.\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send contract assignment notification email to user
 */
export async function sendContractAssignmentNotificationToUser(
  userEmail: string,
  userName: string,
  contractTitle: string,
  lawyerName: string
): Promise<boolean> {
  const subject = 'Contract Assigned for Review - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Your contract <strong>"${contractTitle}"</strong> has been assigned to ${lawyerName} for review.</p>
    
    <p>The lawyer will review your contract and provide feedback. You'll receive an email notification once the review is completed.</p>
    
    <p>You can track the status of your contract review in your dashboard.</p>
  `

  const html = getEmailTemplate(
    'Contract Assigned for Review',
    content,
    'View Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `Contract Assigned for Review\n\nDear ${userName || 'there'},\n\nYour contract "${contractTitle}" has been assigned to ${lawyerName} for review.\n\nThe lawyer will review your contract and provide feedback. You'll receive an email notification once the review is completed.\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send payment failed notification email to user
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  contractTitle: string,
  paymentReference: string,
  reason?: string
): Promise<boolean> {
  const subject = 'Payment Failed - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>We were unable to process your payment of <strong>₦${amount.toLocaleString()}</strong> for the contract review of <strong>"${contractTitle}"</strong>.</p>
    
    ${reason ? `
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>Reason:</strong></p>
      <p style="margin: 5px 0 0 0;">${reason}</p>
    </div>
    ` : ''}
    
    <p><strong>Payment Reference:</strong> ${paymentReference}</p>
    
    <p>Please check your payment method and try again. If the issue persists, please contact our support team for assistance.</p>
    
    <p>Your contract is still pending payment. You can retry the payment from your dashboard.</p>
  `

  const html = getEmailTemplate(
    'Payment Failed',
    content,
    'Retry Payment',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `Payment Failed\n\nDear ${userName || 'there'},\n\nWe were unable to process your payment of ₦${amount.toLocaleString()} for the contract review of "${contractTitle}".\n\n${reason ? `Reason: ${reason}\n\n` : ''}Payment Reference: ${paymentReference}\n\nPlease check your payment method and try again. If the issue persists, please contact our support team.\n\nRetry payment: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send password reset completion email
 */
export async function sendPasswordResetCompletionEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const subject = 'Password Reset Successful - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Your password has been successfully reset.</p>
    
    <p>If you did not initiate this password reset, please contact our support team immediately to secure your account.</p>
    
    <p>For security reasons, we recommend using a strong, unique password and enabling two-factor authentication if available.</p>
  `

  const html = getEmailTemplate(
    'Password Reset Successful',
    content,
    'Login to Your Account',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
  )

  const text = `Password Reset Successful\n\nDear ${userName || 'there'},\n\nYour password has been successfully reset.\n\nIf you did not initiate this password reset, please contact our support team immediately.\n\nLogin: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send email verification email with verification link
 */
export async function sendEmailVerificationEmail(
  userEmail: string,
  userName: string,
  verificationLink: string
): Promise<boolean> {
  const subject = 'Verify Your Email - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Welcome to LegalEase! Please verify your email address to complete your account setup and access all features.</p>
    
    <p>Click the button below to verify your email address. This link will expire in 1 hour.</p>
    
    <p>If you didn't create an account with LegalEase, please ignore this email.</p>
  `

  const html = getEmailTemplate(
    'Verify Your Email',
    content,
    'Verify Email Address',
    verificationLink
  )

  const text = `Verify Your Email\n\nDear ${userName || 'there'},\n\nWelcome to LegalEase! Please verify your email address to complete your account setup.\n\nClick this link to verify: ${verificationLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't create an account with LegalEase, please ignore this email.`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send email verification reminder
 */
export async function sendEmailVerificationReminder(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const subject = 'Please Verify Your Email - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Please verify your email address to complete your account setup and access all features of LegalEase.</p>
    
    <p>Verifying your email helps us keep your account secure and ensures you receive important notifications about your contracts and account activity.</p>
    
    <p>If you didn't receive a verification email, you can request a new one from your account settings.</p>
  `

  const html = getEmailTemplate(
    'Verify Your Email',
    content,
    'Resend Verification Email',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
  )

  const text = `Please Verify Your Email\n\nDear ${userName || 'there'},\n\nPlease verify your email address to complete your account setup.\n\nResend verification email: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`

  return await sendEmail({ to: userEmail, subject, html, text })
}

/**
 * Send contract under review notification to user
 */
export async function sendContractUnderReviewEmail(
  userEmail: string,
  userName: string,
  contractTitle: string,
  lawyerName: string
): Promise<boolean> {
  const subject = 'Contract Review Started - LegalEase'
  const content = `
    <p>Dear ${userName || 'there'},</p>
    
    <p>Good news! ${lawyerName} has started reviewing your contract <strong>"${contractTitle}"</strong>.</p>
    
    <p>The lawyer is carefully examining your contract and will provide detailed feedback and recommendations. You'll receive an email notification once the review is completed.</p>
    
    <p>You can track the progress of your contract review in your dashboard.</p>
  `

  const html = getEmailTemplate(
    'Contract Review Started',
    content,
    'View Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  const text = `Contract Review Started\n\nDear ${userName || 'there'},\n\nGood news! ${lawyerName} has started reviewing your contract "${contractTitle}".\n\nThe lawyer is carefully examining your contract and will provide detailed feedback. You'll receive an email notification once the review is completed.\n\nView dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

  return await sendEmail({ to: userEmail, subject, html, text })
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

/**
 * Send new user signup notification to admin
 */
export async function sendNewUserSignupEmailToAdmin(
  adminEmail: string,
  userEmail: string,
  userName: string,
  signupDate: string
): Promise<boolean> {
  const subject = 'New User Signup - LegalEase'
  const content = `
    <p>A new user has signed up for LegalEase:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Name:</strong> ${userName || 'Not provided'}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0 0 0;"><strong>Signup Date:</strong> ${new Date(signupDate).toLocaleString()}</p>
    </div>
    
    <p>Please review their account and monitor their activity.</p>
  `

  const html = getEmailTemplate(
    'New User Signup',
    content,
    'View Admin Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
  )

  const text = `New User Signup\n\nA new user has signed up for LegalEase:\n\nName: ${userName || 'Not provided'}\nEmail: ${userEmail}\nSignup Date: ${new Date(signupDate).toLocaleString()}\n\nView admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`

  return await sendEmail({ to: adminEmail, subject, html, text })
}

/**
 * Send KYC submission notification to admin
 */
export async function sendKYCSubmissionEmailToAdmin(
  adminEmail: string,
  userEmail: string,
  userName: string,
  kycId: string
): Promise<boolean> {
  const subject = 'New KYC Submission - LegalEase'
  const content = `
    <p>A new KYC (Know Your Customer) verification has been submitted:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>User:</strong> ${userName || 'Not provided'}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0 0 0;"><strong>KYC ID:</strong> ${kycId}</p>
    </div>
    
    <p>Please review the KYC submission in the admin dashboard and approve or reject it.</p>
  `

  const html = getEmailTemplate(
    'New KYC Submission',
    content,
    'Review KYC Submission',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
  )

  const text = `New KYC Submission\n\nA new KYC verification has been submitted:\n\nUser: ${userName || 'Not provided'}\nEmail: ${userEmail}\nKYC ID: ${kycId}\n\nPlease review the KYC submission in the admin dashboard.\n\nView admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`

  return await sendEmail({ to: adminEmail, subject, html, text })
}

/**
 * Send payment notification to admin
 */
export async function sendPaymentNotificationToAdmin(
  adminEmail: string,
  userEmail: string,
  userName: string,
  amount: number,
  contractTitle: string,
  paymentReference: string,
  contractId: string
): Promise<boolean> {
  const subject = 'New Payment Received - LegalEase'
  const content = `
    <p>A new payment has been received:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>User:</strong> ${userName || 'Not provided'}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract:</strong> ${contractTitle}</p>
      <p style="margin: 5px 0 0 0;"><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
      <p style="margin: 5px 0 0 0;"><strong>Payment Reference:</strong> ${paymentReference}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract ID:</strong> ${contractId}</p>
    </div>
    
    <p>The contract is now awaiting file upload from the user.</p>
  `

  const html = getEmailTemplate(
    'New Payment Received',
    content,
    'View Admin Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
  )

  const text = `New Payment Received\n\nA new payment has been received:\n\nUser: ${userName || 'Not provided'}\nEmail: ${userEmail}\nContract: ${contractTitle}\nAmount: ₦${amount.toLocaleString()}\nPayment Reference: ${paymentReference}\nContract ID: ${contractId}\n\nThe contract is now awaiting file upload from the user.\n\nView admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`

  return await sendEmail({ to: adminEmail, subject, html, text })
}

/**
 * Send file upload notification to admin
 */
export async function sendFileUploadNotificationToAdmin(
  adminEmail: string,
  userEmail: string,
  userName: string,
  contractTitle: string,
  contractId: string,
  fileName: string
): Promise<boolean> {
  const subject = 'Contract File Uploaded - LegalEase'
  const content = `
    <p>A contract file has been uploaded:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>User:</strong> ${userName || 'Not provided'}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract:</strong> ${contractTitle}</p>
      <p style="margin: 5px 0 0 0;"><strong>File:</strong> ${fileName}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract ID:</strong> ${contractId}</p>
    </div>
    
    <p>Please assign the contract to a lawyer for review.</p>
  `

  const html = getEmailTemplate(
    'Contract File Uploaded',
    content,
    'Assign Contract',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
  )

  const text = `Contract File Uploaded\n\nA contract file has been uploaded:\n\nUser: ${userName || 'Not provided'}\nEmail: ${userEmail}\nContract: ${contractTitle}\nFile: ${fileName}\nContract ID: ${contractId}\n\nPlease assign the contract to a lawyer for review.\n\nView admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`

  return await sendEmail({ to: adminEmail, subject, html, text })
}

/**
 * Send payment failed notification to admin
 */
export async function sendPaymentFailedNotificationToAdmin(
  adminEmail: string,
  userEmail: string,
  userName: string,
  amount: number,
  contractTitle: string,
  paymentReference: string,
  contractId: string,
  reason?: string
): Promise<boolean> {
  const subject = 'Payment Failed - LegalEase'
  const content = `
    <p>A payment has failed:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>User:</strong> ${userName || 'Not provided'}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract:</strong> ${contractTitle}</p>
      <p style="margin: 5px 0 0 0;"><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
      <p style="margin: 5px 0 0 0;"><strong>Payment Reference:</strong> ${paymentReference}</p>
      <p style="margin: 5px 0 0 0;"><strong>Contract ID:</strong> ${contractId}</p>
      ${reason ? `<p style="margin: 5px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>
    
    <p>Please review the payment details and contact the user if necessary.</p>
  `

  const html = getEmailTemplate(
    'Payment Failed',
    content,
    'View Admin Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
  )

  const text = `Payment Failed\n\nA payment has failed:\n\nUser: ${userName || 'Not provided'}\nEmail: ${userEmail}\nContract: ${contractTitle}\nAmount: ₦${amount.toLocaleString()}\nPayment Reference: ${paymentReference}\nContract ID: ${contractId}${reason ? `\nReason: ${reason}` : ''}\n\nPlease review the payment details and contact the user if necessary.\n\nView admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`

  return await sendEmail({ to: adminEmail, subject, html, text })
}

/**
 * Helper function to get admin email(s)
 * Fetches from database if available, otherwise uses environment variables
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    // Try to fetch admin emails from database
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { data: admins, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')

      if (!error && admins && admins.length > 0) {
        return admins.map((admin: { email: string }) => admin.email).filter(Boolean) as string[]
      }
    }
  } catch (error) {
    // Fallback to environment variables if database fetch fails
    console.warn('Failed to fetch admin emails from database, using environment variables:', error)
  }

  // Fallback to environment variable or default
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@legalease.com'
  return [adminEmail]
}

/**
 * Send contact form submission email to admin
 */
export async function sendContactFormEmailToAdmin(
  name: string,
  email: string,
  message: string,
  company?: string,
  phone?: string,
  service?: string
): Promise<boolean> {
  const adminEmails = await getAdminEmails()

  const subject = `New Contact Form Submission - ${name}`
  const content = `
    <p>You have received a new message from the contact form:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${email}</p>
      ${company ? `<p style="margin: 5px 0 0 0;"><strong>Company:</strong> ${company}</p>` : ''}
      ${phone ? `<p style="margin: 5px 0 0 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
      ${service ? `<p style="margin: 5px 0 0 0;"><strong>Interest:</strong> ${service}</p>` : ''}
      
      <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 15px;">
        <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    
    <p>You can reply directly to this email to contact the user at ${email}.</p>
  `

  const html = getEmailTemplate(
    'New Contact Message',
    content,
    'View Admin Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/messages`
  )

  const text = `New Contact Message\n\nName: ${name}\nEmail: ${email}\n${company ? `Company: ${company}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}${service ? `Interest: ${service}\n` : ''}\nMessage:\n${message}\n\nReply to: ${email}`

  // Send to all admins
  let success = true
  for (const adminEmail of adminEmails) {
    const result = await sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    })
    if (!result) success = false
  }

  return success
}
