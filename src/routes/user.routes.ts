import { JsonApiError } from '@stantanasi/mongoose-jsonapi';
import express from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { auth } from '../firebase-app';
import User from '../models/user.model';
import { isLogin } from '../utils/middlewares/middlewares';

const userRoutes = express.Router();

userRoutes.get('/', async (req, res, next) => {
  try {
    const response = await User.find()
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

userRoutes.post('/', async (req, res, next) => {
  try {
    const user = User.fromJsonApi(req.body, {
      assignAttribute: User.fromLanguage(req.query.language),
    });

    const attributes = req.body?.data?.attributes ?? {};
    for (const attribute of ['email', 'password']) {
      if (typeof attributes[attribute] === 'undefined' || !attributes[attribute]) {
        throw new JsonApiError.MissingAttribute(attribute);
      }
    }

    const firebaseUser = await auth.createUser({
      email: attributes.email,
      password: attributes.password,
    });

    user._id = firebaseUser.uid;

    const id = await user
      .save()
      .then((doc) => doc._id);

    const response = await User.findById(id)
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

userRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
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

userRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    await User.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc._id === token.uid)) {
          return doc
            .merge(User.fromJsonApi(req.body, {
              assignAttribute: User.fromLanguage(req.query.language),
            }))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await User.findById(req.params.id)
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

userRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    await User.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc._id === token.uid)) {
          return doc
            .deleteOne();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    await auth.deleteUser(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


userRoutes.get('/:id/followers', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('followers')
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

userRoutes.get('/:id/following', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('following')
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

userRoutes.get('/:id/anime-library', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('anime-library')
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

userRoutes.get('/:id/manga-library', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('manga-library')
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

userRoutes.get('/:id/anime-favorites', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('anime-favorites')
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

userRoutes.get('/:id/manga-favorites', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('manga-favorites')
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

userRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const response = await User.findById(req.params.id)
      .getRelationship('reviews')
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

export default userRoutes
