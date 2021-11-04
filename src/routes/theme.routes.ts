import express from "express";
import Anime from "../models/anime.model";
import Manga from "../models/manga.model";
import Theme from "../models/theme.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const themeRoutes = express.Router();

themeRoutes.get('/', async (req, res) => {
  const [themes, count] = await Theme.findAll(JsonApi.parameters(req, Theme));
  res.json(await JsonApi.encode(req, themes, count))
});

themeRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const theme: Theme = req.body;
  const newTheme = await theme.create();
  res.json(await JsonApi.encode(req, newTheme));
});

themeRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const theme = await Theme.findById(id, JsonApi.parameters(req, Theme))
  res.json(await JsonApi.encode(req, theme));
});

themeRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const theme: Theme = req.body;
  const newTheme = await theme.update();
  res.json(await JsonApi.encode(req, newTheme));
});

themeRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const theme = new Theme(); 
  theme.id = (req.params as any).id;
  await theme.delete();
  res.status(204).send();
});


themeRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const theme = await Theme.findById(id);
  const response = await theme?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (Array.isArray(response)) {
    const [mangas, count] = response;
    res.json(await JsonApi.encode(req, mangas, count));
  }
});

themeRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const theme = await Theme.findById(id);
  const response = await theme?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (Array.isArray(response)) {
    const [animes, count] = response;
    res.json(await JsonApi.encode(req, animes, count));
  }
});

export default themeRoutes
