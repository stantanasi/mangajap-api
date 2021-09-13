import express from "express";
import MangaEntry from "../models/manga-entry.model";
import Manga from "../models/manga.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const mangaEntryRoutes = express.Router();

mangaEntryRoutes.get('/', async (req, res) => {
  const [mangaEntries, count] = await MangaEntry.findAll(JsonApi.parameters(req, MangaEntry));
  res.json(JsonApi.encode(req, mangaEntries, count))
});

mangaEntryRoutes.post('/', async (req, res) => {
  const user = User.fromAccessToken();
  if (user === null) {
    throw new PermissionDenied();
  }

  const mangaEntry: MangaEntry = req.body;
  const newMangaEntry = await mangaEntry.create();
  res.json(JsonApi.encode(req, newMangaEntry));
});

mangaEntryRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const mangaEntry = await MangaEntry.findById(id, JsonApi.parameters(req, MangaEntry));
  res.json(JsonApi.encode(req, mangaEntry));
});

mangaEntryRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const oldMangaEntry = await MangaEntry.findById((req.params as any).id);
  if (user === null || oldMangaEntry === null || user.id !== oldMangaEntry.userId) {
    throw new PermissionDenied();
  }

  const mangaEntry: MangaEntry = req.body;
  const newMangaEntry = await mangaEntry.update();
  res.json(JsonApi.encode(req, newMangaEntry));
});

mangaEntryRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const mangaEntry = await MangaEntry.findById((req.params as any).id);
  if (user === null || mangaEntry === null || user.id !== mangaEntry.userId) {
    throw new PermissionDenied();
  }

  await mangaEntry.delete();
  res.status(204).send();
});


mangaEntryRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const mangaEntry = await MangaEntry.findById(id);
  const response = await mangaEntry?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (response && !Array.isArray(response)) {
    res.json(JsonApi.encode(req, response));
  }
});

mangaEntryRoutes.get('/:id(\\d+)/user', async (req, res) => {
  const id: string = (req.params as any).id;
  const mangaEntry = await MangaEntry.findById(id);
  const response = await mangaEntry?.getRelated("user", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(JsonApi.encode(req, response));
  }
});

export default mangaEntryRoutes
