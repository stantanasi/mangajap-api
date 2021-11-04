import express from "express";
import Anime from "../models/anime.model";
import Manga from "../models/manga.model";
import People from "../models/people.model";
import Staff from "../models/staff.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const staffRoutes = express.Router();

staffRoutes.get('/', async (req, res) => {
  const [staffs, count] = await Staff.findAll(JsonApi.parameters(req, Staff));
  res.json(await JsonApi.encode(req, staffs, count))
});

staffRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const staff: Staff = req.body;
  const newStaff = await staff.create();
  res.json(await JsonApi.encode(req, newStaff));
});

staffRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const staff = await Staff.findById(id, JsonApi.parameters(req, Staff))
  res.json(await JsonApi.encode(req, staff));
});

staffRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const staff: Staff = req.body;
  const newStaff = await staff.update();
  res.json(await JsonApi.encode(req, newStaff));
});

staffRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const staff = new Staff(); 
  staff.id = (req.params as any).id;
  await staff.delete();
  res.status(204).send();
});


staffRoutes.get('/:id(\\d+)/people', async (req, res) => {
  const id: string = (req.params as any).id;
  const staff = await Staff.findById(id);
  const response = await staff?.getRelated("people", JsonApi.parameters(req, People));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

staffRoutes.get('/:id(\\d+)/manga', async (req, res) => {
  const id: string = (req.params as any).id;
  const staff = await Staff.findById(id);
  const response = await staff?.getRelated("manga", JsonApi.parameters(req, Manga));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

staffRoutes.get('/:id(\\d+)/anime', async (req, res) => {
  const id: string = (req.params as any).id;
  const staff = await Staff.findById(id);
  const response = await staff?.getRelated("anime", JsonApi.parameters(req, Anime));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default staffRoutes
