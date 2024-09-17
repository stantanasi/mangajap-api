import { JsonApiError } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import AnimeEntry from "../models/anime-entry.model";
import { isLogin } from "../utils/middlewares/middlewares";

const animeEntryRoutes = express.Router();

animeEntryRoutes.get("/", async (req, res, next) => {
  try {
    const response = await AnimeEntry.find()
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const id = await AnimeEntry.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await AnimeEntry.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await AnimeEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.patch("/:id", async (req, res, next) => {
  try {
    await AnimeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .merge(AnimeEntry.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await AnimeEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.delete("/:id", async (req, res, next) => {
  try {
    await AnimeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
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


animeEntryRoutes.get("/:id/anime", async (req, res, next) => {
  try {
    const response = await AnimeEntry.findById(req.params.id)
      .getRelationship("anime")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.get("/:id/user", async (req, res, next) => {
  try {
    const response = await AnimeEntry.findById(req.params.id)
      .getRelationship("user")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default animeEntryRoutes
