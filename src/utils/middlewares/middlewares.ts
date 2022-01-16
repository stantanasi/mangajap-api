import { NextFunction, Request, Response } from "express";
import { IUser } from "../../models/user.model";
import { PermissionDenied } from "../json-api/json-api.error";

export const isLogin = () => (req: Request, res: Response, next: NextFunction) => {
  const user: IUser = res.locals.user;

  if (!user) {
    throw new PermissionDenied();
  }

  next();
}

export const isAdmin = () => (req: Request, res: Response, next: NextFunction) => {
  const user: IUser = res.locals.user;
  
  if (!user?.isAdmin) {
    throw new PermissionDenied();
  }

  next();
}