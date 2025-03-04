import { JsonApiError } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import MangaEntry from "../models/manga-entry.model";
import { isLogin } from "../utils/middlewares/middlewares";

const mangaEntryRoutes = express.Router();

mangaEntryRoutes.get("/", async (req, res, next) => {
  try {
    const response = await MangaEntry.find()
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
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
    const id = await MangaEntry.fromJsonApi(req.body, {
      assignAttribute: MangaEntry.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await MangaEntry.findById(id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
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
      .withLanguage(req.query.language)
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
            .merge(MangaEntry.fromJsonApi(req.body, {
              assignAttribute: MangaEntry.fromLanguage(req.query.language),
            }))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await MangaEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
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
      .withLanguage(req.query.language)
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
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default mangaEntryRoutes
