import { Request, Response, NextFunction } from "express";

export const JSONHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error) {
    if (error instanceof SyntaxError) {
      return res.status(422).send({ success: false, cause: "Invalid JSON" });
    }
  }
  return next();
};
