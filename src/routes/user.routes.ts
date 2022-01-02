import express from "express";
import { AnimeEntryModel } from "../models/anime-entry.model";
import { FollowModel } from "../models/follow.model";
import { MangaEntryModel } from "../models/manga-entry.model";
import { ReviewModel } from "../models/review.model";
import { UserModel } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const userRoutes = express.Router();

userRoutes.get('/', async (req, res, next) => {
  // TODO: filter self
  const filter = req.query.filter as any;
  if (filter?.self) {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    delete filter.self
    filter.uid = bearerToken
  }

  try {
    const { data, count } = await MongooseAdapter.find(
      UserModel,
      JsonApiQueryParser.parse(req.query, UserModel)
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count
      },
      pagination: {
        url: req.originalUrl,
        count: count,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.post('/', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      UserModel,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      UserModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, UserModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

userRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await UserModel.findById(req.params.id);
    if (user?.id !== old?.id) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      UserModel,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

userRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await UserModel.findById(req.params.id);
    if (user?.id !== old?.id) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      UserModel,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


userRoutes.get('/:id/followers', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'followers',
      JsonApiQueryParser.parse(req.query, FollowModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/following', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'following',
      JsonApiQueryParser.parse(req.query, FollowModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/anime-library', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'anime-library',
      JsonApiQueryParser.parse(req.query, AnimeEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/manga-library', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'manga-library',
      JsonApiQueryParser.parse(req.query, MangaEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/anime-favorites', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'anime-favorites',
      JsonApiQueryParser.parse(req.query, AnimeEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/manga-favorites', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'manga-favorites',
      JsonApiQueryParser.parse(req.query, MangaEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

userRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      UserModel,
      req.params.id,
      'reviews',
      JsonApiQueryParser.parse(req.query, ReviewModel),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

export default userRoutes
