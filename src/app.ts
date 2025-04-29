import dotenv from "dotenv";
dotenv.config();

import { JsonApiError, JsonApiErrors } from "@stantanasi/mongoose-jsonapi";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/scheduler";
import { connect } from "mongoose";
import { auth } from "./firebase-app";
import { AnimeSchema } from "./models/anime.model";
import { ChapterSchema } from "./models/chapter.model";
import { EpisodeSchema } from "./models/episode.model";
import { MangaSchema } from "./models/manga.model";
import { VolumeSchema } from "./models/volume.model";
import animeEntryRoutes from "./routes/anime-entry.routes";
import animeRoutes from "./routes/anime.routes";
import changeRoutes from "./routes/change.routes";
import chapterEntryRoutes from "./routes/chapter-entry.routes";
import chapterRoutes from "./routes/chapter.routes";
import episodeEntryRoutes from "./routes/episode-entry.routes";
import episodeRoutes from "./routes/episode.routes";
import followRoutes from "./routes/follow.routes";
import franchiseRoutes from "./routes/franchise.routes";
import genreRoutes from "./routes/genre.routes";
import mangaEntryRoutes from "./routes/manga-entry.routes";
import mangaRoutes from "./routes/manga.routes";
import peopleRoutes from "./routes/people.routes";
import reviewRoutes from "./routes/review.routes";
import seasonRoutes from "./routes/season.routes";
import staffRoutes from "./routes/staff.routes";
import themeRoutes from "./routes/theme.routes";
import userRoutes from "./routes/user.routes";
import volumeEntryRoutes from "./routes/volume-entry.routes";
import volumeRoutes from "./routes/volume.routes";
import AnimeService from "./services/anime.service";
import MangaService from "./services/manga.service";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.header("Content-Type", "application/vnd.api+json");
  next();
});

app.use(async (req, res, next) => {
  try {
    await connect(process.env.MONGO_DB_URI!);
    next();
  } catch (err) {
    next(err);
  }
});

app.use(async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith("Bearer ")) {
      bearerToken = bearerToken.substring(7);
    }

    const token = await auth
      .verifyIdToken(bearerToken ?? "")
      .then((token) => {
        AnimeSchema.virtual("anime-entry", {
          ref: "AnimeEntry",
          localField: "_id",
          foreignField: "anime",
          justOne: true,
          match: {
            user: token.uid,
          },
        });

        EpisodeSchema.virtual("episode-entry", {
          ref: "EpisodeEntry",
          localField: "_id",
          foreignField: "episode",
          justOne: true,
          match: {
            user: token.uid,
          },
        });

        MangaSchema.virtual("manga-entry", {
          ref: "MangaEntry",
          localField: "_id",
          foreignField: "manga",
          justOne: true,
          match: {
            user: token.uid,
          },
        });

        VolumeSchema.virtual("volume-entry", {
          ref: "VolumeEntry",
          localField: "_id",
          foreignField: "volume",
          justOne: true,
          match: {
            user: token.uid,
          },
        });

        ChapterSchema.virtual("chapter-entry", {
          ref: "ChapterEntry",
          localField: "_id",
          foreignField: "chapter",
          justOne: true,
          match: {
            user: token.uid,
          },
        });

        return token;
      })
      .catch(() => null);

    res.locals.token = token;

    next();
  } catch (err) {
    next(err);
  }
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).send();
});

app.use("/anime", animeRoutes);
app.use("/anime-entries", animeEntryRoutes);
app.use("/changes", changeRoutes);
app.use("/chapters", chapterRoutes);
app.use("/chapter-entries", chapterEntryRoutes);
app.use("/episodes", episodeRoutes);
app.use("/episode-entries", episodeEntryRoutes);
app.use("/follows", followRoutes);
app.use("/franchises", franchiseRoutes);
app.use("/genres", genreRoutes);
app.use("/manga", mangaRoutes);
app.use("/manga-entries", mangaEntryRoutes);
app.use("/peoples", peopleRoutes);
app.use("/reviews", reviewRoutes);
app.use("/seasons", seasonRoutes);
app.use("/staff", staffRoutes);
app.use("/themes", themeRoutes);
app.use("/users", userRoutes);
app.use("/volumes", volumeRoutes);
app.use("/volume-entries", volumeEntryRoutes);

app.all("*", (req, res) => {
  throw new JsonApiError.RouteNotFoundError(req.path);
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof JsonApiErrors) {
    res.status(err.status).json(err);
  } else if (err instanceof JsonApiError) {
    const errors = new JsonApiErrors([err]);
    res.status(errors.status).json(errors);
  } else {
    const errors = JsonApiErrors.from(err);
    res.status(errors.status).json(errors);
  }
});

export const api = functions.https.onRequest(app);

export const sync = onSchedule('30 2 * * *', async (event) => {
  await connect(process.env.MONGO_DB_URI!);

  await AnimeService.sync();
  await MangaService.sync();
});
