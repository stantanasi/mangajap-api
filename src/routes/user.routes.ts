import express from "express";
import AnimeEntry from "../models/anime-entry.model";
import Follow from "../models/follow.model";
import MangaEntry from "../models/manga-entry.model";
import Review from "../models/review.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const userRoutes = express.Router();

userRoutes.get('/', async (req, res) => {
  const [users, count] = await User.findAll(JsonApi.parameters(req, User));
  res.json(await JsonApi.encode(req, users, count))
});

userRoutes.post('/', async (req, res) => {
  const user: User = req.body;
  const newUser = await user.create();
  res.json(await JsonApi.encode(req, newUser));
});

userRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const user = await User.findById(id, JsonApi.parameters(req, User));
  res.json(await JsonApi.encode(req, user));
});

userRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  console.log(user?.id, (req.body as User).id)
  if (user === null || user.id !== (req.body as User).id) {
    throw new PermissionDenied();
  }

  const newAnime = await (req.body as User).update();
  res.json(await JsonApi.encode(req, newAnime));
});

userRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const userToDelete = await User.findById((req.params as any).id);
  if (user === null || userToDelete === null || user.id !== userToDelete.id) {
    throw new PermissionDenied();
  }

  await userToDelete.delete();
  res.status(204).send();
});


userRoutes.get('/:id(\\d+)/followers', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("followers", JsonApi.parameters(req, Follow));
  if (Array.isArray(response)) {
    const [followers, count] = response;
    res.json(await JsonApi.encode(req, followers, count));
  }
});

userRoutes.get('/:id(\\d+)/following', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("following", JsonApi.parameters(req, Follow));
  if (Array.isArray(response)) {
    const [following, count] = response;
    res.json(await JsonApi.encode(req, following, count));
  }
});

userRoutes.get('/:id(\\d+)/manga-library', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("mangaLibrary", JsonApi.parameters(req, MangaEntry));
  if (Array.isArray(response)) {
    const [mangaLibrary, count] = response;
    res.json(await JsonApi.encode(req, mangaLibrary, count));
  }
});

userRoutes.get('/:id(\\d+)/anime-library', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("animeLibrary", JsonApi.parameters(req, AnimeEntry));
  if (Array.isArray(response)) {
    const [animeLibrary, count] = response;
    res.json(await JsonApi.encode(req, animeLibrary, count));
  }
});

userRoutes.get('/:id(\\d+)/manga-favorites', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("mangaFavorites", JsonApi.parameters(req, MangaEntry));
  if (Array.isArray(response)) {
    const [mangaFavorites, count] = response;
    res.json(await JsonApi.encode(req, mangaFavorites, count));
  }
});

userRoutes.get('/:id(\\d+)/anime-favorites', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("animeFavorites", JsonApi.parameters(req, AnimeEntry));
  if (Array.isArray(response)) {
    const [animeFavorites, count] = response;
    res.json(await JsonApi.encode(req, animeFavorites, count));
  }
});

userRoutes.get('/:id(\\d+)/reviews', async (req, res) => {
  const id: string = (req.params as any).id;
  const user = await User.findById(id);
  const response = await user?.getRelated("reviews", JsonApi.parameters(req, Review));
  if (Array.isArray(response)) {
    const [reviews, count] = response;
    res.json(await JsonApi.encode(req, reviews, count));
  }
});

export default userRoutes
