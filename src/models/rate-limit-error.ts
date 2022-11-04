import NylasApiError from './nylas-api-error';
import { Headers } from 'node-fetch';

export default class RateLimitError extends NylasApiError {
  static RATE_LIMIT_STATUS_CODE = 429;
  static RATE_LIMIT_LIMIT_HEADER = 'X-RateLimit-Limit';
  static RATE_LIMIT_RESET_HEADER = 'X-RateLimit-Reset';

  rateLimit?: number;
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

  static parseErrorResponse(
    parsedApiError: Record<string, string>,
    headers: Headers
  ): RateLimitError {
    const rateLimitString = headers.get(this.RATE_LIMIT_LIMIT_HEADER);
    const rateLimitResetString = headers.get(this.RATE_LIMIT_RESET_HEADER);

    const rateLimit = !isNaN(Number(rateLimitString))
      ? Number(rateLimitString)
      : undefined;
    const rateLimitReset = !isNaN(Number(rateLimitResetString))
      ? Number(rateLimitResetString)
      : undefined;
    return new RateLimitError(
      parsedApiError.type,
      parsedApiError.message,
      rateLimit,
      rateLimitReset
    );
  }
}
