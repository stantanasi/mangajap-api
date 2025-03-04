import { JsonApiError } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import Follow from "../models/follow.model";
import { isLogin } from "../utils/middlewares/middlewares";

const followRoutes = express.Router();

followRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Follow.find()
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

followRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const id = await Follow.fromJsonApi(req.body, {
      assignAttribute: Follow.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await Follow.findById(id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

followRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Follow.findById(req.params.id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

followRoutes.patch("/:id", isLogin(), async (req, res, next) => {
  try {
    await Follow.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.follower === token.uid || doc.followed === token.uid)) {
          return doc
            .merge(Follow.fromJsonApi(req.body, {
              assignAttribute: Follow.fromLanguage(req.query.language),
            }))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await Follow.findById(req.params.id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

followRoutes.delete("/:id", isLogin(), async (req, res, next) => {
  try {
    await Follow.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.follower === token.uid || doc.followed === token.uid)) {
          return doc
            .deleteOne();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


followRoutes.get("/:id/follower", async (req, res, next) => {
  try {
    const response = await Follow.findById(req.params.id)
      .getRelationship("follower")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

followRoutes.get("/:id/followed", async (req, res, next) => {
  try {
    const response = await Follow.findById(req.params.id)
      .getRelationship("followed")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default followRoutes
