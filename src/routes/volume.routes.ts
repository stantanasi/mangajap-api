import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import Volume from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const volumeRoutes = express.Router();

volumeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Volume.find()
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

volumeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Volume.fromJsonApi(req.body, {
      assignAttribute: Volume.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Volume.findById(id)
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

volumeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
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

volumeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Volume.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Volume.fromJsonApi(req.body, {
            assignAttribute: Volume.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Volume.findById(req.params.id)
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

volumeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Volume.findById(req.params.id)
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


volumeRoutes.get("/:id/manga", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
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

volumeRoutes.get("/:id/chapters", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
      .getRelationship("chapters")
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

volumeRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
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

volumeRoutes.get("/:id/volume-entry", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
      .getRelationship("volume-entry")
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

export default volumeRoutes
