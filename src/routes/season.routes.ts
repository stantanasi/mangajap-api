import express from "express";
import Anime from "../models/anime.model";
import Episode from "../models/episode.model";
import Season from "../models/season.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const seasonRoutes = express.Router();

seasonRoutes.get('/', async (req, res) => {
  const [seasons, count] = await Season.findAll(JsonApi.parameters(req, Season));
  res.json(await JsonApi.encode(req, seasons, count))
});

seasonRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const season: Season = req.body;
  const newSeason = await season.create();
  res.json(await JsonApi.encode(req, newSeason));
});

seasonRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const season = await Season.findById(id, JsonApi.parameters(req, Season))
  res.json(await JsonApi.encode(req, season));
});

seasonRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const season: Season = req.body;
  const newSeason = await season.update();
  res.json(await JsonApi.encode(req, newSeason));
});

seasonRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const season = new Season(); 
  season.id = (req.params as any).id;
  await season.delete();
  res.status(204).send();
});


seasonRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const season = await Season.findById(id);
  const response = await season?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

seasonRoutes.get('/:id(\\d+)/episodes', async (req, res) => {
  const id: string = (req.params as any).id;
  const season = await Season.findById(id);
  const response = await season?.getRelated("episodes", JsonApi.parameters(req, Episode));
  if (Array.isArray(response)) {
    const [episodes, count] = response;
    res.json(await JsonApi.encode(req, episodes, count));
  }
});

export default seasonRoutes;