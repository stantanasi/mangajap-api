import console from 'console';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import JsonApi from './utils/json-api/json-api';
import JsonApiError, { NotFoundError } from './utils/json-api/json-api.error';
import animeEntryRoutes from './routes/anime-entry.routes';
import animeRoutes from './routes/anime.routes';
import episodeRoutes from './routes/episode.routes';
import followRoutes from './routes/follow.routes';
import franchiseRoutes from './routes/franchise.routes';
import genreRoutes from './routes/genre.routes';
import mangaEntryRoutes from './routes/manga-entry.routes';
import mangaRoutes from './routes/manga.routes';
import peopleRoutes from './routes/people.routes';
import requestRoutes from './routes/request.routes';
import reviewRoutes from './routes/review.routes';
import seasonRoutes from './routes/season.routes';
import staffRoutes from './routes/staff.routes';
import themeRoutes from './routes/theme.routes';
import userRoutes from './routes/user.routes';
import volumeRoutes from './routes/volume.routes';
import { connect } from 'mongoose';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  if (req.method === 'POST') {
    if (req.body?.REQUEST_METHOD) {
      req.method = req.body.REQUEST_METHOD;
      req.body = req.body.data;
    }
  }
  next();
});

app.use((req, res, next) => {
  JsonApi.initialize(req, res);
  next();
});

app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length) {
    req.body = JsonApi.decode(req.body.data);
  }
  next();
});

app.use(async (req, res, next) => {
  await connect(process.env.MONGO_DB_URI!)
  next();
});

app.use('/anime', animeRoutes);
app.use('/anime-entries', animeEntryRoutes);
app.use('/episodes', episodeRoutes);
app.use('/follows', followRoutes);
app.use('/franchises', franchiseRoutes);
app.use('/genres', genreRoutes);
app.use('/manga', mangaRoutes);
app.use('/manga-entries', mangaEntryRoutes);
app.use('/people', peopleRoutes);
app.use('/requests', requestRoutes);
app.use('/reviews', reviewRoutes);
app.use('/seasons', seasonRoutes);
app.use('/staff', staffRoutes);
app.use('/themes', themeRoutes);
app.use('/users', userRoutes);
app.use('/volumes', volumeRoutes);

app.all('*', (req, res) => {
  throw new NotFoundError();
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof JsonApiError) {
    res.status(+(err.data.status || 500)).json(JsonApi.encodeError(err));
  } else {
    res.status(500).json(JsonApi.encodeError(err));
  }
});

const port = +(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
