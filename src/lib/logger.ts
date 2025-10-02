/**
 * Centralized Logging Utility for 301st RRIBn Personnel Management System
 * Provides color-coded, timestamped console logging for tracking application operations
 */

type LogLevel = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' | 'DEBUG' | 'AUTH';

interface LogOptions {
  context?: string;
  data?: unknown;
  userId?: string;
  email?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private colors = {
    INFO: '\x1b[36m',      // Cyan
    SUCCESS: '\x1b[32m',   // Green
    ERROR: '\x1b[31m',     // Red
    WARN: '\x1b[33m',      // Yellow
    DEBUG: '\x1b[35m',     // Magenta
    AUTH: '\x1b[34m',      // Blue
    RESET: '\x1b[0m',      // Reset
    BOLD: '\x1b[1m',       // Bold
    DIM: '\x1b[2m',        // Dim
  };

  private icons = {
    INFO: '📊',
    SUCCESS: '✅',
    ERROR: '❌',
    WARN: '⚠️',
    DEBUG: '🔍',
    AUTH: '🔐',
  };

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  private maskEmail(email: string): string {
    if (!email) return 'unknown';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.substring(0, 2) + '***';
    return `${maskedUsername}@${domain}`;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    options?: LogOptions
  ): string {
    const timestamp = this.getTimestamp();
    const icon = this.icons[level];
    const color = this.colors[level];
    const reset = this.colors.RESET;
    const bold = this.colors.BOLD;
    const dim = this.colors.DIM;

    let formatted = `${dim}[${timestamp}]${reset} ${icon} ${color}${bold}${level}${reset}`;

    if (options?.context) {
      formatted += ` ${dim}|${reset} ${options.context}`;
    }

    formatted += ` ${dim}|${reset} ${message}`;

    if (options?.email) {
      formatted += ` ${dim}(${this.maskEmail(options.email)})${reset}`;
    }

    if (options?.userId) {
      formatted += ` ${dim}[ID: ${options.userId.substring(0, 8)}...]${reset}`;
    }

    return formatted;
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.isDevelopment && level === 'DEBUG') return;

    const formatted = this.formatMessage(level, message, options);
    console.log(formatted);

    if (options?.data && this.isDevelopment) {
      console.log(`${this.colors.DIM}   └─ Data:${this.colors.RESET}`, options.data);
    }
  }

  // Public logging methods
  info(message: string, options?: LogOptions): void {
    this.log('INFO', message, options);
  }

  success(message: string, options?: LogOptions): void {
    this.log('SUCCESS', message, options);
  }

  error(message: string, error?: unknown, options?: LogOptions): void {
    this.log('ERROR', message, options);
    if (error && this.isDevelopment) {
      console.error(`${this.colors.DIM}   └─ Error Details:${this.colors.RESET}`, error);
    }
  }

  warn(message: string, options?: LogOptions): void {
    this.log('WARN', message, options);
  }

  debug(message: string, options?: LogOptions): void {
    this.log('DEBUG', message, options);
  }

  auth(message: string, options?: LogOptions): void {
    this.log('AUTH', message, options);
  }

  // Specialized auth logging methods
  authAttempt(email: string, type: 'signin' | 'signup' | 'signout'): void {
    const messages = {
      signin: 'Sign in attempt',
      signup: 'Sign up attempt',
      signout: 'Sign out request',
    };
    this.auth(messages[type], { email });
  }

  authSuccess(email: string, role?: string, userId?: string): void {
    let message = 'Authentication successful';
    if (role) {
      message += ` - Role: ${role}`;
    }
    this.success(message, { email, userId });
  }

  authError(email: string, error: string | unknown): void {
    const errorMessage = typeof error === 'string' ? error : 'Authentication failed';
    this.error(errorMessage, error, { email });
  }

  // Database operation logging
  dbQuery(operation: string, table: string, details?: string): void {
    const message = `${operation} on ${table}${details ? ': ' + details : ''}`;
    this.debug(message, { context: 'DATABASE' });
  }

  dbSuccess(operation: string, table: string): void {
    this.success(`${operation} completed on ${table}`, { context: 'DATABASE' });
  }

  dbError(operation: string, table: string, error: unknown): void {
    this.error(`${operation} failed on ${table}`, error, { context: 'DATABASE' });
  }

  // Route/Navigation logging
  route(path: string, action: 'access' | 'redirect' | 'protect'): void {
    const messages = {
      access: `Accessing route: ${path}`,
      redirect: `Redirecting to: ${path}`,
      protect: `Protected route check: ${path}`,
    };
    this.info(messages[action], { context: 'ROUTING' });
  }

  // Session logging
  session(action: 'start' | 'refresh' | 'end', userId?: string): void {
    const messages = {
      start: 'Session started',
      refresh: 'Session refreshed',
      end: 'Session ended',
    };
    this.info(messages[action], { context: 'SESSION', userId });
  }

  // Separator for visual grouping
  separator(): void {
    if (this.isDevelopment) {
      console.log(`${this.colors.DIM}${'─'.repeat(80)}${this.colors.RESET}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
