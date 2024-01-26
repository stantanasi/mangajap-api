import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { connect } from "mongoose";
import cors from "cors";
import { auth } from "./firebase-app";
import { JsonApiError, JsonApiErrors } from "./utils/mongoose-jsonapi/mongoose-jsonapi";
import { AnimeSchema } from "./models/anime.model";
import { EpisodeSchema } from "./models/episode.model";
import { MangaSchema } from "./models/manga.model";
import animeEntryRoutes from "./routes/anime-entry.routes";
import animeRoutes from "./routes/anime.routes";
import chapterRoutes from "./routes/chapter.routes";
import episodeRoutes from "./routes/episode.routes";
import episodeEntryRoutes from "./routes/episode-entry.routes";
import followRoutes from "./routes/follow.routes";
import franchiseRoutes from "./routes/franchise.routes";
import genreRoutes from "./routes/genre.routes";
import mangaEntryRoutes from "./routes/manga-entry.routes";
import mangaRoutes from "./routes/manga.routes";
import peopleRoutes from "./routes/people.routes";
import requestRoutes from "./routes/request.routes";
import reviewRoutes from "./routes/review.routes";
import seasonRoutes from "./routes/season.routes";
import staffRoutes from "./routes/staff.routes";
import themeRoutes from "./routes/theme.routes";
import userRoutes from "./routes/user.routes";
import volumeRoutes from "./routes/volume.routes";

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

        return token;
      })
      .catch(() => null);

    res.locals.token = token;

    next();
  } catch (err) {
    next(err);
  }
});

app.get("/favicon.ico", (req, res) => res.status(204).send());

app.use("/anime", animeRoutes);
app.use("/anime-entries", animeEntryRoutes);
app.use("/chapters", chapterRoutes);
app.use("/episodes", episodeRoutes);
app.use("/episode-entries", episodeEntryRoutes);
app.use("/follows", followRoutes);
app.use("/franchises", franchiseRoutes);
app.use("/genres", genreRoutes);
app.use("/manga", mangaRoutes);
app.use("/manga-entries", mangaEntryRoutes);
app.use("/peoples", peopleRoutes);
app.use("/requests", requestRoutes);
app.use("/reviews", reviewRoutes);
app.use("/seasons", seasonRoutes);
app.use("/staff", staffRoutes);
app.use("/themes", themeRoutes);
app.use("/users", userRoutes);
app.use("/volumes", volumeRoutes);

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

const port = +(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
