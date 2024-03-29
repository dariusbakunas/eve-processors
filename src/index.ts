import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express from 'express';

import { createWorkers } from './createWorkers';
import { characterQueue, mainQueue, QUEUES, walletTransactionsQueue } from './queues';
import { processCharacter } from './workers/character';
import { processAllCharacters } from './workers/main';
import { processWalletTransactions } from './workers/walletTransactions';

// const signals = {
//   'SIGHUP': 1,
//   'SIGINT': 2,
//   'SIGTERM': 15
// };

const index = async () => {
  await mainQueue.drain(true);
  await characterQueue.drain(true);
  await walletTransactionsQueue.drain(true);

  await mainQueue.add('main', {}, {
    repeat: {
      pattern: '*/5 * * * *',
    },
  });
};

createWorkers([
  { queueName: QUEUES.MAIN, processor: processAllCharacters },
  { queueName: QUEUES.CHARACTER, processor: processCharacter },
  { queueName: QUEUES.WALLET_TRANSACTIONS, processor: processWalletTransactions },
]);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(mainQueue),
    new BullAdapter(characterQueue),
    new BullAdapter(walletTransactionsQueue)
  ],
  serverAdapter: serverAdapter,
});

const app = express();

app.use('/admin/queues', serverAdapter.getRouter());

index().catch(console.error);

app.listen(9000, () => {
  console.log('Running on 9000...');
  console.log('For the UI, open http://localhost:9000/admin/queues');
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
