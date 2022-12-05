import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';

import config from './config';
import { logger } from './logger';
import type { QUEUES } from './queues';

const connection = new IORedis({
  host: config.get("redis.host"),
});

const onCompleted = (job: Job) => {
  logger.info(`${job.queueName} worker ${job.id} completed`);
}

const onFailed = (job: Job, err: Error) => {
  logger.error(`${job.queueName} worker ${job.id} has failed with ${err.message}`);
}

// eslint-disable-next-line functional/no-mixed-type
export type WorkerConfig = {
  readonly queueName: QUEUES,
  readonly processor: (job: Job) => Promise<void>
}

export const createWorkers = (configs: readonly WorkerConfig[]) => {
  configs.forEach((cfg) => {
    const worker = new Worker(cfg.queueName, cfg.processor, {
      connection,
      autorun: true,
    });

    worker.on('completed', onCompleted)
    worker.on('failed', onFailed);
  })
}