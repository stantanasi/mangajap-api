import { JsonApiQueryParams } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import People from "../models/people.model";
import { isAdmin, isLogin } from "../utils/middlewares/middlewares";

const peopleRoutes = express.Router();

peopleRoutes.get("/", async (req, res, next) => {
  try {
    const query: JsonApiQueryParams = Object.assign({}, req.query);
    if (query.sort?.split(",").includes("random")) {
      query.filter = query.filter || {};
      query.filter._id = (await People.aggregate()
        .sample(+(query.page?.limit ?? 10)))
        .map((people) => people._id)
        .join(",");

      query.sort = query.sort?.split(",").filter((sort) => sort !== "random").join(",");
    }

    const response = await People.find()
      .withJsonApi(query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await People.fromJsonApi(req.body, {
      assignAttribute: People.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await People.findById(id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.patch("/:id", isLogin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await People.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(People.fromJsonApi(req.body, {
            assignAttribute: People.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await People.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .deleteOne({ user: token.uid });
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


peopleRoutes.get("/:id/staff", async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .getRelationship("staff")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get("/:id/manga-staff", async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .getRelationship("manga-staff")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get("/:id/anime-staff", async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .getRelationship("anime-staff")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

peopleRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .getRelationship("changes")
      .withJsonApi(req.query)
      .withLanguage(req.query.language)
      .toJsonApi({
        baseUrl: `${process.env.API_URL}`,
      })
      .paginate({
        url: `${process.env.API_URL}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default peopleRoutes
