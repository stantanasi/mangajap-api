import express from "express";
import Anime from "../models/anime.model";
import Franchise from "../models/franchise.model";
import Manga from "../models/manga.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const franchiseRoutes = express.Router();

franchiseRoutes.get('/', async (req, res) => {
  const [franchises, count] = await Franchise.findAll(JsonApi.parameters(req, Franchise));
  res.json(await JsonApi.encode(req, franchises, count))
});

franchiseRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const franchise: Franchise = req.body;
  const newFranchise = await franchise.create();
  res.json(await JsonApi.encode(req, newFranchise));
});

franchiseRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const franchise = await Franchise.findById(id, JsonApi.parameters(req, Franchise))
  res.json(await JsonApi.encode(req, franchise));
});

franchiseRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const franchise: Franchise = req.body;
  const newFranchise = await franchise.update();
  res.json(await JsonApi.encode(req, newFranchise));
});

franchiseRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const franchise = new Franchise(); 
  franchise.id = (req.params as any).id;
  await franchise.delete();
  res.status(204).send();
});


franchiseRoutes.get('/:id(\\d+)/source', async (req, res) => {
  const id: string = (req.params as any).id;
  const franchise = await Franchise.findById(id);
  const response = await franchise?.getRelated("source", JsonApi.parameters(req, Manga)); // TODO: JsonApi.parameters(req, Anime | Manga)
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

franchiseRoutes.get('/:id(\\d+)/destination', async (req, res) => {
  const id: string = (req.params as any).id;
  const franchise = await Franchise.findById(id);
  const response = await franchise?.getRelated("destination", JsonApi.parameters(req, Anime)); // TODO: JsonApi.parameters(req, Anime | Manga)
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default franchiseRoutes
