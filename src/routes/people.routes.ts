import express from "express";
import People from "../models/people.model";
import Staff from "../models/staff.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const peopleRoutes = express.Router();

peopleRoutes.get('/', async (req, res) => {
  const [peoples, count] = await People.findAll(JsonApi.parameters(req, People));
  res.json(await JsonApi.encode(req, peoples, count))
});

peopleRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const people: People = req.body;
  const newPeople = await people.create();
  res.json(await JsonApi.encode(req, newPeople));
});

peopleRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const people = await People.findById(id, JsonApi.parameters(req, People))
  res.json(await JsonApi.encode(req, people));
});

peopleRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const people: People = req.body;
  const newPeople = await people.update();
  res.json(await JsonApi.encode(req, newPeople));
});

peopleRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  if (user === null || !user?.isAdmin) {
    throw new PermissionDenied();
  }

  const people = new People(); 
  people.id = (req.params as any).id;
  await people.delete();
  res.status(204).send();
});


peopleRoutes.get('/:id(\\d+)/staff', async (req, res) => {
  const id: string = (req.params as any).id;
  const people = await People.findById(id);
  const response = await people?.getRelated("staff", JsonApi.parameters(req, Staff));
  if (Array.isArray(response)) {
    const [staff, count] = response;
    res.json(await JsonApi.encode(req, staff, count));
  }
});

peopleRoutes.get('/:id(\\d+)/manga-staff', async (req, res) => {
  const id: string = (req.params as any).id;
  const people = await People.findById(id);
  const response = await people?.getRelated("manga-staff", JsonApi.parameters(req, Staff));
  if (Array.isArray(response)) {
    const [staff, count] = response;
    res.json(await JsonApi.encode(req, staff, count));
  }
});

peopleRoutes.get('/:id(\\d+)/anime-staff', async (req, res) => {
  const id: string = (req.params as any).id;
  const people = await People.findById(id);
  const response = await people?.getRelated("anime-staff", JsonApi.parameters(req, Staff));
  if (Array.isArray(response)) {
    const [staff, count] = response;
    res.json(await JsonApi.encode(req, staff, count));
  }
});

export default peopleRoutes
