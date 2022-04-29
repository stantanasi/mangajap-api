import express from "express";
import Episode from "../models/episode.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const episodeRoutes = express.Router();

episodeRoutes.get('/', async (req, res, next) => {
  try {
    const body = await Episode.find()
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

episodeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await Episode.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await Episode.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

episodeRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await Episode.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

episodeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Episode.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Episode.fromJsonApi(req.body))
          .save();
      });

    const body = await Episode.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

episodeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Episode.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .delete();
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


episodeRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const body = await Episode.findById(req.params.id)
      .getRelationship('anime')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

episodeRoutes.get('/:id/season', async (req, res, next) => {
  try {
    const body = await Episode.findById(req.params.id)
      .getRelationship('season')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

export default episodeRoutes
