/**
 * Production-ready logging utility
 * Supports structured logging, different log levels, and can be extended
 * to integrate with error tracking services (Sentry, LogRocket, etc.)
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Format log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message,
    ]

    if (entry.userId) {
      parts.push(`[user: ${entry.userId}]`)
    }

    if (entry.requestId) {
      parts.push(`[request: ${entry.requestId}]`)
    }

    return parts.join(' ')
  }

  /**
   * Get structured log object
   */
  private getStructuredLog(entry: LogEntry): object {
    return {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.requestId && { requestId: entry.requestId }),
    }
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const timestamp = new Date().toISOString()
    const entry: LogEntry = {
      level,
      message,
      timestamp,
      ...(context && { context }),
      ...(error && { error }),
    }

    // Get structured log object
    const structuredLog = this.getStructuredLog(entry)

    // Console output (different format for dev vs prod)
    if (this.isDevelopment) {
      // Development: Human-readable format
      const formatted = this.formatLogEntry(entry)
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted, context || '', error || '')
          break
        case LogLevel.INFO:
          console.info(formatted, context || '', error || '')
          break
        case LogLevel.WARN:
          console.warn(formatted, context || '', error || '')
          break
        case LogLevel.ERROR:
          console.error(formatted, context || '', error || '')
          break
      }
    } else {
      // Production: JSON format for log aggregation services
      console.log(JSON.stringify(structuredLog))
    }

    // TODO: Integrate with error tracking services in production
    // Example: Sentry, LogRocket, Datadog, etc.
    if (this.isProduction && level === LogLevel.ERROR) {
      // Future: Send to error tracking service
      // Sentry.captureException(error || new Error(message), { extra: context })
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error)
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * Log payment events
   */
  logPaymentEvent(
    event: string,
    context: {
      reference?: string
      amount?: number
      userId?: string
      contractId?: string
      status?: string
      [key: string]: any
    }
  ): void {
    this.info(`Payment Event: ${event}`, {
      eventType: 'payment',
      ...context,
    })
  }

  /**
   * Log contract events
   */
  logContractEvent(
    event: string,
    context: {
      contractId?: string
      userId?: string
      lawyerId?: string
      status?: string
      tier?: string
      [key: string]: any
    }
  ): void {
    this.info(`Contract Event: ${event}`, {
      eventType: 'contract',
      ...context,
    })
  }

  /**
   * Log authentication events
   */
  logAuthEvent(
    event: string,
    context: {
      userId?: string
      email?: string
      action?: string
      [key: string]: any
    }
  ): void {
    this.info(`Auth Event: ${event}`, {
      eventType: 'auth',
      ...context,
    })
  }

  /**
   * Log KYC events
   */
  logKycEvent(
    event: string,
    context: {
      userId?: string
      status?: string
      reviewedBy?: string
      [key: string]: any
    }
  ): void {
    this.info(`KYC Event: ${event}`, {
      eventType: 'kyc',
      ...context,
    })
  }

  /**
   * Log API request/response
   */
  logApiRequest(
    method: string,
    path: string,
    context: {
      statusCode?: number
      duration?: number
      userId?: string
      ip?: string
      [key: string]: any
    }
  ): void {
    const level = context.statusCode && context.statusCode >= 500 
      ? LogLevel.ERROR 
      : context.statusCode && context.statusCode >= 400 
      ? LogLevel.WARN 
      : LogLevel.INFO

    this.log(
      level,
      `API ${method} ${path}`,
      {
        eventType: 'api_request',
        method,
        path,
        ...context,
      }
    )
  }
}

// Export singleton instance
export const logger = new Logger()
