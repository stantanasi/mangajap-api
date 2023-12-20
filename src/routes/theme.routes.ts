import express from "express";
import Theme from "../models/theme.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const themeRoutes = express.Router();

themeRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Theme.find()
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

themeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await Theme.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Theme.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

themeRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

themeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Theme.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Theme.fromJsonApi(req.body))
          .save();
      });

    const response = await Theme.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

themeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Theme.findById(req.params.id)
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


themeRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
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

themeRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
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

export default themeRoutes
