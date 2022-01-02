import express from "express";
import { FranchiseModel } from "../models/franchise.model";
import { GenreModel } from "../models/genre.model";
import { MangaEntryModel } from "../models/manga-entry.model";
import { MangaModel } from "../models/manga.model";
import { ReviewModel } from "../models/review.model";
import { StaffModel } from "../models/staff.model";
import { ThemeModel } from "../models/theme.model";
import { VolumeModel } from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const mangaRoutes = express.Router();

mangaRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      MangaModel,
      JsonApiQueryParser.parse(req.query, MangaModel)
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
      MangaModel,
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
      MangaModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, MangaModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      MangaModel,
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
      MangaModel,
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
      MangaModel,
      req.params.id,
      'volumes',
      JsonApiQueryParser.parse(req.query, VolumeModel),
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
      MangaModel,
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

mangaRoutes.get('/:id/themes', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      MangaModel,
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

mangaRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      MangaModel,
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

mangaRoutes.get('/:id/reviews', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      MangaModel,
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

mangaRoutes.get('/:id/franchises', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      MangaModel,
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

mangaRoutes.get('/:id/manga-entry', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      MangaModel,
      req.params.id,
      'manga-entry',
      JsonApiQueryParser.parse(req.query, MangaEntryModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default mangaRoutes