import console from 'console';
import express from 'express';
import cors from 'cors';
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
import staffRoutes from './routes/staff.routes';
import themeRoutes from './routes/theme.routes';
import userRoutes from './routes/user.routes';
import volumeRoutes from './routes/volume.routes';
import JsonApi from './utils/json-api/json-api';
import seasonRoutes from './routes/season.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb'}));

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

app.get('/', (req, res) => {
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

app.listen(3000, () => {
  console.log(`Server is listening on 3000`);
});