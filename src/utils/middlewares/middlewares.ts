import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { PermissionDenied } from "../json-api/json-api.error";

export const isAdmin = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    if (!bearerToken) {
      throw new PermissionDenied();
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    if (!user?.isAdmin) {
      throw new PermissionDenied();
    }

    next();
  } catch (err) {
    next(err);
  }
}