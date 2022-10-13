import axios from 'axios';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import Chapter from '../../models/chapter.model';
import Manga from '../../models/manga.model';
import Volume from '../../models/volume.model';
import MangaDex from '../../utils/providers/mangadex';

(async () => {
  dotenv.config();

  console.log('-------- START --------');

  await connect(process.env.MONGO_DB_URI!);

  for (const manga of await Manga.find({ 'links.mangadex': { $exists: true } }).populate('volumes').populate('chapters')) {
    const mangaMD = await MangaDex.findMangaById(manga.links.mangadex);

    if (!mangaMD) return null;

    for (const volumeMD of (mangaMD.volumes ?? [])) {
      let volume = manga.volumes?.find((volume) => volume.number === volumeMD.number);

      if (volumeMD && !volume) {
        volume = new Volume({
          number: volumeMD.number,
          coverImage: volumeMD.coverImage ?
            await axios
              .get(volumeMD.coverImage, { responseType: 'arraybuffer' })
              .then(response => Buffer.from(response.data, 'binary').toString('base64')) :
            null,
          manga: manga._id,
        });
        await (volume as any).save();
        manga.volumes?.push(volume);
        console.log(manga.title, '|', 'Volume', volume.number, '|', 'CREATE');

      } else if (volume && (!volume.coverImage && volumeMD.coverImage)) {
        volume.coverImage = await axios
          .get(volumeMD.coverImage, { responseType: 'arraybuffer' })
          .then(response => Buffer.from(response.data, 'binary').toString('base64'));
        await (volume as any).save();
        console.log(manga.title, '|', 'Volume', volume.number, '|', 'UPDATE');
      }

      for (const chapterMD of (volumeMD.chapters ?? [])) {
        let chapter = manga.chapters?.find((chapter) => chapter.number == chapterMD.number);

        if (chapterMD && !chapter) {
          chapter = new Chapter({
            number: chapterMD.number,
            manga: manga._id,
            volume: volume?._id,
          });
          await (chapter as any).save();
          manga.chapters?.push(chapter);
          console.log(manga.title, '|', 'Chapter', chapter.number, '|', 'CREATE');

        } else if (chapter && (!chapter.volume && volume)) {
          chapter.volume = volume._id as any;
          await (chapter as any).save();
          console.log(manga.title, '|', 'Chapter', chapter.number, '|', 'UPDATE');
        }
      }
    }

    for (const chapterMD of (mangaMD.chapters ?? [])) {
      let chapter = manga.chapters?.find((chapter) => chapter.number == chapterMD.number);

      if (chapterMD && !chapter) {
        chapter = new Chapter({
          number: chapterMD.number,
          manga: manga._id,
        });
        await (chapter as any).save();
        console.log(manga.title, '|', 'Chapter', chapter.number, '|', 'CREATE');
      }
    }
  }

  console.log('-------- FINISHED --------');
  process.exit();
})().catch((e) => {
  console.error(e);
  process.exit();
});
