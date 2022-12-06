import { BaseError, Severity } from './base-error';

/**
 * BadRequestError is meant to be thrown when the server cannot or will not process 
 * the request due to something that is perceived to be a client error 
 * (for example, missing or invalid request parameters). It maps to http status code 400.
 */
 export class BadRequestError extends BaseError {
  /**
   * Constructs new BadRequestError
   * 
   * @param message - message of the error 
   * @param namedParams various named parameters
   */
   constructor(message: string, { cause, severity = 'Medium', statusCode = 400, contextData }: {
    /** actual cause of error */
    cause?: Error;
    /** statusCode to return, defaults to 400 */
    statusCode?: number;
    /** severity of the error, defaults to Medium */
    severity?: Severity;
    /** other context related data */
    contextData?: any;
  } = { }) {
    super('BadRequestError', message, { cause, severity, statusCode, contextData });
  }
}
