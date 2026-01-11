/**
 * File validation utilities
 * Provides strict validation for file types, sizes, and formats
 */

export type FileType = 'contract' | 'kyc' | 'reviewed'

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface FileValidationConfig {
  maxSize: number // in bytes
  allowedTypes: string[] // MIME types
  allowedExtensions: string[] // file extensions
}

// File validation configurations
const FILE_CONFIGS: Record<FileType, FileValidationConfig> = {
  contract: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
  kyc: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
  },
  reviewed: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return '.' + parts[parts.length - 1].toLowerCase()
}

/**
 * Get MIME type from file extension (basic mapping)
 */
function getMimeTypeFromExtension(extension: string): string | null {
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  }
  return mimeMap[extension.toLowerCase()] || null
}

/**
 * Validate file based on type and strict rules
 */
export function validateFile(
  file: File,
  fileType: FileType,
  options?: {
    checkMimeType?: boolean
    checkExtension?: boolean
  }
): FileValidationResult {
  const config = FILE_CONFIGS[fileType]
  const checkMimeType = options?.checkMimeType !== false // default to true
  const checkExtension = options?.checkExtension !== false // default to true

  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    }
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    }
  }

  // Validate file extension
  if (checkExtension) {
    const extension = getFileExtension(file.name)
    if (!extension) {
      return {
        valid: false,
        error: `File must have an extension (${config.allowedExtensions.join(', ')})`,
      }
    }

    if (!config.allowedExtensions.includes(extension.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${config.allowedExtensions.join(', ')}`,
      }
    }
  }

  // Validate MIME type
  if (checkMimeType && file.type) {
    // Check if MIME type matches allowed types
    const mimeTypeValid = config.allowedTypes.includes(file.type.toLowerCase())
    
    // Also check if extension matches expected MIME type
    if (checkExtension) {
      const extension = getFileExtension(file.name)
      const expectedMimeType = getMimeTypeFromExtension(extension)
      
      if (expectedMimeType && file.type.toLowerCase() !== expectedMimeType.toLowerCase()) {
        return {
          valid: false,
          error: `File type mismatch. File extension suggests ${expectedMimeType} but file is ${file.type}`,
        }
      }
    }

    if (!mimeTypeValid) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${config.allowedExtensions.join(', ')}`,
      }
    }
  }

  // Additional validation: Check file name
  if (!file.name || file.name.trim() === '') {
    return {
      valid: false,
      error: 'File name is required',
    }
  }

  // Check for suspicious file names (basic security check)
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved Windows names
  ]

  const fileName = file.name.trim()
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      return {
        valid: false,
        error: 'Invalid file name',
      }
    }
  }

  return {
    valid: true,
  }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get allowed file types string for HTML accept attribute
 */
export function getAllowedFileTypesString(fileType: FileType): string {
  const config = FILE_CONFIGS[fileType]
  // Return format: ".pdf,.doc,.docx" for accept attribute
  return config.allowedExtensions.join(',')
}
