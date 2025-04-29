import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import Anime from "../models/anime.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const animeRoutes = express.Router();

animeRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Anime.find()
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

animeRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Anime.fromJsonApi(req.body, {
      assignAttribute: Anime.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Anime.findById(id)
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

animeRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
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

animeRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Anime.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Anime.fromJsonApi(req.body, {
            assignAttribute: Anime.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Anime.findById(req.params.id)
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

animeRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Anime.findById(req.params.id)
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


animeRoutes.get("/:id/seasons", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("seasons")
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

animeRoutes.get("/:id/episodes", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("episodes")
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

animeRoutes.get("/:id/genres", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("genres")
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

animeRoutes.get("/:id/themes", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("themes")
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

animeRoutes.get("/:id/staff", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
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

animeRoutes.get("/:id/reviews", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("reviews")
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

animeRoutes.get("/:id/franchises", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("franchises")
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

animeRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
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

animeRoutes.get("/:id/anime-entry", async (req, res, next) => {
  try {
    const response = await Anime.findById(req.params.id)
      .getRelationship("anime-entry")
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

export default animeRoutes
