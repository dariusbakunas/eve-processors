import type { Character } from '@dariusbakunas/eve-db';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import config from './config';

const connection = new IORedis({
  host: config.get("redis.host"),
});

export enum QUEUES {
  MAIN = "main",
  CHARACTER = "character",
  WALLET_TRANSACTIONS = "walletTransactions"
}

export type WalletTransactionsPayload = {
  readonly name: string
  readonly characterID: number
  readonly esiID: number
  readonly accessToken: string
}

export type CharacterPayload = {
  readonly character: Character
}

export const mainQueue = new Queue(QUEUES.MAIN, { connection });

export const characterQueue = new Queue<CharacterPayload>(QUEUES.CHARACTER, { connection });

export const walletTransactionsQueue = new Queue<WalletTransactionsPayload>(QUEUES.WALLET_TRANSACTIONS, { connection });