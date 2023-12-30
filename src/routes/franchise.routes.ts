import express from "express";
import Franchise from "../models/franchise.model";
import { isAdmin } from "../utils/middlewares/middlewares";

const franchiseRoutes = express.Router();

franchiseRoutes.get("/", async (req, res, next) => {
  try {
    const response = await Franchise.find()
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

franchiseRoutes.post("/", isAdmin(), async (req, res, next) => {
  try {
    const id = await Franchise.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await Franchise.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.patch("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Franchise.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Franchise.fromJsonApi(req.body))
          .save();
      });

    const response = await Franchise.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.delete("/:id", isAdmin(), async (req, res, next) => {
  try {
    await Franchise.findById(req.params.id)
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


franchiseRoutes.get("/:id/source", async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
      .getRelationship("source")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

franchiseRoutes.get("/:id/destination", async (req, res, next) => {
  try {
    const response = await Franchise.findById(req.params.id)
      .getRelationship("destination")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default franchiseRoutes
