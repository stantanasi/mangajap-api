import express from "express";
import Chapter from "../models/chapter.model";
import Manga from "../models/manga.model";
import Volume from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const chapterRoutes = express.Router();

chapterRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Chapter,
      JsonApiQueryParser.parse(req.query, Chapter)
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

chapterRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Chapter,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

chapterRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Chapter,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Chapter)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

chapterRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Chapter,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

chapterRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Chapter,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


chapterRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Chapter,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

chapterRoutes.get('/:id/volume', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Chapter,
      req.params.id,
      'volume',
      JsonApiQueryParser.parse(req.query, Volume),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default chapterRoutes
