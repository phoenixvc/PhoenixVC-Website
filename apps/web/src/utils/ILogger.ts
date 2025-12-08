// utils/ILogger.ts
// Unified logging interface for the application
// All logging should go through this interface to ensure consistency

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  log(message: string, ...args: unknown[]): void;
  group(label: string): void;
  groupEnd(): void;
  table(data: unknown): void;
  time(label: string): void;
  timeEnd(label: string): number;  // Returns duration in ms
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  createChild(prefix: string): ILogger;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
  showTimestamp?: boolean;
  showLevel?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger implements ILogger {
  private config: LoggerConfig;
  private timers: Map<string, number> = new Map();

  constructor(config?: Partial<LoggerConfig>) {
    const envLogLevel = (import.meta.env as Record<string, string>).VITE_LOG_LEVEL as LogLevel | undefined;
    this.config = {
      enabled: import.meta.env.DEV,
      level: envLogLevel || 'info',
      prefix: '',
      showTimestamp: true,
      showLevel: true,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      parts.push(`[${timestamp}]`);
    }

    if (this.config.showLevel) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    parts.push(message);
    return parts.join(' ');
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  log(message: string, ...args: unknown[]): void {
    this.info(message, ...args);
  }

  group(label: string): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.group(this.config.prefix ? `[${this.config.prefix}] ${label}` : label);
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  time(label: string): void {
    if (this.config.enabled) {
      this.timers.set(label, performance.now());
    }
  }

  timeEnd(label: string): number {
    if (!this.config.enabled) return 0;

    const start = this.timers.get(label);
    if (start === undefined) {
      this.warn(`Timer '${label}' does not exist`);
      return 0;
    }

    const duration = performance.now() - start;
    this.timers.delete(label);
    this.debug(`${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  createChild(prefix: string): ILogger {
    const childPrefix = this.config.prefix
      ? `${this.config.prefix}:${prefix}`
      : prefix;

    return new Logger({
      ...this.config,
      prefix: childPrefix,
    });
  }
}

// Create the singleton instance
const rootLogger = new Logger();

// Export both the interface, the class, and the singleton
export { Logger };
export const logger: ILogger = rootLogger;
export default logger;
