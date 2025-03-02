import express from "express";
import Volume from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const volumeRoutes = express.Router();

volumeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Volume.find()
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

volumeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Volume.fromJsonApi(req.body, {
      assignAttribute: Volume.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await Volume.findById(id)
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

volumeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
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

volumeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Volume.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Volume.fromJsonApi(req.body, {
            assignAttribute: Volume.fromLanguage(req.query.language),
          }))
          .save();
      });

    const response = await Volume.findById(req.params.id)
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

volumeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Volume.findById(req.params.id)
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


volumeRoutes.get("/:id/manga", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
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

volumeRoutes.get("/:id/chapters", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
      .getRelationship("chapters")
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

volumeRoutes.get("/:id/volume-entry", async (req, res, next) => {
  try {
    const response = await Volume.findById(req.params.id)
      .getRelationship("volume-entry")
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

export default volumeRoutes
