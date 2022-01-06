import express from "express";
import { Anime } from "../models/anime.model";
import { Episode } from "../models/episode.model";
import { Season } from "../models/season.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const episodeRoutes = express.Router();

episodeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Episode,
      JsonApiQueryParser.parse(req.query, Episode)
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

episodeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Episode,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

episodeRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Episode,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Episode)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

episodeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Episode,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

episodeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Episode,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


episodeRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Episode,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, Anime),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

episodeRoutes.get('/:id/season', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Episode,
      req.params.id,
      'season',
      JsonApiQueryParser.parse(req.query, Season),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default episodeRoutes
