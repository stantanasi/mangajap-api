import { NextFunction, Request, Response } from "express";
import { IUser } from "../../models/user.model";
import { JsonApiError } from "../mongoose-jsonapi/mongoose-jsonapi";

export const isLogin = () => (req: Request, res: Response, next: NextFunction) => {
  const user: IUser = res.locals.user;

  if (!user) {
    throw new JsonApiError.PermissionDenied();
  }

  next();
}

export const isAdmin = () => (req: Request, res: Response, next: NextFunction) => {
  const user: IUser = res.locals.user;
  
  if (!user?.isAdmin) {
    throw new JsonApiError.PermissionDenied();
  }

  next();
}