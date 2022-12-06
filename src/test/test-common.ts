import { readFileSync } from 'fs';
import { sign, SignOptions } from 'jsonwebtoken';

const cwd = process.cwd().replace(/\\/g, '/');
const privateKey = readFileSync(`${cwd}/test/keys/common-private-key.pem`, 'utf-8');

export const makeRelativeURL = (uri: string) => new URL(uri, `file://${cwd}/test`);

export const createBearerToken = (claims: object, { expiresIn = '5m', header = {} }: {
  expiresIn?: string;
  header?: object;
} = {}) => {
  const joseHeaders = {
    kid: 'microservices-common',
    alg: 'RS256',
    ...header,
  };
  const options: SignOptions = { algorithm: 'RS256', expiresIn, header: joseHeaders };
  return sign(claims, privateKey, options);
};

export const readFileRelative = (relativePath: string, encoding: string) => {
  if (encoding) {
    // @ts-ignore
    return readFileSync(makeRelativeURL(relativePath), encoding);
  }
  return readFileSync(makeRelativeURL(relativePath));
};
