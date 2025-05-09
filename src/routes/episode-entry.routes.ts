import { JsonApiError } from '@stantanasi/mongoose-jsonapi';
import express from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import EpisodeEntry from '../models/episode-entry.model';
import { isLogin } from '../utils/middlewares/middlewares';

const episodeEntryRoutes = express.Router();

episodeEntryRoutes.get('/', async (req, res, next) => {
  try {
    const response = await EpisodeEntry.find()
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

episodeEntryRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const id = await EpisodeEntry.fromJsonApi(req.body, {
      assignAttribute: EpisodeEntry.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await EpisodeEntry.findById(id)
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

episodeEntryRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await EpisodeEntry.findById(req.params.id)
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

episodeEntryRoutes.patch('/:id', async (req, res, next) => {
  try {
    await EpisodeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .merge(EpisodeEntry.fromJsonApi(req.body, {
              assignAttribute: EpisodeEntry.fromLanguage(req.query.language),
            }))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await EpisodeEntry.findById(req.params.id)
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

episodeEntryRoutes.delete('/:id', async (req, res, next) => {
  try {
    await EpisodeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .deleteOne();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


episodeEntryRoutes.get('/:id/episode', async (req, res, next) => {
  try {
    const response = await EpisodeEntry.findById(req.params.id)
      .getRelationship('episode')
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

episodeEntryRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const response = await EpisodeEntry.findById(req.params.id)
      .getRelationship('user')
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

export default episodeEntryRoutes
