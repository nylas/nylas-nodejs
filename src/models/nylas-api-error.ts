/**
 * Extended Error class for errors returned from the Nylas API
 *
 * Properties:
 * name - The description of the HTTP status code
 * message - The error message returned from the Nylas API payload
 * statusCode - The status code returned from the API call
 * type - The type of error returned from the Nylas API payload
 * stack - The Error stacktrace
 * missingFields (optional) - The fields that were missing in the call returned from the Nylas API payload
 * serverError (optional) - The error returned by the provider returned from the Nylas API payload
 */
export default class NylasApiError extends Error {
  statusCode: number;
  type: string;
  missingFields?: string[];
  serverError?: string;

  /**
   * Mapping of HTTP status codes to error descriptions
   *
   * For more details on what each status code means head to
   * https://developer.nylas.com/docs/developer-tools/api/errors/
   */
  errorMapping: { [statusCode: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Request Failed or Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    410: 'Gone',
    418: "I'm a Teapot",
    422: 'Sending Error',
    429: 'Too Many Requests',
    500: 'Server Error',
    502: 'Server Error',
    503: 'Server Error',
    504: 'Server Error',
  };

  constructor(statusCode: number, type: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.errorMapping[statusCode];
    this.type = type;
  }
}
