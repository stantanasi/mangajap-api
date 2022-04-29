import express from "express";
import Request from "../models/request.model";
import { IUser } from "../models/user.model";
import { isLogin } from "../utils/middlewares/middlewares";
import { JsonApiError } from "../utils/mongoose-jsonapi/mongoose-jsonapi";

const requestRoutes = express.Router();

requestRoutes.get('/', async (req, res, next) => {
  try {
    const body = await Request.find()
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

requestRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const id = await Request.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await Request.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

requestRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await Request.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

requestRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    await Request.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc.user === user._id)) {
          return doc
            .merge(Request.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const body = await Request.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

requestRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    await Request.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc.user === user._id)) {
          return doc
            .delete();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


requestRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const body = await Request.findById(req.params.id)
      .getRelationship('user')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

export default requestRoutes
