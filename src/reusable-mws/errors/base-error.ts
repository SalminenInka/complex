export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

/**
 * An abstract base class for all common errors.
 */
export abstract class BaseError extends Error {
  /** status code to return */
  private readonly statusCode: number | undefined;
  /** severity of the error */
  private readonly severity: Severity | undefined;
  /** actual cause of the error */
  private readonly cause: Error | undefined;
  /** other context related data */
  private readonly contextData: unknown | undefined;

  /**
   * 
   * @param name 
   * @param message 
   * @param options 
   */
  constructor(name: string, message: string, { cause, severity, statusCode, contextData }: {
    /** actual cause of error */
    cause?: Error;
    /** statusCode to return */
    statusCode?: number;
    /** severity of the error */
    severity?: Severity;
    /** other context related data */
    contextData?: unknown;
  }) {
    super(message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setPrototypeOf: (obj: any, prototype: any | null) => void = (Object as any).setPrototypeOf;
    if (setPrototypeOf) setPrototypeOf(this, new.target.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else (this as any).__proto__ = new.target.prototype;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Error as any).captureStackTrace(this);
    this.name = name;
    this.statusCode = statusCode;
    this.severity = severity;
    this.cause = cause;
    this.contextData = contextData;
  }

  public toObjectLiteral() {
    return this.objectifyError(this);
  }

  private objectifyError(error: Error) : unknown {
    const { message, stack, name } = error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { response, contextData } = error as any;
    const errorObject = { message, stack, name, contextData };
  
    if (response) {
      const {
        body, statusCode, url, statusMessage,
      } = response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (errorObject as any).http = {
        body, statusCode, url, statusMessage,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).cause) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (errorObject as any).cause = this.objectifyError((error as any).cause);
    }
  
    return errorObject;
  }  
}
