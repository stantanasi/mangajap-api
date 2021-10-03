import express from "express";
import Anime from "../models/anime.model";
import Episode from "../models/episode.model";
import Season from "../models/season.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const episodeRoutes = express.Router();

episodeRoutes.get('/', async (req, res) => {
  const [episodes, count] = await Episode.findAll(JsonApi.parameters(req, Episode));
  res.json(await JsonApi.encode(req, episodes, count))
});

episodeRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const episode: Episode = req.body;
  const newEpisode = await episode.create();
  res.json(await JsonApi.encode(req, newEpisode));
});

episodeRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const episode = await Episode.findById(id, JsonApi.parameters(req, Episode))
  res.json(await JsonApi.encode(req, episode));
});

episodeRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const episode: Episode = req.body;
  const newEpisode = await episode.update();
  res.json(await JsonApi.encode(req, newEpisode));
});

episodeRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const episode = new Episode(); 
  episode.id = (req.params as any).id;
  await episode.delete();
  res.status(204).send();
});


episodeRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const episode = await Episode.findById(id);
  const response = await episode?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

episodeRoutes.get('/:id(\\d+)/season', async (req, res) => {
  const id: string = (req.params as any).id;
  const episode = await Episode.findById(id);
  const response = await episode?.getRelated("season", JsonApi.parameters(req, Season));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default episodeRoutes
