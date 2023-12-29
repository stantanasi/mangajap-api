import express from "express";
import Manga from "../models/manga.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const mangaRoutes = express.Router();

mangaRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Manga.find()
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        query: req.query,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Manga.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Manga.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Manga.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Manga.fromJsonApi(req.body))
          .save();
      });

    const response = await Manga.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

mangaRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Manga.findById(req.params.id)
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


mangaRoutes.get("/:id/volumes", async (req, res, next) => {
  try {
    const response = await Manga.findById(req.params.id)
      .getRelationship("volumes")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
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
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default mangaRoutes