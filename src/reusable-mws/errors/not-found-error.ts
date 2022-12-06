import { BaseError, Severity } from './base-error';

/**
 * NotFoundError is meant to be thrown when the service wants to indicate it
 * cannot find the requested resource. By default it maps to http status code 404.
 */
export class NotFoundError extends BaseError {
  /**
   * Constructs new NotFoundError.
   *
   * Property statusCode is hard-coded to 404.
   *
   * @param message - message of the error
   * @param namedParams various named parameters
   */
  constructor(message: string, { cause, severity = 'Medium', statusCode = 404, contextData }: {
    /** actual cause of error */
    cause?: Error;
    /** statusCode to return, defaults to 404 */
    statusCode?: number;
    /** severity of the error, defaults to Medium */
    severity?: Severity;
    /** other context related data */
    contextData?: any;
  } = { }) {
    super('NotFoundError', message, {
      cause, severity, statusCode, contextData,
    });
  }
}
