import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

/**
 * Adds the current instance's ID to every request processed via the "X-Server-ID" header
 */
export const serverID = (ID: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Sentry.setTag("Server-ID", ID);
    res.set("X-Server-ID", ID);
    next();
  };
};
