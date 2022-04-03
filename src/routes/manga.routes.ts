import express from "express";
import Franchise from "../models/franchise.model";
import Genre from "../models/genre.model";
import MangaEntry from "../models/manga-entry.model";
import Manga from "../models/manga.model";
import Review from "../models/review.model";
import Staff from "../models/staff.model";
import Theme from "../models/theme.model";
import Volume from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const mangaRoutes = express.Router();

mangaRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Manga,
      JsonApiQueryParser.parse(req.query, Manga)
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

mangaRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Manga,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Manga,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Manga)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Manga,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Manga,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


mangaRoutes.get('/:id/volumes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
      req.params.id,
      'volumes',
      JsonApiQueryParser.parse(req.query, Volume),
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

mangaRoutes.get('/:id/genres', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
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

mangaRoutes.get('/:id/themes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
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

mangaRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
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

mangaRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
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

mangaRoutes.get('/:id/franchises', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Manga,
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

mangaRoutes.get('/:id/manga-entry', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Manga,
      req.params.id,
      'manga-entry',
      JsonApiQueryParser.parse(req.query, MangaEntry),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default mangaRoutes