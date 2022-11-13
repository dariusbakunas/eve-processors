import { Queue, Worker } from "bullmq";

import { mainWorker } from './workers/main';

const queue = new Queue('testQueue', {
  connection: {
    host: 'dev.local.geekspace.us'
  }
});

const index = async () => {
  await queue.add('testQueue', {}, {
    repeat: {
      pattern: '* * * * *',
    },
  });
};

// main worker
new Worker('testQueue', mainWorker, {
  connection: {
    host: 'dev.local.geekspace.us'
  },
  autorun: true,
});

index().catch(console.error);