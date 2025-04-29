import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import Chapter from "../models/chapter.model";
import { isAdmin, isLogin } from "../utils/middlewares/middlewares";

const chapterRoutes = express.Router();

chapterRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Chapter.find()
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

chapterRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Chapter.fromJsonApi(req.body, {
      assignAttribute: Chapter.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Chapter.findById(id)
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

chapterRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Chapter.findById(req.params.id)
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

chapterRoutes.patch("/:id", isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Chapter.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Chapter.fromJsonApi(req.body, {
            assignAttribute: Chapter.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Chapter.findById(req.params.id)
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

chapterRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Chapter.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .deleteOne({ user: token.uid });
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


chapterRoutes.get("/:id/manga", async (req, res, next) => {
  try {
    const response = await Chapter.findById(req.params.id)
      .getRelationship("manga")
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

chapterRoutes.get("/:id/volume", async (req, res, next) => {
  try {
    const response = await Chapter.findById(req.params.id)
      .getRelationship("volume")
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

chapterRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await Chapter.findById(req.params.id)
      .getRelationship("changes")
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

chapterRoutes.get("/:id/chapter-entry", async (req, res, next) => {
  try {
    const response = await Chapter.findById(req.params.id)
      .getRelationship("chapter-entry")
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

export default chapterRoutes
