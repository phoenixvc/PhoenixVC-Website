import { logger as rootLogger, type ILogger } from "../../utils/ILogger";

// Internal logger instance for theme system
const themeLogger: ILogger = rootLogger.createChild("Theme");

export class LogManager {
  /**
   * Main logging method with options for different log types
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @param options Additional options for logging
   * @returns A function to end the group if a group was started
   */
  static log(
    prefix: string,
    message: string,
    enableLogging: boolean,
    options?: {
      group?: boolean;
      warn?: boolean;
      error?: boolean;
      info?: boolean;
      debug?: boolean;
    },
  ): () => void {
    if (!enableLogging) return () => {}; // No-op end function

    const fullMessage = `[${prefix}] ${message}`;

    if (options?.group) {
      themeLogger.group(fullMessage);
      return () => themeLogger.groupEnd();
    } else if (options?.warn) {
      themeLogger.warn(fullMessage);
    } else if (options?.error) {
      themeLogger.error(fullMessage);
    } else if (options?.info) {
      themeLogger.info(fullMessage);
    } else if (options?.debug) {
      themeLogger.debug(fullMessage);
    } else {
      themeLogger.log(fullMessage);
    }

    return () => {}; // No-op end function if no group was started
  }

  /**
   * Log an informational message
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @returns A no-op function for consistency with group methods
   */
  static info(
    prefix: string,
    message: string,
    enableLogging: boolean,
  ): () => void {
    return LogManager.log(prefix, message, enableLogging, { info: true });
  }

  /**
   * Log a warning message
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @returns A no-op function for consistency with group methods
   */
  static warn(
    prefix: string,
    message: string,
    enableLogging: boolean,
  ): () => void {
    return LogManager.log(prefix, message, enableLogging, { warn: true });
  }

  /**
   * Log an error message
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @returns A no-op function for consistency with group methods
   */
  static error(
    prefix: string,
    message: string,
    enableLogging: boolean,
  ): () => void {
    return LogManager.log(prefix, message, enableLogging, { error: true });
  }

  /**
   * Log a debug message
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @returns A no-op function for consistency with group methods
   */
  static debug(
    prefix: string,
    message: string,
    enableLogging: boolean,
  ): () => void {
    return LogManager.log(prefix, message, enableLogging, { debug: true });
  }

  /**
   * Start a log group
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @returns A function to end the group
   */
  static group(
    prefix: string,
    message: string,
    enableLogging: boolean,
  ): () => void {
    return LogManager.log(prefix, message, enableLogging, { group: true });
  }

  /**
   * Log with a timestamp prefix
   * @param prefix The prefix to add to the log message
   * @param message The message to log
   * @param enableLogging Whether logging is enabled
   * @param options Additional options for logging
   * @returns A function to end the group if a group was started
   */
  static logWithTime(
    prefix: string,
    message: string,
    enableLogging: boolean,
    options?: {
      group?: boolean;
      warn?: boolean;
      error?: boolean;
      info?: boolean;
      debug?: boolean;
    },
  ): () => void {
    const timestamp = new Date().toISOString();
    return LogManager.log(
      `${prefix} [${timestamp}]`,
      message,
      enableLogging,
      options,
    );
  }

  /**
   * Log an object as JSON
   * @param prefix The prefix to add to the log message
   * @param obj The object to log as JSON
   * @param enableLogging Whether logging is enabled
   * @param options Additional options for logging
   * @returns A function to end the group if a group was started
   */
  static logObject(
    prefix: string,
    obj: unknown,
    enableLogging: boolean,
    options?: {
      group?: boolean;
      warn?: boolean;
      error?: boolean;
      info?: boolean;
      debug?: boolean;
    },
  ): () => void {
    if (!enableLogging) return () => {}; // No-op end function

    try {
      const jsonString = JSON.stringify(obj, null, 2);
      return LogManager.log(prefix, jsonString, enableLogging, options);
    } catch (e) {
      return LogManager.error(
        prefix,
        `Failed to stringify object: ${e}`,
        enableLogging,
      );
    }
  }

  /**
   * Measure execution time of a function
   * @param prefix The prefix to add to the log message
   * @param fn The function to measure
   * @param enableLogging Whether logging is enabled
   * @returns The result of the function
   */
  static measure<T>(prefix: string, fn: () => T, enableLogging: boolean): T {
    if (!enableLogging) return fn();

    const start = performance.now();
    const result = fn();
    const end = performance.now();

    LogManager.info(prefix, `Execution time: ${end - start}ms`, enableLogging);
    return result;
  }

  /**
   * Async version of measure
   * @param prefix The prefix to add to the log message
   * @param fn The async function to measure
   * @param enableLogging Whether logging is enabled
   * @returns A promise resolving to the result of the function
   */
  static async measureAsync<T>(
    prefix: string,
    fn: () => Promise<T>,
    enableLogging: boolean,
  ): Promise<T> {
    if (!enableLogging) return fn();

    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    LogManager.info(prefix, `Execution time: ${end - start}ms`, enableLogging);
    return result;
  }
}
