import express from "express";
import Change from "../models/change.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const changeRoutes = express.Router();

changeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Change.find()
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

changeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Change.fromJsonApi(req.body, {
      assignAttribute: Change.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await Change.findById(id)
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

changeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Change.findById(req.params.id)
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

changeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Change.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Change.fromJsonApi(req.body, {
            assignAttribute: Change.fromLanguage(req.query.language),
          }))
          .save();
      });

    const response = await Change.findById(req.params.id)
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

changeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Change.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .deleteOne();
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


changeRoutes.get("/:id/document", async (req, res, next) => {
  try {
    const response = await Change.findById(req.params.id)
      .getRelationship("document")
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

changeRoutes.get("/:id/user", async (req, res, next) => {
  try {
    const response = await Change.findById(req.params.id)
      .getRelationship("user")
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

export default changeRoutes
