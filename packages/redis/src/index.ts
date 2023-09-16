import { Redis } from "ioredis";
import { config } from "@packages/utils";

export default new Redis(config.database.redis);
