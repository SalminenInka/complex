import { Severity } from './base-error';
import { ServiceError } from './service-error';

/**
 * SoapFaultError is meant to be thrown when the SOAP fault is received.
 */
export class SoapFaultError extends ServiceError {
  private fault: any;

  constructor(message: string, fault: any, { cause, severity = 'Low', contextData }: {
    /** actual cause of error */
    cause?: Error;
    /** severity of the error */
    severity?: Severity;
    /** other context related data */
    contextData?: any;
  }) {
    super(message, { cause, severity, contextData }, 'SoapFaultError');
    this.fault = fault;
  }

  get detail() {
    return this.fault?.Fault.detail;
  }
}