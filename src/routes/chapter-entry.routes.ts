import { JsonApiError } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import ChapterEntry from "../models/chapter-entry.model";
import { isLogin } from "../utils/middlewares/middlewares";

const chapterEntryRoutes = express.Router();

chapterEntryRoutes.get("/", async (req, res, next) => {
  try {
    const response = await ChapterEntry.find()
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

chapterEntryRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const id = await ChapterEntry.fromJsonApi(req.body, {
      assignAttribute: ChapterEntry.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await ChapterEntry.findById(id)
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

chapterEntryRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await ChapterEntry.findById(req.params.id)
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

chapterEntryRoutes.patch("/:id", async (req, res, next) => {
  try {
    await ChapterEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .merge(ChapterEntry.fromJsonApi(req.body, {
              assignAttribute: ChapterEntry.fromLanguage(req.query.language),
            }))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await ChapterEntry.findById(req.params.id)
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

chapterEntryRoutes.delete("/:id", async (req, res, next) => {
  try {
    await ChapterEntry.findById(req.params.id)
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


chapterEntryRoutes.get("/:id/chapter", async (req, res, next) => {
  try {
    const response = await ChapterEntry.findById(req.params.id)
      .getRelationship("chapter")
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

chapterEntryRoutes.get("/:id/user", async (req, res, next) => {
  try {
    const response = await ChapterEntry.findById(req.params.id)
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

export default chapterEntryRoutes
