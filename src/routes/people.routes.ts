import express from "express";
import People from "../models/people.model";
import Staff from "../models/staff.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const peopleRoutes = express.Router();

peopleRoutes.get('/', async (req, res, next) => {
  try {
    const query = JsonApiQueryParser.parse(req.query, People);

    if (query.sort?.['random']) {
      query.filter = query.filter || {};
      query.filter._id = {
        $in: (await People.aggregate([
          { $sample: { size: +(query?.limit ?? 10) } }
        ])).map((people) => people._id),
      };

      delete query.sort?.['random'];
    }

    const { data, count } = await MongooseAdapter.find(
      People,
      query,
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

peopleRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      People,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      People,
      req.params.id,
      JsonApiQueryParser.parse(req.query, People)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

peopleRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      People,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

peopleRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      People,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


peopleRoutes.get('/:id/staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      People,
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

peopleRoutes.get('/:id/manga-staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      People,
      req.params.id,
      'manga-staff',
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

peopleRoutes.get('/:id/anime-staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      People,
      req.params.id,
      'anime-staff',
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

export default peopleRoutes
