import express from "express";
import { AnimeModel } from "../models/anime.model";
import { EpisodeModel } from "../models/episode.model";
import { SeasonModel } from "../models/season.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const seasonRoutes = express.Router();

seasonRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      SeasonModel,
      JsonApiQueryParser.parse(req.query, SeasonModel)
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

seasonRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      SeasonModel,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

seasonRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      SeasonModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, SeasonModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

seasonRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      SeasonModel,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

seasonRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      SeasonModel,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


seasonRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      SeasonModel,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, AnimeModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

seasonRoutes.get('/:id/episodes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      SeasonModel,
      req.params.id,
      'episodes',
      JsonApiQueryParser.parse(req.query, EpisodeModel),
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

export default seasonRoutes;