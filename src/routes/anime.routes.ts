import express from "express";
import AnimeEntry from "../models/anime-entry.model";
import Anime from "../models/anime.model";
import Episode from "../models/episode.model";
import Franchise from "../models/franchise.model";
import Genre from "../models/genre.model";
import Review from "../models/review.model";
import Season from "../models/season.model";
import Staff from "../models/staff.model";
import Theme from "../models/theme.model";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { isAdmin } from "../utils/middlewares/middlewares";

const animeRoutes = express.Router();

animeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Anime,
      JsonApiQueryParser.parse(req.query, Anime)
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

animeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Anime,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Anime,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Anime)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Anime,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Anime,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


animeRoutes.get('/:id/seasons', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'seasons',
      JsonApiQueryParser.parse(req.query, Season),
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

animeRoutes.get('/:id/episodes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'episodes',
      JsonApiQueryParser.parse(req.query, Episode),
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

animeRoutes.get('/:id/genres', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'genres',
      JsonApiQueryParser.parse(req.query, Genre),
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

animeRoutes.get('/:id/themes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'themes',
      JsonApiQueryParser.parse(req.query, Theme),
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

animeRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'staff',
      JsonApiQueryParser.parse(req.query, Staff),
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

animeRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'reviews',
      JsonApiQueryParser.parse(req.query, Review),
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

animeRoutes.get('/:id/franchises', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'franchises',
      JsonApiQueryParser.parse(req.query, Franchise),
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

animeRoutes.get('/:id/anime-entry', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Anime,
      req.params.id,
      'anime-entry',
      JsonApiQueryParser.parse(req.query, AnimeEntry),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default animeRoutes
