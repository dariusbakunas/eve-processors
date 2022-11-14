import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Worker } from "bullmq";
import express from 'express';
import IORedis from 'ioredis';

import config from './config';
import { characterQueue, mainQueue } from './queues';
import { processCharacter } from './workers/character';
import { processAllCharacters } from './workers/main';

// const signals = {
//   'SIGHUP': 1,
//   'SIGINT': 2,
//   'SIGTERM': 15
// };

const connection = new IORedis({
  host: config.get("redis.host"),
});

const index = async () => {
  await mainQueue.add('main', {}, {
    repeat: {
      pattern: '* * * * *',
    },
  });
};

// main worker
new Worker('main', processAllCharacters, {
  connection,
  autorun: true,
});

new Worker('character', processCharacter, {
  connection,
  autorun: true,
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(mainQueue), new BullAdapter(characterQueue)],
  serverAdapter: serverAdapter,
});

const app = express();

app.use('/admin/queues', serverAdapter.getRouter());

index().catch(console.error);

app.listen(9000, () => {
  console.log('Running on 9000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6379 by default');
});

// const shutdown = async (value) => {
//   console.log("shutting down");
//
//   await mainWorker.close();
//   await characterWorker.close();
//   process.exit(128 + value);
// };
//
// Object.keys(signals).forEach((signal) => {
//   process.on(signal, () => {
//     console.log(`process received a ${signal} signal`);
//     void shutdown(signals[signal]);
//   });
// });
