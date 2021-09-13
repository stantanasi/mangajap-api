import express from "express";
import Request from "../models/request.model";
import User from "../models/user.model";
import JsonApi from "../utils/json-api/json-api";
import { PermissionDenied } from "../utils/json-api/json-api.error";

const requestRoutes = express.Router();

requestRoutes.get('/', async (req, res) => {
  const [requests, count] = await Request.findAll(JsonApi.parameters(req, Request));
  res.json(JsonApi.encode(req, requests, count));
});

requestRoutes.post('/', async (req, res) => {
  const user = User.fromAccessToken();
  if (user === null) {
    throw new PermissionDenied();
  }

  const request: Request = req.body;
  const newRequest = await request.create();
  res.json(JsonApi.encode(req, newRequest));
});

requestRoutes.get('/:id(\\d+)', async (req, res) => {
  const id: string = (req.params as any).id
  const request = await Request.findById(id, JsonApi.parameters(req, Request));
  res.json(JsonApi.encode(req, request));
});

requestRoutes.patch('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const oldRequest = await Request.findById((req.params as any).id);
  if (user === null || oldRequest === null || user.id !== oldRequest.userId) {
    throw new PermissionDenied();
  }

  const request: Request = req.body;
  const newRequest = await request.update();
  res.json(JsonApi.encode(req, newRequest));
});

requestRoutes.delete('/:id(\\d+)', async (req, res) => {
  const user = await User.fromAccessToken();
  const request = await Request.findById((req.params as any).id);
  if (user === null || request === null || user.id !== request.userId) {
    throw new PermissionDenied();
  }

  await request.delete();
  res.status(204).send();
});


requestRoutes.get('/:id(\\d+)/user', async (req, res) => {
  const id: string = (req.params as any).id;
  const request = await Request.findById(id);
  const response = await request?.getRelated("user", JsonApi.parameters(req, User));
  if (response && !Array.isArray(response)) {
    res.json(JsonApi.encode(req, response));
  }
});

export default requestRoutes
