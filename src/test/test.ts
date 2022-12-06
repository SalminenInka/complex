/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
import { readFileSync } from 'fs';
// eslint-disable-next-line no-unused-vars
import nock from 'nock';
import request from 'supertest';
import Ajv, { ValidateFunction } from 'ajv';
import { v4 as uuidv4 } from 'uuid';
import app from '../app';
import { Response } from 'express';
// eslint-disable-next-line no-unused-vars
import { readFileRelative, createBearerToken } from './test-common';

const cwd = process.cwd().replace(/\\/g, '/');

const correlationToken = {
  originator: 'integrationTest',
  correlationId: uuidv4(),
};

const ajv = new Ajv();
const validators = ['common', 'response']
  .map((name) => {
    const path = `${cwd}/schemas/${name}.json`;
    const schema = JSON.parse(readFileSync(path, 'utf8'));
    const validator = ajv.compile(schema);
    return { name, validator };
  })
  .reduce((accum, current) => accum.set(current.name, current.validator), 
    new Map<string, ValidateFunction<unknown>>());

interface TypedResponseBody<T = any> extends Express.Response {
  body: T
}

function validate(response: TypedResponseBody, schemaName: string, verbose?: boolean) {
  const validator = validators.get(schemaName);
  if (!validator) throw new Error(`Cannot get schema ${schemaName}`);
  const valid = validator(response.body);
  if (!valid) {
    if (verbose) {
      /* eslint-disable-next-line no-console */
      console.log(JSON.stringify(response.body));
    }
    throw new Error(JSON.stringify(validator.errors));
  }
  return valid;
}

describe('Unit tests for integration service paciapp', () => {
  it('should return 200 since everything is just fine', async() => {
    const claims = {
      iss: 'https://sts.lahitapiola.fi/playground',
      sub: 'salmipa',
      aud: 'changeme-1',
      groups: ['changeme-1']
    };
    const ssn = '210371-162H';
    await request(app)
      .get(`/changeme/${ssn}?lang=FI`)
      .set({ Authorization: `Bearer ${createBearerToken(claims)}` })
      .set('lt-correlationtoken', JSON.stringify(correlationToken))
      .expect(200)
      .expect((response: TypedResponseBody) => validate(response, 'response'));
  });

  it('should return 400 if correlation token is missing', async() => {
    const claims = {
      iss: 'https://sts.lahitapiola.fi/playground',
      sub: 'salmipa',
      aud: 'changeme-1',
      groups: ['changeme-1']
    };
    const ssn = '210371-162H';
    await request(app)
      .get(`/changeme/${ssn}?lang=FI`)
      .set({ Authorization: `Bearer ${createBearerToken(claims)}` })
      .expect(400);
  });

  it('should return 400 if lang is incorrect', async() => {
    const claims = {
      iss: 'https://sts.lahitapiola.fi/playground',
      sub: 'salmipa',
      aud: 'changeme-1',
      groups: ['changeme-1']
    };
    const ssn = '210371-162H';
    await request(app)
      .get(`/changeme/${ssn}?lang=NONSENSE`)
      .set('lt-correlationtoken', JSON.stringify(correlationToken))
      .set({ Authorization: `Bearer ${createBearerToken(claims)}` })
      .expect(400);
  });

  it('should return 400 if ssn doesn not match the pattern', async() => {
    const claims = {
      iss: 'https://sts.lahitapiola.fi/playground',
      sub: 'salmipa',
      aud: 'changeme-1',
      groups: ['changeme-1']
    };
    const ssn = '210371-162';
    await request(app)
      .get(`/changeme/${ssn}?lang=NONSENSE`)
      .set('lt-correlationtoken', JSON.stringify(correlationToken))
      .set({ Authorization: `Bearer ${createBearerToken(claims)}` })
      .expect(400);
  });

  it('should return 404 if SSN in path is incorrect', async() => {
    const claims = {
      iss: 'https://sts.lahitapiola.fi/playground',
      sub: 'salmipa',
      upn: 'salminenps',
      aud: 'changeme-2'
    };
    const ssn = '210371-162';
    await request(app)
      .get(`/changeme2/${ssn}?lang=FI`)
      .set('lt-correlationtoken', JSON.stringify(correlationToken))
      .set({ Authorization: `Bearer ${createBearerToken(claims)}` })
      .expect(404);
  });
});
