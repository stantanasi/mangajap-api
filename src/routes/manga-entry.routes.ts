import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import MangaEntry from "../models/manga-entry.model";
import { IUser } from "../models/user.model";
import { isLogin } from "../utils/middlewares/middlewares";
import { JsonApiError } from "../utils/mongoose-jsonapi/mongoose-jsonapi";

const mangaEntryRoutes = express.Router();

mangaEntryRoutes.get("/", async (req, res, next) => {
  try {
    const response = await MangaEntry.find()
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

mangaEntryRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const id = await MangaEntry.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await MangaEntry.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await MangaEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.patch("/:id", isLogin(), async (req, res, next) => {
  try {
    await MangaEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .merge(MangaEntry.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await MangaEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.delete("/:id", isLogin(), async (req, res, next) => {
  try {
    await MangaEntry.findById(req.params.id)
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


mangaEntryRoutes.get("/:id/manga", async (req, res, next) => {
  try {
    const response = await MangaEntry.findById(req.params.id)
      .getRelationship("manga")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.get("/:id/user", async (req, res, next) => {
  try {
    const response = await MangaEntry.findById(req.params.id)
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

export default mangaEntryRoutes
