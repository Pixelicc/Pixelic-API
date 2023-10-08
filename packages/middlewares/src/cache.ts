import { Request, Response, NextFunction } from "express";

/**
 * Sets the default Cache-Control Headers to not cache any data
 */
export const defaultNoCacheHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  return next();
};
