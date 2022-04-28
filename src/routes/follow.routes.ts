import express from "express";
import Follow from "../models/follow.model";
import { IUser } from "../models/user.model";
import { isLogin } from "../utils/middlewares/middlewares";
import { JsonApiError } from "../utils/mongoose-jsonapi/mongoose-jsonapi";

const followRoutes = express.Router();

followRoutes.get('/', async (req, res, next) => {
  try {
    const body = await Follow.find()
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

followRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const id = await Follow.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await Follow.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

followRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await Follow.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

followRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    await Follow.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc.follower === user._id || doc.followed === user._id)) {
          return doc
            .merge(Follow.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const body = await Follow.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

followRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    await Follow.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc.follower === user._id || doc.followed === user._id)) {
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


followRoutes.get('/:id/follower', async (req, res, next) => {
  try {
    const body = await Follow.findById(req.params.id)
      .getRelationship('follower')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

followRoutes.get('/:id/followed', async (req, res, next) => {
  try {
    const body = await Follow.findById(req.params.id)
      .getRelationship('followed')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

export default followRoutes
