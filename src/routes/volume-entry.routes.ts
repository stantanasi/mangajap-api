import { JsonApiError } from "@stantanasi/mongoose-jsonapi";
import express from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import VolumeEntry from "../models/volume-entry.model";
import { isLogin } from "../utils/middlewares/middlewares";

const volumeEntryRoutes = express.Router();

volumeEntryRoutes.get("/", async (req, res, next) => {
  try {
    const response = await VolumeEntry.find()
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

volumeEntryRoutes.post("/", isLogin(), async (req, res, next) => {
  try {
    const id = await VolumeEntry.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id);

    const response = await VolumeEntry.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

volumeEntryRoutes.get("/:id", async (req, res, next) => {
  try {
    const response = await VolumeEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

volumeEntryRoutes.patch("/:id", async (req, res, next) => {
  try {
    await VolumeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .merge(VolumeEntry.fromJsonApi(req.body))
            .save();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    const response = await VolumeEntry.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

volumeEntryRoutes.delete("/:id", async (req, res, next) => {
  try {
    await VolumeEntry.findById(req.params.id)
      .orFail()
      .then((doc) => {
        const token: DecodedIdToken | null = res.locals.token;
        if (token && (token.isAdmin || doc.user === token.uid)) {
          return doc
            .deleteOne();
        } else {
          throw new JsonApiError.PermissionDenied();
        }
      });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


volumeEntryRoutes.get("/:id/volume", async (req, res, next) => {
  try {
    const response = await VolumeEntry.findById(req.params.id)
      .getRelationship("volume")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

volumeEntryRoutes.get("/:id/user", async (req, res, next) => {
  try {
    const response = await VolumeEntry.findById(req.params.id)
      .getRelationship("user")
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default volumeEntryRoutes
