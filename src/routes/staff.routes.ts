import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import Staff from "../models/staff.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const staffRoutes = express.Router();

staffRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Staff.find()
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

staffRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Staff.fromJsonApi(req.body, {
      assignAttribute: Staff.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Staff.findById(id)
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

staffRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
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

staffRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Staff.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Staff.fromJsonApi(req.body, {
            assignAttribute: Staff.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Staff.findById(req.params.id)
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

staffRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Staff.findById(req.params.id)
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


staffRoutes.get("/:id/people", async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .getRelationship("people")
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

staffRoutes.get("/:id/anime", async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .getRelationship("anime")
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

staffRoutes.get("/:id/manga", async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
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

staffRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
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

export default staffRoutes
