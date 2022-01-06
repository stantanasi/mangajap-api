import express from "express";
import Request from "../models/request.model";
import User from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const requestRoutes = express.Router();

requestRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Request,
      JsonApiQueryParser.parse(req.query, Request)
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

requestRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Request,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

requestRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Request,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Request)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

requestRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await User.findOne({
      uid: bearerToken,
    });
    const old = await Request.findById(req.params.id);
    if (!user?._id?.equals(old?.user)) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      Request,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

requestRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await User.findOne({
      uid: bearerToken,
    });
    const old = await Request.findById(req.params.id);
    if (!user?._id?.equals(old?.user)) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      Request,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


requestRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Request,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default requestRoutes
