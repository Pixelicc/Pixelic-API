import { DiscordSnowflake } from "../discord.js";
import { APIAuthRole, APIAuthScope } from "./auth.ts";

export interface APIKeyRedis {
  timestamp: number;
  owner: DiscordSnowflake;
  role: APIAuthRole | string;
  scopes: APIAuthScope[] | string;
  [key: string]: string;
}

export interface APIKeyMongo {
  /**
   * Discord Snowflake
   * @example "619208257721860108"
   */
  owner: DiscordSnowflake;
  requestHistory: {
    /**
     * ULID (Universally Unique Lexicographically Sortable Identifier)
     * @example "01HD70XG82SJ5MK8QSSECDP8KD"
     */
    ID: string;
    URL: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    userAgent: string;
    IP: string;
  }[];
}
