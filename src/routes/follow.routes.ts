import express from "express";
import { Follow } from "../models/follow.model";
import { User } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const followRoutes = express.Router();

followRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Follow,
      JsonApiQueryParser.parse(req.query, Follow)
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

followRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Follow,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

followRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Follow,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Follow)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

followRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await User.findOne({
      uid: bearerToken,
    });
    const old = await Follow.findById(req.params.id);
    if (!user?._id?.equals(old?.follower) && !user?._id?.equals(old?.followed)) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      Follow,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

followRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await User.findOne({
      uid: bearerToken,
    });
    const old = await Follow.findById(req.params.id);
    if (!user?._id?.equals(old?.follower) && !user?._id?.equals(old?.followed)) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      Follow,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


followRoutes.get('/:id/follower', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Follow,
      req.params.id,
      'follower',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

followRoutes.get('/:id/followed', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Follow,
      req.params.id,
      'followed',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default followRoutes
