import express from "express";
import Franchise from "../models/franchise.model";
import Genre from "../models/genre.model";
import MangaEntry from "../models/manga-entry.model";
import Manga from "../models/manga.model";
import Review from "../models/review.model";
import Staff from "../models/staff.model";
import Theme from "../models/theme.model";
import User from "../models/user.model";
import Volume from "../models/volume.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const mangaRoutes = express.Router();

mangaRoutes.get('/', async (req, res) => {
  const [mangas, count] = await Manga.findAll(JsonApi.parameters(req, Manga));
  res.json(await JsonApi.encode(req, mangas, count))
});

mangaRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const manga: Manga = req.body;
  const newManga = await manga.create();
  res.json(await JsonApi.encode(req, newManga));
});

mangaRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id, JsonApi.parameters(req, Manga))
  res.json(await JsonApi.encode(req, manga));
});

mangaRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const manga: Manga = req.body;
  const newManga = await manga.update();
  res.json(await JsonApi.encode(req, newManga));
});

mangaRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const manga = new Manga(); 
  manga.id = (req.params as any).id;
  await manga.delete();
  res.status(204).send();
});


mangaRoutes.get('/:id(\\d+)/volumes', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("volumes", JsonApi.parameters(req, Volume));
  if (Array.isArray(response)) {
    const [volumes, count] = response;
    res.json(await JsonApi.encode(req, volumes, count));
  }
});

mangaRoutes.get('/:id(\\d+)/genres', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("genres", JsonApi.parameters(req, Genre));
  if (Array.isArray(response)) {
    const [genres, count] = response;
    res.json(await JsonApi.encode(req, genres, count));
  }
});

mangaRoutes.get('/:id(\\d+)/themes', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("themes", JsonApi.parameters(req, Theme));
  if (Array.isArray(response)) {
    const [themes, count] = response;
    res.json(await JsonApi.encode(req, themes, count));
  }
});

mangaRoutes.get('/:id(\\d+)/staff', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("staff", JsonApi.parameters(req, Staff));
  if (Array.isArray(response)) {
    const [staff, count] = response;
    res.json(await JsonApi.encode(req, staff, count));
  }
});

mangaRoutes.get('/:id(\\d+)/reviews', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("reviews", JsonApi.parameters(req, Review));
  if (Array.isArray(response)) {
    const [reviews, count] = response;
    res.json(await JsonApi.encode(req, reviews, count));
  }
});

mangaRoutes.get('/:id(\\d+)/franchise', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("franchise", JsonApi.parameters(req, Franchise));
  if (Array.isArray(response)) {
    const [franchise, count] = response;
    res.json(await JsonApi.encode(req, franchise, count));
  }
});

mangaRoutes.get('/:id(\\d+)/manga-entry', async (req, res) => {
  const id: string = (req.params as any).id;
  const manga = await Manga.findById(id);
  const response = await manga?.getRelated("mangaEntry", JsonApi.parameters(req, MangaEntry));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default mangaRoutes