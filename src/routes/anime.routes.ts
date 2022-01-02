import express from "express";
import { AnimeEntryModel } from "../models/anime-entry.model";
import { AnimeModel } from "../models/anime.model";
import { EpisodeModel } from "../models/episode.model";
import { FranchiseModel } from "../models/franchise.model";
import { GenreModel } from "../models/genre.model";
import { ReviewModel } from "../models/review.model";
import { SeasonModel } from "../models/season.model";
import { StaffModel } from "../models/staff.model";
import { ThemeModel } from "../models/theme.model";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { isAdmin } from "../utils/middlewares/middlewares";

const animeRoutes = express.Router();

animeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      AnimeModel,
      JsonApiQueryParser.parse(req.query, AnimeModel)
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
      AnimeModel,
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
      AnimeModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, AnimeModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      AnimeModel,
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
      AnimeModel,
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
      AnimeModel,
      req.params.id,
      'seasons',
      JsonApiQueryParser.parse(req.query, SeasonModel),
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
      AnimeModel,
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

animeRoutes.get('/:id/genres', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      AnimeModel,
      req.params.id,
      'genres',
      JsonApiQueryParser.parse(req.query, GenreModel),
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
      AnimeModel,
      req.params.id,
      'themes',
      JsonApiQueryParser.parse(req.query, ThemeModel),
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
      AnimeModel,
      req.params.id,
      'staff',
      JsonApiQueryParser.parse(req.query, StaffModel),
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
      AnimeModel,
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

animeRoutes.get('/:id/franchises', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      AnimeModel,
      req.params.id,
      'franchises',
      JsonApiQueryParser.parse(req.query, FranchiseModel),
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
      AnimeModel,
      req.params.id,
      'anime-entry',
      JsonApiQueryParser.parse(req.query, AnimeEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default animeRoutes
