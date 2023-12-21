import { NextFunction, Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { JsonApiError } from "../mongoose-jsonapi/mongoose-jsonapi";

export const isLogin = () => (req: Request, res: Response, next: NextFunction) => {
  const token: DecodedIdToken | null = res.locals.token;

  if (!token) {
    throw new JsonApiError.PermissionDenied();
  }

  next();
}

export const isAdmin = () => (req: Request, res: Response, next: NextFunction) => {
  const token: DecodedIdToken | null = res.locals.token;

  if (!token || !token.isAdmin) {
    throw new JsonApiError.PermissionDenied();
  }

  next();
}