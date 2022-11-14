import { createClient } from '@dariusbakunas/eve-db';
import type { Job } from "bullmq";

import config from '../config';
import { characterQueue } from '../queues';

const dbClient = createClient(`postgres://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}/${config.get('db.name')}`);

export const processAllCharacters = async function (job: Job) {
  await job.log("Getting list of characters");
  const characters = await dbClient.character.findMany();

  characters.forEach((character) => {
    characterQueue.add(character.name, character)
  })
}