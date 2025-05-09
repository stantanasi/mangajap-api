import express from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import Franchise from '../models/franchise.model';
import { isAdmin, isLogin } from '../utils/middlewares/middlewares';

const franchiseRoutes = express.Router();

franchiseRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Franchise.find()
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

franchiseRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Franchise.fromJsonApi(req.body, {
      assignAttribute: Franchise.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Franchise.findById(id)
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

franchiseRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
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

franchiseRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Franchise.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Franchise.fromJsonApi(req.body, {
            assignAttribute: Franchise.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Franchise.findById(req.params.id)
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

franchiseRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Franchise.findById(req.params.id)
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


franchiseRoutes.get('/:id/source', async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
      .getRelationship('source')
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

franchiseRoutes.get('/:id/destination', async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
      .getRelationship('destination')
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

franchiseRoutes.get('/:id/changes', async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
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

export default franchiseRoutes
