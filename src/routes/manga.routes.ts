import express from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import Manga from "../models/manga.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const mangaRoutes = express.Router();

mangaRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Manga.find()
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

mangaRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    const id = await Manga.fromJsonApi(req.body, {
      assignAttribute: Manga.fromLanguage(req.query.language),
    })
      .save({ user: token.uid })
      .then((doc) => doc._id);

    const response = await Manga.findById(id)
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

mangaRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Manga.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Manga.fromJsonApi(req.body, {
            assignAttribute: Manga.fromLanguage(req.query.language),
          }))
          .save({ user: token.uid });
      });

    const response = await Manga.findById(req.params.id)
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

mangaRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    const token: DecodedIdToken = res.locals.token;

    await Manga.findById(req.params.id)
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


mangaRoutes.get("/:id/volumes", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
      .getRelationship("volumes")
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

mangaRoutes.get("/:id/chapters", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
      .getRelationship("chapters")
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

mangaRoutes.get("/:id/genres", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/themes", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/staff", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/reviews", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/franchises", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/changes", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
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

mangaRoutes.get("/:id/manga-entry", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
      .getRelationship("manga-entry")
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

export default mangaRoutes