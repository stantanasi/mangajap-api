import express from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import Genre from '../models/genre.model';
import { isAdmin, isLogin } from '../utils/middlewares/middlewares';

const genreRoutes = express.Router();

genreRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Genre.find()
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

genreRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Genre.fromJsonApi(req.body, {
      assignAttribute: Genre.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Genre.findById(id)
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

genreRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
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

genreRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Genre.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Genre.fromJsonApi(req.body, {
            assignAttribute: Genre.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Genre.findById(req.params.id)
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

genreRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Genre.findById(req.params.id)
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


genreRoutes.get('/:id/mangas', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
      .getRelationship('mangas')
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

genreRoutes.get('/:id/animes', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
      .getRelationship('animes')
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

genreRoutes.get('/:id/changes', async (req, res, next) => {
  try {
    const response = await Genre.findById(req.params.id)
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

export default genreRoutes
