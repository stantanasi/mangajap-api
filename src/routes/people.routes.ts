import express from "express";
import { PeopleModel } from "../models/people.model";
import { StaffModel } from "../models/staff.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const peopleRoutes = express.Router();

peopleRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      PeopleModel,
      JsonApiQueryParser.parse(req.query, PeopleModel)
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
      PeopleModel,
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
      PeopleModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, PeopleModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

peopleRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      PeopleModel,
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
      PeopleModel,
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
      PeopleModel,
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

peopleRoutes.get('/:id/manga-staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      PeopleModel,
      req.params.id,
      'manga-staff',
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

peopleRoutes.get('/:id/anime-staff', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      PeopleModel,
      req.params.id,
      'anime-staff',
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

export default peopleRoutes
