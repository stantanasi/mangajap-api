import express from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import Season from '../models/season.model';
import { isAdmin, isLogin } from '../utils/middlewares/middlewares';

const seasonRoutes = express.Router();

seasonRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Season.find()
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

seasonRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Season.fromJsonApi(req.body, {
      assignAttribute: Season.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Season.findById(id)
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

seasonRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
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

seasonRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Season.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Season.fromJsonApi(req.body, {
            assignAttribute: Season.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Season.findById(req.params.id)
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

seasonRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Season.findById(req.params.id)
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


seasonRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
      .getRelationship('anime')
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

seasonRoutes.get('/:id/episodes', async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
      .getRelationship('episodes')
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

seasonRoutes.get('/:id/changes', async (req, res, next) => {
  try {
    const response = await Season.findById(req.params.id)
      .getRelationship('changes')
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

export default seasonRoutes;