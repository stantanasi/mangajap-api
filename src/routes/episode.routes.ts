import express from "express";
import Episode from "../models/episode.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const episodeRoutes = express.Router();

episodeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Episode.find()
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

episodeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Episode.fromJsonApi(req.body, {
      assignAttribute: Episode.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await Episode.findById(id)
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

episodeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
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

episodeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Episode.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Episode.fromJsonApi(req.body, {
            assignAttribute: Episode.fromLanguage(req.query.language),
          }))
          .save();
      });

    const response = await Episode.findById(req.params.id)
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

episodeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Episode.findById(req.params.id)
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


episodeRoutes.get("/:id/anime", async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
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

episodeRoutes.get("/:id/season", async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
      .getRelationship("season")
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

episodeRoutes.get("/:id/episode-entry", async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
      .getRelationship("episode-entry")
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

export default episodeRoutes
