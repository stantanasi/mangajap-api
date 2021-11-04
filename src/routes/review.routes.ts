import express from "express";
import Anime from "../models/anime.model";
import Manga from "../models/manga.model";
import Review from "../models/review.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const reviewRoutes = express.Router();

reviewRoutes.get('/', async (req, res) => {
  const [reviews, count] = await Review.findAll(JsonApi.parameters(req, Review));
  res.json(await JsonApi.encode(req, reviews, count));
});

reviewRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null) {
    throw new PermissionDenied();
  }

  const review: Review = req.body;
  review.user = user;
  const newReview = await review.create();
  res.json(await JsonApi.encode(req, newReview));
});

reviewRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const review = await Review.findById(id, JsonApi.parameters(req, Review));
  res.json(await JsonApi.encode(req, review));
});

reviewRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  const oldReview = await Review.findById((req.params as any).id)
  if (user === null || oldReview === null || user.id !== oldReview.userId) {
    throw new PermissionDenied();
  }

  const review: Review = req.body;
  const newReview = await review.update();
  res.json(await JsonApi.encode(req, newReview));
});

reviewRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  const review = await Review.findById((req.params as any).id);
  if (user === null || review === null || user.id !== review.userId) {
    throw new PermissionDenied();
  }

  await review.delete();
  res.status(204).send();
});


reviewRoutes.get('/:id(\\d+)/user', async (req, res) => {
  const id: string = (req.params as any).id;
  const review = await Review.findById(id);
  const response = await review?.getRelated("user", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

reviewRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const review = await Review.findById(id);
  const response = await review?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

reviewRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const review = await Review.findById(id);
  const response = await review?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default reviewRoutes
