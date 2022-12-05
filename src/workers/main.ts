import type { Job } from "bullmq";

import { dbClient } from '../lib/db';
import { characterQueue } from '../queues';


export const processAllCharacters = async function (job: Job) {
  await job.log("Getting list of characters");
  const characters = await dbClient.character.findMany();

  characters.forEach((character) => {
    characterQueue.add(character.name, { character })
  })
}