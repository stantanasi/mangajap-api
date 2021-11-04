import express from "express";
import Manga from "../models/manga.model";
import User from "../models/user.model";
import Volume from "../models/volume.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const volumeRoutes = express.Router();

volumeRoutes.get('/', async (req, res) => {
  const [volumes, count] = await Volume.findAll(JsonApi.parameters(req, Volume));
  res.json(await JsonApi.encode(req, volumes, count))
});

volumeRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const volume: Volume = req.body;
  const newVolume = await volume.create();
  res.json(await JsonApi.encode(req, newVolume));
});

volumeRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const volume = await Volume.findById(id, JsonApi.parameters(req, Volume))
  res.json(await JsonApi.encode(req, volume));
});

volumeRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const volume: Volume = req.body;
  const newVolume = await volume.update();
  res.json(await JsonApi.encode(req, newVolume));
});

volumeRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const volume = new Volume();
  volume.id = (req.params as any).id;
  await volume.delete();
  res.status(204).send();
});


volumeRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const volume = await Volume.findById(id);
  const response = await volume?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default volumeRoutes
