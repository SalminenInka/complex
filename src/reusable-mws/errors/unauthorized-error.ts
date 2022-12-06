import { BaseError, Severity } from './base-error';

/**
 * UnauthorizedError equates to a HTTP 401 (Unauthorized) or 403 (Forbidden) response status. 
 * It is used to signal that a request was rejected because authorization is required and 
 * has failed or has not yet been provided. By default it maps to http status code 403.
 */
export class UnauthorizedError extends BaseError {
  /**
   * Constructs new UnauthorizedError
   *
   * @param message - message of the error
   * @param namedParams various named parameters
   */
  constructor(message: string, {
    cause, 
    statusCode = 403, 
    severity = 'Medium', 
    contextData,
  }:
  {
    /** actual cause of error */
    cause?: Error;
    /** statusCode to return, defaults to 403 */
    statusCode?: number;
    /** severity of the error, defaults to Medium */
    severity?: Severity;
    /** other context related data */
    contextData?: any;
  } = { }) {
    super('UnauthorizedError', message, {
      cause, severity, statusCode, contextData,
    });
  }
}
