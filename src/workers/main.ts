import { createClient } from '@dariusbakunas/eve-db';
import type { Job } from "bullmq";

import config from '../config';

const dbClient = createClient(`postgres://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}/${config.get('db.name')}`);

export const mainWorker = async function (job: Job) {
  await job.log("Getting list of characters");
  const characters = await dbClient.character.findMany();
  console.log(characters);
  console.log("Doing something useful...", job.id, job.data);
}