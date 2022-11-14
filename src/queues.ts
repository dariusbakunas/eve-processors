import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import config from './config';

const connection = new IORedis({
  host: config.get("redis.host"),
});

export const mainQueue = new Queue('main', { connection });

export const characterQueue = new Queue('character', { connection });