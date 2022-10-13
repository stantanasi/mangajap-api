import express from "express";
import User, { IUser } from "../models/user.model";
import { isLogin } from "../utils/middlewares/middlewares";
import { JsonApiError, JsonApiQueryParams } from "../utils/mongoose-jsonapi/mongoose-jsonapi";

const userRoutes = express.Router();

userRoutes.get('/', async (req, res, next) => {
  try {
    const body = await User.find()
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

userRoutes.post('/', async (req, res, next) => {
  try {
    const id = await User.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const body = await User.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

userRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    await User.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc._id === user._id)) {
          return doc
            .merge(User.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const body = await User.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });

    res.json(body);
  } catch (err) {
    next(err);
  }
});

userRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    await User.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const user: IUser | null = res.locals.user;
        if (user && (user.isAdmin || doc._id === user._id)) {
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


userRoutes.get('/:id/followers', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('followers')
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

userRoutes.get('/:id/following', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('following')
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

userRoutes.get('/:id/anime-library', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('anime-library')
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

userRoutes.get('/:id/manga-library', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('manga-library')
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

userRoutes.get('/:id/anime-favorites', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('anime-favorites')
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

userRoutes.get('/:id/manga-favorites', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('manga-favorites')
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

userRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const body = await User.findById(req.params.id)
      .getRelationship('reviews')
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

export default userRoutes
