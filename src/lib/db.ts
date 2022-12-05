import { createClient } from '@dariusbakunas/eve-db';

import config from '../config';

export const dbClient = createClient(`postgres://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}/${config.get('db.name')}`);