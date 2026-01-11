'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  title?: string
  message?: string
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full card text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
              <pre className="text-xs text-red-700 overflow-auto">
                {error.toString()}
              </pre>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={resetError} className="btn btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <Link href="/" className="btn btn-outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

interface ErrorMessageProps {
  error: string | Error
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({ error, onDismiss, className = '' }: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  )
}
