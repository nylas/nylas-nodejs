/**
 * Logging interface to redirect log messages to your application.
 */
export default interface LoggingInterface {
  /**
   * Log a warning message.
   * @param message The message to log.
   */
  warn(message: string): void;

  /**
   * Log an error message.
   * @param message The error message to log.
   */
  error(message: string): void;
}
