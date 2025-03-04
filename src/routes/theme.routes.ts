import express from "express";
import Theme from "../models/theme.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const themeRoutes = express.Router();

themeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Theme.find()
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

themeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Theme.fromJsonApi(req.body, {
      assignAttribute: Theme.fromLanguage(req.query.language),
    })
      .save()
      .then((doc) => doc._id);

    const response = await Theme.findById(id)
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

themeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
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

themeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Theme.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Theme.fromJsonApi(req.body, {
            assignAttribute: Theme.fromLanguage(req.query.language),
          }))
          .save();
      });

    const response = await Theme.findById(req.params.id)
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

themeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Theme.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .deleteOne();
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


themeRoutes.get("/:id/mangas", async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
      .getRelationship("mangas")
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

themeRoutes.get("/:id/animes", async (req, res, next) => {
  try {
    const response = await Theme.findById(req.params.id)
      .getRelationship("animes")
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

export default themeRoutes
