import express from "express";
import Genre from "../models/genre.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const genreRoutes = express.Router();

genreRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Genre.find()
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

genreRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await Genre.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Genre.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

genreRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

genreRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Genre.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Genre.fromJsonApi(req.body))
          .save();
      });

    const response = await Genre.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

genreRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Genre.findById(req.params.id)
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


genreRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
      .getRelationship('manga')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

genreRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
      .getRelationship('anime')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default genreRoutes
