import type { Job } from 'bullmq';

import type { WalletTransactionsPayload } from '../queues';

export const processWalletTransactions = async function(job: Job<WalletTransactionsPayload>) {
  await job.log(`Processing wallet transactions for character: ${job.data.name}`);
}