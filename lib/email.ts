/**
 * Email notification service
 * Supports sending transactional emails for various events
 */

import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from './env'
import { PRICING_TIERS } from './constants'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface ContractNotificationData {
  contractTitle: string
  contractId: string
  status: string
  pricingTier?: string
  amount?: number
  userName?: string
  lawyerName?: string
}

/**
 * Send email using Supabase's email service
 * Note: Supabase Auth has built-in email capabilities, but for transactional emails
 * you may want to use a dedicated service like Resend, SendGrid, or Supabase's Edge Functions
 */
async function sendEmail({ to, subject, html, text }: EmailData): Promise<boolean> {
  try {
    // Option 1: Use Supabase Edge Function (recommended for production)
    // This requires setting up an Edge Function that handles email sending
    // const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    // const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${getEnvVar('SUPABASE_SERVICE_ROLE_KEY')}`
    //   },
    //   body: JSON.stringify({ to, subject, html, text })
    // })

    // Option 2: Use external email service (Resend, SendGrid, etc.)
    // For now, we'll log the email (implement actual sending based on your email service)
    const emailService = process.env.EMAIL_SERVICE || 'console' // console, resend, sendgrid

    switch (emailService) {
      case 'resend':
        // TODO: Implement Resend integration
        // const resendApiKey = getEnvVar('RESEND_API_KEY')
        // const resendResponse = await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${resendApiKey}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     from: getEnvVar('EMAIL_FROM') || 'LegalEase <noreply@legalease.com>',
        //     to,
        //     subject,
        //     html,
        //   }),
        // })
        // return resendResponse.ok
        console.log('Resend email service not yet configured')
        break

      case 'sendgrid':
        // TODO: Implement SendGrid integration
        // const sendGridApiKey = getEnvVar('SENDGRID_API_KEY')
        // const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${sendGridApiKey}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     personalizations: [{ to: [{ email: to }] }],
        //     from: { email: getEnvVar('EMAIL_FROM') || 'noreply@legalease.com' },
        //     subject,
        //     content: [{ type: 'text/html', value: html }],
        //   }),
        // })
        // return sendGridResponse.ok
        console.log('SendGrid email service not yet configured')
        break

      case 'console':
      default:
        // Log email for development/debugging
        console.log('📧 Email would be sent:')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(`Body: ${text || html.substring(0, 200)}...`)
        return true
    }

    return false
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

/**
 * Send payment confirmation email
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
    <p>Dear ${userName},</p>
    
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

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text: `Payment Confirmed\n\nDear ${userName},\n\nThank you for your payment! We have successfully received your payment of ₦${amount.toLocaleString()} for the contract review of "${contractTitle}".\n\nPayment Reference: ${paymentReference}\n\nYour contract is now being processed and will be assigned to one of our licensed lawyers for review.\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
  })
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
    <p>Dear ${lawyerName},</p>
    
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

  return await sendEmail({
    to: lawyerEmail,
    subject,
    html,
    text: `New Contract Assigned\n\nDear ${lawyerName},\n\nA new contract has been assigned to you for review:\n\nContract Title: ${contractTitle}\nClient: ${userName}\nPricing Tier: ${tierInfo?.name || pricingTier}\n\nPlease log in to your lawyer dashboard to access the contract and begin the review process.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lawyer`,
  })
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
    <p>Dear ${userName},</p>
    
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

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text: `Contract Review Completed\n\nDear ${userName},\n\nGreat news! The review of your contract "${contractTitle}" has been completed by ${lawyerName}.\n\nThe reviewed document is now available in your dashboard. You can download it and review the lawyer's feedback and recommendations.\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
  })
}

/**
 * Send contract status update email
 */
export async function sendContractStatusUpdateEmail(
  userEmail: string,
  userName: string,
  contractTitle: string,
  status: string,
  statusLabel: string
): Promise<boolean> {
  const subject = `Contract Status Update: ${statusLabel} - LegalEase`
  const content = `
    <p>Dear ${userName},</p>
    
    <p>The status of your contract <strong>"${contractTitle}"</strong> has been updated:</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #667eea;">${statusLabel}</p>
    </div>
    
    <p>You can check the current status and any updates in your dashboard.</p>
  `

  const html = getEmailTemplate(
    'Contract Status Update',
    content,
    'View Dashboard',
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  )

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text: `Contract Status Update: ${statusLabel}\n\nDear ${userName},\n\nThe status of your contract "${contractTitle}" has been updated to: ${statusLabel}\n\nYou can check the current status and any updates in your dashboard.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
  })
}
