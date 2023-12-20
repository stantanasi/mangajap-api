import express from "express";
import Staff from "../models/staff.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const staffRoutes = express.Router();

staffRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Staff.find()
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

staffRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const id = await Staff.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Staff.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

staffRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Staff.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Staff.fromJsonApi(req.body))
          .save();
      });

    const response = await Staff.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

staffRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await Staff.findById(req.params.id)
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


staffRoutes.get('/:id/people', async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .getRelationship('people')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .getRelationship('anime')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const response = await Staff.findById(req.params.id)
      .getRelationship('manga')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default staffRoutes
