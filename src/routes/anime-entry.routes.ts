import express from "express";
import AnimeEntry from "../models/anime-entry.model";
import Anime from "../models/anime.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const animeEntryRoutes = express.Router();

animeEntryRoutes.get('/', async (req, res) => {
  const [animeEntries, count] = await AnimeEntry.findAll(JsonApi.parameters(req, AnimeEntry));
  res.json(await JsonApi.encode(req, animeEntries, count))
});

animeEntryRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null) {
    throw new PermissionDenied();
  }

  const animeEntry: AnimeEntry = req.body;
  animeEntry.user = user;
  const newAnimeEntry = await animeEntry.create();
  res.json(await JsonApi.encode(req, newAnimeEntry));
});

animeEntryRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const animeEntry = await AnimeEntry.findById(id, JsonApi.parameters(req, AnimeEntry));
  res.json(await JsonApi.encode(req, animeEntry));
});

animeEntryRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  const oldAnimeEntry = await AnimeEntry.findById((req.params as any).id)
  if (user === null || oldAnimeEntry === null || user.id !== oldAnimeEntry.userId) {
    throw new PermissionDenied();
  }

  const animeEntry: AnimeEntry = req.body;
  const newAnimeEntry = await animeEntry.update();
  res.json(await JsonApi.encode(req, newAnimeEntry));
});

animeEntryRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  const animeEntry = await AnimeEntry.findById((req.params as any).id);
  if (user === null || animeEntry === null || user.id !== animeEntry.userId) {
    throw new PermissionDenied();
  }

  await animeEntry.delete();
  res.status(204).send();
});


animeEntryRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const animeEntry = await AnimeEntry.findById(id);
  const response = await animeEntry?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

animeEntryRoutes.get('/:id(\\d+)/user', async (req, res) => {
  const id: string = (req.params as any).id;
  const animeEntry = await AnimeEntry.findById(id);
  const response = await animeEntry?.getRelated("user", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default animeEntryRoutes
