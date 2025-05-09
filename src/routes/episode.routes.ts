import express from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import Episode from '../models/episode.model';
import { isAdmin, isLogin } from '../utils/middlewares/middlewares';

const episodeRoutes = express.Router();

episodeRoutes.get('/', async (req, res, next) => {
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

episodeRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Episode.fromJsonApi(req.body, {
      assignAttribute: Episode.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
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

episodeRoutes.get('/:id', async (req, res, next) => {
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

episodeRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Episode.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Episode.fromJsonApi(req.body, {
            assignAttribute: Episode.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
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

episodeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Episode.findById(req.params.id)
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


episodeRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
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

episodeRoutes.get('/:id/season', async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
      .getRelationship('season')
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

episodeRoutes.get('/:id/changes', async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
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

episodeRoutes.get('/:id/episode-entry', async (req, res, next) => {
  try {
    const response = await Episode.findById(req.params.id)
      .getRelationship('episode-entry')
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
