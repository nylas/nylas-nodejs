import NylasApiError from './nylas-api-error';
import { Headers } from 'node-fetch';

/**
 * This error class represents a 429 error response, with details on the rate limit
 */

export default class RateLimitError extends NylasApiError {
  static RATE_LIMIT_STATUS_CODE = 429;
  static RATE_LIMIT_LIMIT_HEADER = 'X-RateLimit-Limit';
  static RATE_LIMIT_RESET_HEADER = 'X-RateLimit-Reset';

  /**
   * The rate limit
   */
  rateLimit?: number;

  /**
   * The rate limit expiration time, in seconds
   */
  rateLimitReset?: number;

  constructor(
    type: string,
    message: string,
    rateLimit?: number,
    rateLimitReset?: number
  ) {
    super(RateLimitError.RATE_LIMIT_STATUS_CODE, type, message);
    this.rateLimit = rateLimit;
    this.rateLimitReset = rateLimitReset;
  }

  /**
   * Parses an API response and generates a 429 error with details filled in
   * @param parsedApiError The response parsed as a JSON
   * @param headers The response headers
   * @return The error with the rate limit details filled in
   */
  static parseErrorResponse(
    parsedApiError: Record<string, string>,
    headers: Headers
  ): RateLimitError {
    const rateLimit =
      Number(headers.get(this.RATE_LIMIT_LIMIT_HEADER)) || undefined;
    const rateLimitReset =
      Number(headers.get(this.RATE_LIMIT_RESET_HEADER)) || undefined;

    return new RateLimitError(
      parsedApiError.type,
      parsedApiError.message,
      rateLimit,
      rateLimitReset
    );
  }
}
