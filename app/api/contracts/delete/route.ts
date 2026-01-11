import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Extract file path from Supabase storage URL
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    // Supabase storage URLs typically look like:
    // https://[project].supabase.co/storage/v1/object/public/documents/contracts/filename.pdf
    // or
    // https://[project].supabase.co/storage/v1/object/public/documents/reviewed-contracts/filename.pdf
    
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Find the 'documents' part and get everything after it
    const documentsIndex = pathParts.indexOf('documents')
    if (documentsIndex === -1 || documentsIndex === pathParts.length - 1) {
      return null
    }
    
    // Reconstruct path from 'documents' onwards
    const filePath = pathParts.slice(documentsIndex + 1).join('/')
    return filePath
  } catch (error) {
    logger.warn('Error extracting file path from URL', { url, error })
    return null
  }
}

/**
 * Delete file from Supabase storage
 */
async function deleteFileFromStorage(
  supabase: any,
  fileUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!fileUrl) {
    return { success: true } // No file to delete
  }

  const filePath = extractFilePathFromUrl(fileUrl)
  if (!filePath) {
    logger.warn('Could not extract file path from URL', { fileUrl })
    return { success: false, error: 'Invalid file URL' }
  }

  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath])

    if (error) {
      // If file doesn't exist, that's okay (might have been deleted already)
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        return { success: true }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    logger.error('Error deleting file from storage', { filePath, error }, error instanceof Error ? error : new Error(error.message))
    return { success: false, error: error.message || 'Failed to delete file' }
  }
}

/**
 * API route to delete a contract with proper file cleanup
 */
export async function DELETE(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.contract(request, '/api/contracts/delete')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get contract details including file URLs
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('original_file_url, reviewed_file_url, user_id')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Delete files from storage
    const originalFileResult = await deleteFileFromStorage(
      supabase,
      contract.original_file_url
    )

    const reviewedFileResult = await deleteFileFromStorage(
      supabase,
      contract.reviewed_file_url
    )

    // Log file deletion results (don't fail if files don't exist)
    if (!originalFileResult.success) {
      logger.warn('Failed to delete original file', {
        contractId,
        error: originalFileResult.error,
      })
    }
    if (!reviewedFileResult.success) {
      logger.warn('Failed to delete reviewed file', {
        contractId,
        error: reviewedFileResult.error,
      })
    }

    // Delete the contract record (this will cascade delete payments due to FK constraint)
    const { error: deleteError } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)

    if (deleteError) {
      logger.error('Failed to delete contract record', { contractId, error: deleteError })
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete contract' },
        { status: 500 }
      )
    }

    logger.logContractEvent('contract_deleted', {
      contractId,
      userId: contract.user_id,
      filesDeleted: {
        original: originalFileResult.success,
        reviewed: reviewedFileResult.success,
      },
    })

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: 'Contract deleted successfully',
        filesDeleted: {
          original: originalFileResult.success,
          reviewed: reviewedFileResult.success,
        },
      },
      { headers }
    )
  } catch (error: any) {
    // Don't reference contractId here as it may not be in scope if error occurs before destructuring
    logger.error('Contract deletion error', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
