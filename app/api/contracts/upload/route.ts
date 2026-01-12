import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { validateFile } from '@/lib/file-validation'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { sendFileUploadNotificationToAdmin, getAdminEmails } from '@/lib/email'

/**
 * API route to upload file for a contract after payment
 * Contract must have status 'awaiting_upload' and payment_status 'completed'
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.payment(request, '/api/contracts/upload')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many upload requests, please try again later' },
      { status: 429, headers }
    )
  }

  try {
    const supabase = createSupabaseServer()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const contractId = formData.get('contractId') as string
    const file = formData.get('file') as File

    if (!contractId || !file) {
      return NextResponse.json(
        { error: 'Contract ID and file are required' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file, 'contract')
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      )
    }

    // Verify contract exists, belongs to user, and is awaiting upload
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', user.id)
      .eq('status', 'awaiting_upload')
      .eq('payment_status', 'completed')
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found or not ready for upload' },
        { status: 404 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${contractId}-${Date.now()}.${fileExt}`
    const filePath = `contracts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      logger.error('File upload error', { contractId, error: uploadError })
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('documents').getPublicUrl(filePath)

    // Update contract with file URL and change status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        original_file_url: publicUrl,
        title: file.name,
        status: 'payment_confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)

    if (updateError) {
      logger.error('Contract update error', { contractId, error: updateError })
      return NextResponse.json(
        { error: 'Failed to update contract' },
        { status: 500 }
      )
    }

    logger.info('Contract file uploaded', { contractId, userId: user.id })

    // Send notification to admin
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        const adminEmails = await getAdminEmails()
        for (const adminEmail of adminEmails) {
          await sendFileUploadNotificationToAdmin(
            adminEmail,
            userProfile.email,
            userProfile.full_name || userProfile.email.split('@')[0],
            contract.title || file.name,
            contractId,
            file.name
          ).catch((error) => {
            logger.error('Failed to send file upload notification to admin', { adminEmail, contractId, error })
            // Don't fail the request if email fails
          })
        }
      }
    } catch (emailError) {
      logger.error('Error sending file upload notification', { contractId, error: emailError })
      // Don't fail the request if email fails
    }

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        contractId,
        fileUrl: publicUrl,
      },
      { headers }
    )
  } catch (error: any) {
    logger.error('Contract upload error', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
