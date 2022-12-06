import { readFileSync } from 'fs';
import { default as Ajv } from 'ajv';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import debugRaw from 'debug';
import addFormats from 'ajv-formats';
import { BadRequestError } from './errors';
import { strict as assert } from 'assert';

const debug = debugRaw('rest-utils');

function parseSchema(schema: string | Buffer): object {
  let schemaObject;
  if (typeof schema === 'string') {
    schemaObject = JSON.parse(readFileSync(schema, 'utf8'));
  } else if (Buffer.isBuffer(schema)) {
    schemaObject = JSON.parse((schema as Buffer).toString('utf-8'));
  } else {
    assert(false, 'Schema must be either string or Buffer');
  }

  return schemaObject;
}

export type Supplier<T extends Request = Request> = (req: T) => object;

export function jsonValidator<T extends Request = Request>(schema: string | Buffer, supplier?: Supplier<T>): RequestHandler;
export function jsonValidator<T extends Request = Request>(schema: string | Buffer, dependencies: (string | Buffer)[], supplier?: Supplier<T>): RequestHandler;

export function jsonValidator<T extends Request = Request>(schema: string | Buffer, dependenciesOrSupplier?: (string | Buffer)[] | Supplier<T>, supplier?: Supplier<T>): RequestHandler {
  if (!supplier)
    return jsonValidatorInternal<T>(schema, undefined, dependenciesOrSupplier as Supplier);
  else
    return jsonValidatorInternal<T>(schema, dependenciesOrSupplier as (string | Buffer)[], supplier);
}

const ajv = new Ajv();
addFormats(ajv);

function jsonValidatorInternal<T extends Request>(schema: string | Buffer, dependencies?: (string | Buffer)[], supplier?: Supplier<T>) : RequestHandler {
  const schemas = [parseSchema(schema)];
  if (dependencies) {
    dependencies
      .map((s) => parseSchema(s))
      .forEach((so) => schemas.push(so));
  }
  schemas.forEach((so) => {
    if (!(so as any).$id) {
      throw new Error('All JSON schemas must contain $id property');
    }
  });

  const [main, ...rest] = schemas;
  rest.forEach((so) => {
    if (!ajv.getSchema((so as any).$id)) {
      ajv.addSchema(so);
    }
  });
  let validator = ajv.getSchema((main as any).$id);
  if (!validator) {
    validator = ajv.compile(main);
  }
  return (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    const valid = validator(supplier ? supplier(req) : req.body);
    if (valid) {
      next();
    } else {
      // @ts-ignore
      const contextData = { errors: validator.errors };
      next(new BadRequestError('JSON input is not valid according to schema', {
        // @ts-ignore
        errors: validator.errors,
        severity: 'Medium',
        contextData,
      }));
    }
  };
}

export function errorHandler(error: any, req: Request, res: Response, _next: NextFunction) {
  const {
    message, statusCode, status, contextData, severity,
  } = error;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(error.message, error);
  }
  let logger;
  switch (severity) {
    case 'Low':
      logger = console.log;
      break;
    case 'Medium':
      logger = console.log;
      break;
    case 'Critical':
      logger = console.error;
      break;
    case 'High':
      logger = console.error;
    default:
      throw new Error(`Illegal severity ${severity}`);
  }
  logger(message, error, contextData);
  res.status(statusCode ?? status ?? 500);
  if (error.toObjectLiteral && process.env.NODE_ENV !== 'production') {
    res.json({ message, cause: error.toObjectLiteral() });
  } else {
    res.json({ message, cause: error.name });
  }
};
