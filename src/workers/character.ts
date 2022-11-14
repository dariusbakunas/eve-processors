import type { Character } from '@dariusbakunas/eve-db';
import type { Job } from "bullmq";
import dayjs from 'dayjs';

export const processCharacter = async function (job: Job<Character>) {
  const character = job.data;
  await job.log(`Processing character: ${character.name}`);

  if (dayjs().unix() > character.tokenExpiresAt) {
    // refresh token

  }

  console.log(`processing character: ${job.data.name}`);
}