import express from "express";
import Anime from "../models/anime.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const animeRoutes = express.Router();

animeRoutes.get('/', async (req, res, next) => {
  try {
    const body = await Anime.find()
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

animeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await Anime.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await Anime.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

animeRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

animeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Anime.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Anime.fromJsonApi(req.body))
          .save();
      });

    const body = await Anime.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

animeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Anime.findById(req.params.id)
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


animeRoutes.get('/:id/seasons', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('seasons')
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

animeRoutes.get('/:id/episodes', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('episodes')
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

animeRoutes.get('/:id/genres', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('genres')
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

animeRoutes.get('/:id/themes', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('themes')
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

animeRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('staff')
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

animeRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('reviews')
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

animeRoutes.get('/:id/franchises', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('franchises')
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

animeRoutes.get('/:id/anime-entry', async (req, res, next) => {
  try {
    const body = await Anime.findById(req.params.id)
      .getRelationship('anime-entry')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

export default animeRoutes
