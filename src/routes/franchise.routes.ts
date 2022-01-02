import express from "express";
import { AnimeModel } from "../models/anime.model";
import { FranchiseModel } from "../models/franchise.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const franchiseRoutes = express.Router();

franchiseRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      FranchiseModel,
      JsonApiQueryParser.parse(req.query, FranchiseModel)
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

franchiseRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      FranchiseModel,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      FranchiseModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, FranchiseModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      FranchiseModel,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      FranchiseModel,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


franchiseRoutes.get('/:id/source', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      FranchiseModel,
      req.params.id,
      'source',
      JsonApiQueryParser.parse(req.query, AnimeModel), // TODO: JsonApi.parameters(req, Anime | Manga)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.get('/:id/destination', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      FranchiseModel,
      req.params.id,
      'destination',
      JsonApiQueryParser.parse(req.query, AnimeModel), // TODO: JsonApi.parameters(req, Anime | Manga)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default franchiseRoutes
