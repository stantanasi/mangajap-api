import express from "express";
import AnimeEntry from "../models/anime-entry.model";
import Anime from "../models/anime.model";
import Episode from "../models/episode.model";
import Franchise from "../models/franchise.model";
import Genre from "../models/genre.model";
import Review from "../models/review.model";
import Season from "../models/season.model";
import Staff from "../models/staff.model";
import Theme from "../models/theme.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const animeRoutes = express.Router();

animeRoutes.get('/', async (req, res) => {
  const [animes, count] = await Anime.findAll(JsonApi.parameters(req, Anime));
  res.json(await JsonApi.encode(req, animes, count))
});

animeRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const anime: Anime = req.body;
  const newAnime = await anime.create();
  res.json(await JsonApi.encode(req, newAnime));
});

animeRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const anime = await Anime.findById(id, JsonApi.parameters(req, Anime))
  res.json(await JsonApi.encode(req, anime));
});

animeRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const anime: Anime = req.body;
  const newAnime = await anime.update();
  res.json(await JsonApi.encode(req, newAnime));
});

animeRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const anime: Anime = new Anime(); 
  anime.id = (req.params as any).id;
  await anime.delete();
  res.status(204).send();
});


animeRoutes.get('/:id(\\d+)/seasons', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("seasons", JsonApi.parameters(req, Season));
  if (Array.isArray(response)) {
    const [seasons, count] = response;
    res.json(await JsonApi.encode(req, seasons, count));
  }
});

animeRoutes.get('/:id(\\d+)/episodes', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("episodes", JsonApi.parameters(req, Episode));
  if (Array.isArray(response)) {
    const [episodes, count] = response;
    res.json(await JsonApi.encode(req, episodes, count));
  }
});

animeRoutes.get('/:id(\\d+)/genres', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("genres", JsonApi.parameters(req, Genre));
  if (Array.isArray(response)) {
    const [genres, count] = response;
    res.json(await JsonApi.encode(req, genres, count));
  }
});

animeRoutes.get('/:id(\\d+)/themes', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("themes", JsonApi.parameters(req, Theme));
  if (Array.isArray(response)) {
    const [themes, count] = response;
    res.json(await JsonApi.encode(req, themes, count));
  }
});

animeRoutes.get('/:id(\\d+)/staff', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("staff", JsonApi.parameters(req, Staff));
  if (Array.isArray(response)) {
    const [staff, count] = response;
    res.json(await JsonApi.encode(req, staff, count));
  }
});

animeRoutes.get('/:id(\\d+)/reviews', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("reviews", JsonApi.parameters(req, Review));
  if (Array.isArray(response)) {
    const [reviews, count] = response;
    res.json(await JsonApi.encode(req, reviews, count));
  }
});

animeRoutes.get('/:id(\\d+)/franchise', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("franchise", JsonApi.parameters(req, Franchise));
  if (Array.isArray(response)) {
    const [franchise, count] = response;
    res.json(await JsonApi.encode(req, franchise, count));
  }
});

animeRoutes.get('/:id(\\d+)/anime-entry', async (req, res) => {
  const id: string = (req.params as any).id;
  const anime = await Anime.findById(id);
  const response = await anime?.getRelated("animeEntry", JsonApi.parameters(req, AnimeEntry));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default animeRoutes
