import { Request, Response, NextFunction } from "express";
import redis from "@pixelic/redis";

/**
 * Tracks data like requests processed
 */
export const requestAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await redis.incr("API:Analytics:Requests");
    await redis.hincrby("API:Analytics:RequestsHistory", new Date().toISOString().slice(0, 10), 1);
    /**
     * Add further Analytics if you want to track more precise data like User-Agents
     */
  } catch {}
  next();
};
