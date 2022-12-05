import axios  from 'axios';
import type { Job } from "bullmq";
import dayjs from 'dayjs';
import qs from 'qs';

import config from '../config';
import { decrypt, encrypt } from '../lib/crypt';
import { dbClient } from '../lib/db';
import { CharacterPayload, walletTransactionsQueue } from '../queues';

type TokenResponse = {
  readonly access_token: string
  readonly expires_in: number
  readonly refresh_token: string
};

export const processCharacter = async function (job: Job<CharacterPayload>) {
  const { character } = job.data;
  await job.log(`Processing character: ${character.name}`);

  try {
    // eslint-disable-next-line functional/no-let
    let accessToken = decrypt(character.accessToken)

    if (dayjs().unix() > character.tokenExpiresAt) {
      // refresh token
      const refreshToken = decrypt(character.refreshToken)

      await job.log(`Updating tokens for Character ID: ${character.id}`);

      const clientID = config.get('eve.clientID');
      const clientSecret = config.get('eve.clientSecret');

      const auth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

      const res = await axios.post<TokenResponse>(`${config.get("eve.loginURL")}/v2/oauth/token`, qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`
        }
      });

      accessToken = res.data.access_token;

      await dbClient.character.update({
        where: {
          id: character.id,
        },
        data: {
          accessToken: encrypt(accessToken),
          tokenExpiresAt: res.data.expires_in
        }
      })
    }

    const scopes = character.scopes.split(" ");

    // eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let i = 0; i < scopes.length; i++) {
      const currentScope = scopes[i];

      switch (currentScope) {
        case "esi-wallet.read_character_wallet.v1":
          await walletTransactionsQueue.add(character.name, {
            name: character.name,
            characterID: character.id,
            esiID: character.esiId,
            accessToken,
          })
          break;
        default:
          await job.log(`Unknown character scope: ${currentScope}`);
      }
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response){
        await job.log(`Status ${e.response.status}: ${JSON.stringify(e.response.data)}`)
      } else if (e.request) {
        await job.log(e.request);
      } else {
        await job.log(e.message);
      }
    } else {
      await job.log((e as Error).message);
    }
  }
}