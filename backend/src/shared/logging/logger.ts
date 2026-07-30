import { env } from '../../config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private format(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
      ...context,
    })
  }

  debug(message: string, context?: LogContext) {
    if (env.NODE_ENV === 'development') {
      console.log(this.format('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.format('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context))
  }

  error(message: string, context?: LogContext) {
    console.error(this.format('error', message, context))
  }
}

export const logger = new Logger()
