import { BaseError, Severity } from './base-error';

/**
 * ServiceError is meant to be thrown from the services which may not be HTTP related. 
 * Typically components which do not manipulate request/response objects are good candidates
 * to throw ServiceError or subclass of it.
 */
export class ServiceError extends BaseError {
  /**
   * Constructs new ServiceError
   *
   * @param message - message of the error
   * @param namedParams various named parameters
   * @param name name of the error
   */

  constructor(message: string, { cause, severity, contextData }: {
    /** actual cause of error */
    cause?: Error;
    /** severity of the error */
    severity: Severity;
    /** other context related data */
    contextData?: any;
  }, name?: string) {
    super(name ?? 'ServiceError', message, { cause, severity, contextData });
  }
}
