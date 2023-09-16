import { Redis } from "ioredis";
import { config } from "@pixelic/utils";

export default new Redis(config.database.redis);
