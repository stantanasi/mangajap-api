import express from "express";
import { Manga } from "../models/manga.model";
import { Volume } from "../models/volume.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const volumeRoutes = express.Router();

volumeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Volume,
      JsonApiQueryParser.parse(req.query, Volume)
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

volumeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Volume,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

volumeRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Volume,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Volume)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

volumeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Volume,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

volumeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Volume,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


volumeRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Volume,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default volumeRoutes
