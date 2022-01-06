import express from "express";
import { Anime } from "../models/anime.model";
import { Manga } from "../models/manga.model";
import { People } from "../models/people.model";
import { Staff } from "../models/staff.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const staffRoutes = express.Router();

staffRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Staff,
      JsonApiQueryParser.parse(req.query, Staff)
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

staffRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Staff,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Staff,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Staff)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

staffRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Staff,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

staffRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Staff,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


staffRoutes.get('/:id/people', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Staff,
      req.params.id,
      'people',
      JsonApiQueryParser.parse(req.query, People),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Staff,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, Anime),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

staffRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Staff,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default staffRoutes
