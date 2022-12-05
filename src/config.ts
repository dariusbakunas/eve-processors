import * as fs from 'fs';
import path from 'path';

import convict from 'convict';

convict.addFormats({
  'required-string': {
    validate: (val: unknown): void => {
      if (typeof val !== 'string') {
        throw new Error('Value must be a string');
      }

      if (val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: (val: unknown): string | undefined => {
      if (typeof val !== 'string') {
        throw new Error('Value must be a string');
      }

      return val
    }
  },
  'secret-string': {
    validate: (val: unknown): void => {
      if (typeof val !== 'string') {
        throw new Error('Value must be a string');
      }

      if (val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: (val: unknown): string | undefined => {
      if (typeof val !== 'string') {
        throw new Error('Value must be a string');
      }

      if (val !== path.basename(val)) {
        try {
          const file = fs.readFileSync(val);
          return file.toString();
        } catch (error) {
          throw new Error(`Could not load secret from path: ${val}`);
        }
      }

      return val;
    }
  }
});

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  redis: {
    host: {
      doc: 'Redis host name/IP',
      format: 'required-string',
      default: ''
    },
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: 'required-string',
      default: ''
    },
    name: {
      doc: 'Database name',
      format: 'required-string',
      default: ''
    },
    user: {
      doc: 'Database user',
      format: 'required-string',
      default: ''
    },
    password: {
      doc: 'Database password',
      format: 'secret-string',
      default: '',
      env: 'DB_PASSWORD'
    }
  },
  eve: {
    esiURL: {
      doc: 'EVE ESI URL',
      format: String,
      default: 'https://esi.evetech.net/latest'
    },
    loginURL: {
      doc: 'EVE login URL',
      format: String,
      default: 'https://login.eveonline.com'
    },
    clientID: {
      doc: 'EVE client ID',
      format: 'required-string',
      default: ''
    },
    cryptSecret: {
      doc: 'Secret used to encrypt/decrypt EVE esi tokens',
      format: 'secret-string',
      default: '',
      env: 'CRYPT_SECRET'
    },
    clientSecret: {
      doc: 'EVE client secret',
      format: 'secret-string',
      default: '',
      env: 'EVE_CLIENT_SECRET'
    }
  },
});

const env = config.get('env');
config.loadFile('./config/' + env + '.json');
config.validate({ allowed: 'strict' });

export default config;