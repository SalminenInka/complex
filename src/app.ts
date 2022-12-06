import { readFileSync } from 'fs';
import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { expressjwt } from 'express-jwt';
import router from './routes/main';
import { simpleHealthCheck } from './reusable-mws/docker-utils';
import { errorHandler } from './reusable-mws/rest-utils';

const app = express();
export default app;

const publicKey = readFileSync(process.env.PUBLIC_KEY_PATH!, 'utf-8');
// read version info for status check middleware
const version = readFileSync(`${__dirname}/../version-info`, 'utf8').trim();

// healthcheck middleware
app.get('/status', simpleHealthCheck(version));

app.use(morgan((tokens, req, res) => [
  process.env.INTEGRATION_ID ?? '',
  tokens.method(req, res),
  tokens.status(req, res),
  req.headers['lt-correlationtoken'],
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
].join(' ')));

const { DISABLE_SECURITY: disableSecurity } = process.env;
if (disableSecurity === undefined || disableSecurity === 'false') {
  app.use(expressjwt({ secret: publicKey, algorithms: ['RS256'] }));
}

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use('/changeme', router);
app.use(errorHandler);
