import express, { Request, Response, NextFunction } from 'express';
import { Query } from 'express-serve-static-core';
import debugRaw from 'debug';
import { jsonValidator } from '../reusable-mws/rest-utils';
import { BaseError, InternalServerError } from '../reusable-mws/errors/index';

const debug = debugRaw('app');

const router = express.Router();
export default router;

const schema = `${__dirname}/../../schemas/request.json`;
const schemaCommon = `${__dirname}/../../schemas/common.json`;

interface GetBySSNRequest extends Request {
  params: {
    ssn: string;
  },
  query: Query & {
    lang?: 'FI' | 'EN'
  };
}

function reOrgInput(req: GetBySSNRequest) {
  return { ssn: req.params.ssn, lang: req.query.lang };
}

router.get('/:ssn',
  jsonValidator<GetBySSNRequest>(schema, [schemaCommon], reOrgInput),
  async (req: GetBySSNRequest, res: Response, next: NextFunction) => {
    const { ssn } = req.params;
    const { lang } = req.query;
    try {
      if (debug.enabled) {
        debug(`Request: ssn=${ssn.replace(/^([0-9]{6}[-+A]).{4}$/gi, '$1****')}, lang=${lang}`);
      }
      const response = { lang: lang ?? 'FI', ssn };
      res.status(200).json(response);
    } catch (error: any) {
      if (error instanceof BaseError) next(error);
      else { 
        next(new InternalServerError('Service invocation failed', { cause: error })); 
      }
    }
});
