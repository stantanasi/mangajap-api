import express from "express";
import Follow from "../models/follow.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const followRoutes = express.Router();

followRoutes.get('/', async (req, res) => {
  const [follows, count] = await Follow.findAll(JsonApi.parameters(req, Follow));
  res.json(await JsonApi.encode(req, follows, count));
});

followRoutes.post('/', async (req, res) => {
  const user = await User.fromAccessToken(req);
  if (user === null) {
    throw new PermissionDenied();
  }

  const follow: Follow = req.body;
  follow.follower = user;
  const newFollow = await follow.create();
  res.json(await JsonApi.encode(req, newFollow));
});

followRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const follow = await Follow.findById(id, JsonApi.parameters(req, Follow));
  res.json(await JsonApi.encode(req, follow));
});

followRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const oldFollow = await Follow.findById((req.params as any).id)
  if (user === null || oldFollow === null || (user.id !== oldFollow.followerId && user.id !== oldFollow.followedId)) {
    throw new PermissionDenied();
  }

  const follow: Follow = req.body;
  const newFollow = await follow.update();
  res.json(await JsonApi.encode(req, newFollow));
});

followRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const follow = await Follow.findById((req.params as any).id);
  if (user === null || follow === null || (user.id !== follow.followerId && user.id !== follow.followedId)) {
    throw new PermissionDenied();
  }

  await follow.delete();
  res.status(204).send();
});


followRoutes.get('/:id(\\d+)/follower', async (req, res) => {
  const id: string = (req.params as any).id;
  const follow = await Follow.findById(id);
  const response = await follow?.getRelated("follower", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

followRoutes.get('/:id(\\d+)/followed', async (req, res) => {
  const id: string = (req.params as any).id;
  const follow = await Follow.findById(id);
  const response = await follow?.getRelated("followed", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(await JsonApi.encode(req, response));
  }
});

export default followRoutes
