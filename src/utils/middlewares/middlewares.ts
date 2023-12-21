import { NextFunction, Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { IUser } from "../../models/user.model";
import { JsonApiError } from "../mongoose-jsonapi/mongoose-jsonapi";

export const isLogin = () => (req: Request, res: Response, next: NextFunction) => {
  const user: IUser | null = res.locals.user;

  if (!user) {
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