export class LogManager {
    static log(prefix: string, message: string, enableLogging: boolean, options?: { group?: boolean, warn?: boolean, error?: boolean }): () => void {
      if (!enableLogging) return () => {}; // No-op end function

      const fullMessage = `[${prefix}] ${message}`;

      if (options?.group) {
        console.group(fullMessage);
        return () => console.groupEnd();
      } else if (options?.warn) {
        console.warn(fullMessage);
      } else if (options?.error) {
        console.error(fullMessage);
      } else {
        console.log(fullMessage);
      }

      return () => {}; // No-op end function if no group was started
    }
  }
