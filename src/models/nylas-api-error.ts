/**
 * Class for errors returned from the Nylas API
 *
 * @property {number} name - The description of the HTTP status code
 * @property {string} message - The error message returned from the Nylas API payload
 * @property {number} statusCode - The status code returned from the API call
 * @property {string} type - The type of error returned from the Nylas API payload
 * @property {string[]?} missingFields The fields that were missing in the call returned from the Nylas API payload
 * @property {string?} serverError The error returned by the provider returned from the Nylas API payload
 * @class
 * @extends Error
 */
export default class NylasApiError extends Error {
  statusCode: number;
  type: string;
  missingFields?: string[];
  serverError?: string;

  // /**
  //  * Mapping of HTTP status codes to error descriptions
  //  * @see https://developer.nylas.com/docs/developer-tools/api/errors/
  //  * @type {Object<number, string>}
  //  */
  /**
   * Nesting example.
   *
   * @param {object} errorMapping
   * @param {number} param.statusCode - First value
   * @return {string} status code
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

  /**
   * Create a Nylas error
   * @constructor
   * @param {number} statusCode - The status code returned from the API call
   * @param {string} type - The type of error returned from the Nylas API payload
   * @param {string} message - The error message returned from the Nylas API payload
   */
  constructor(statusCode: number, type: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.errorMapping[statusCode];
    this.type = type;
  }
}
