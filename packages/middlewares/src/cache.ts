import { Request, Response, NextFunction } from "express";

/**
 * Sets the default Cache-Control Headers for all requests
 *
 * @param cacheControl String that gets passed into the `Cache-Control` Header
 */
export const defaultCacheHeaders = (headers: { "Cache-Control"?: string; Expires?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (headers["Cache-Control"]) res.set("Cache-Control", headers["Cache-Control"]);
    if (headers.Expires) res.set("Cache-Control", headers.Expires);
    return next();
  };
};
