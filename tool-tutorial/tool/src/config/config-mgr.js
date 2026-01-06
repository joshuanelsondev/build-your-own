import createLogger from '../logger.js';
import { cosmiconfigSync } from 'cosmiconfig';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

import schema from './schema.json' with { type: 'json' };

const logger = createLogger('config:mgr');

const ajv = new Ajv({ allErrors: true, strict: false });
const configLoader = cosmiconfigSync('tool');

export default function getConfig() {
  const result = configLoader.search(process.cwd());

  if (!result) {
    logger.warning('Could not find configuration, using default');
    return { port: 1234 };
  }

  const isValid = ajv.validate(schema, result.config);

  if (!isValid) {
    logger.warning('Invalid configuration was supplied');
    console.log();
    console.log(betterAjvErrors(schema, result.config, ajv.errors));
    process.exit(1);
  }

  logger.debug('Found configuration', result.config);
  return result.config;
}
