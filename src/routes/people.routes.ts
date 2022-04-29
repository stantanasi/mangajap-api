import express from "express";
import People from "../models/people.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import { JsonApiQueryParams } from "../utils/mongoose-jsonapi/mongoose-jsonapi";

const peopleRoutes = express.Router();

peopleRoutes.get('/', async (req, res, next) => {
  try {
    const query: JsonApiQueryParams = Object.assign({}, req.query);
    if (query.sort?.split(',').includes('random')) {
      query.filter = query.filter || {};
      query.filter._id = (await People.aggregate()
        .sample(+(query.page?.limit ?? 10)))
        .map((people) => people._id)
        .join(',');

      query.sort = query.sort?.split(',').filter((sort) => sort !== 'random').join(',');
    }

    const body = await People.find()
      .withJsonApi(query)
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

peopleRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await People.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await People.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await People.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(People.fromJsonApi(req.body))
          .save();
      });

    const body = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await People.findById(req.params.id)
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


peopleRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const body = await People.findById(req.params.id)
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

peopleRoutes.get('/:id/manga-staff', async (req, res, next) => {
  try {
    const body = await People.findById(req.params.id)
      .getRelationship('manga-staff')
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

peopleRoutes.get('/:id/anime-staff', async (req, res, next) => {
  try {
    const body = await People.findById(req.params.id)
      .getRelationship('anime-staff')
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

export default peopleRoutes
