import { BaseError, Severity } from './base-error';

/**
 * InternalServerError equates to a HTTP 500 (Internal Server Error) response status. 
 * It is used to signal that a request ended abnormally. By default it maps to http status code 500.
 */
export class InternalServerError extends BaseError {
  /**
  * Constructs new InternalServerError
  *
  * @param message - message of the error
  * @param namedParams various named parameters
  */
  constructor(message: string, { cause, severity = 'High', statusCode = 500, contextData }: {
  /** actual cause of error */
  cause?: Error;
  /** statusCode to return, defaults to 500 */
  statusCode?: number;
  /** severity of the error */
  severity?: Severity;
  /** other context related data */
  contextData?: any;
  } = { }) {
    super('InternalServerError', message, {
      cause, severity, statusCode, contextData,
    });
  }
}
