import express from "express";
import Anime from "../models/anime.model";
import Genre from "../models/genre.model";
import Manga from "../models/manga.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const genreRoutes = express.Router();

genreRoutes.get('/', async (req, res) => {
  const [genres, count] = await Genre.findAll(JsonApi.parameters(req, Genre));
  res.json(await JsonApi.encode(req, genres, count))
});

genreRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const genre: Genre = req.body;
  const newGenre = await genre.create();
  res.json(await JsonApi.encode(req, newGenre));
});

genreRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const genre = await Genre.findById(id, JsonApi.parameters(req, Genre))
  res.json(await JsonApi.encode(req, genre));
});

genreRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const genre: Genre = req.body;
  const newGenre = await genre.update();
  res.json(await JsonApi.encode(req, newGenre));
});

genreRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const genre = new Genre(); 
  genre.id = (req.params as any).id;
  await genre.delete();
  res.status(204).send();
});


genreRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const genre = await Genre.findById(id);
  const response = await genre?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (Array.isArray(response)) {
    const [mangas, count] = response;
    res.json(await JsonApi.encode(req, mangas, count));
  }
});

genreRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const genre = await Genre.findById(id);
  const response = await genre?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (Array.isArray(response)) {
    const [animes, count] = response;
    res.json(await JsonApi.encode(req, animes, count));
  }
});

export default genreRoutes
