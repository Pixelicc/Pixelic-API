import { DiscordSnowflake } from "../discord.js";
import { ISOString } from "../other.js";
import { APIAuthRole, APIAuthScope } from "./auth.ts";

export interface APIUser {
  timestamp: number;
  /**
   * Contains all the data about the Users connected Discord Account
   */
  discord:
    | {
        ID: DiscordSnowflake;
        [key: string]: string;
      }
    | string;
  role: APIAuthRole | string;
  scopes: APIAuthScope[] | string;
  /**
   * SHA-512 Hash of the Users actual API-Key
   *
   * The originally shown API-Key **cannot** be retrieved from the API-Keys's Hash
   */
  keyHash: string;
  linkedAccounts:
    | {
        timestamp: number;
        type: string;
        [key: string]: string;
      }[]
    | string;
  [key: string]: string;
}

export type APIUserUsage = {
  [key: ISOString["YYYY_MM_DD"]]: string;
};
