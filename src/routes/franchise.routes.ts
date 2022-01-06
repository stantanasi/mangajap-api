import express from "express";
import { Anime } from "../models/anime.model";
import { Franchise } from "../models/franchise.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const franchiseRoutes = express.Router();

franchiseRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Franchise,
      JsonApiQueryParser.parse(req.query, Franchise)
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
      Franchise,
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
      Franchise,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Franchise)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Franchise,
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
      Franchise,
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
      Franchise,
      req.params.id,
      'source',
      JsonApiQueryParser.parse(req.query, Anime), // TODO: JsonApi.parameters(req, Anime | Manga)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.get('/:id/destination', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Franchise,
      req.params.id,
      'destination',
      JsonApiQueryParser.parse(req.query, Anime), // TODO: JsonApi.parameters(req, Anime | Manga)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default franchiseRoutes
