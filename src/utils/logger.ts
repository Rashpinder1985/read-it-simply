// Production-safe logging utility

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      metadata
    };

    // In development, log to console
    if (this.isDevelopment) {
      const logMethod = console[level] || console.log;
      const prefix = context ? `[${context}]` : '';
      logMethod(`${prefix} ${message}`, metadata || '');
    }

    // In production, you might want to send to a logging service
    // For now, we'll just store critical errors
    if (level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // In a real application, you would send this to your logging service
    // For example: Sentry, LogRocket, or your own logging API
    if (this.isDevelopment) {
      console.error('Logging service entry:', entry);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, context, metadata);
  }

  error(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, context, metadata);
  }
}

export const logger = new Logger();