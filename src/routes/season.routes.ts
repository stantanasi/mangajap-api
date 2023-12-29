import express from "express";
import Season from "../models/season.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const seasonRoutes = express.Router();

seasonRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Season.find()
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

seasonRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Season.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Season.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

seasonRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

seasonRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Season.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Season.fromJsonApi(req.body))
          .save();
      });

    const response = await Season.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

seasonRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Season.findById(req.params.id)
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


seasonRoutes.get("/:id/anime", async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
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

seasonRoutes.get("/:id/episodes", async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
      .getRelationship("episodes")
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

export default seasonRoutes;