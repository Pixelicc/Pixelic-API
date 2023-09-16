import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { ulid } from "ulidx";

/**
 * Adds a unique ID (ULID) to every request processed via the "X-Request-ID" header
 */
export const requestID = (req: Request, res: Response, next: NextFunction) => {
  const ULID = ulid();
  Sentry.setTag("Request-ID", ULID);
  res.set("X-Request-ID", ULID);
  next();
};
