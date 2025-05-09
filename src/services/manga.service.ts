import Chapter, { TChapter } from '../models/chapter.model';
import Manga from '../models/manga.model';
import Volume, { TVolume } from '../models/volume.model';
import MangaDex from '../utils/mangadex-client';
import { delay } from '../utils/utils';

abstract class MangaDexService {

  static async sync() {
    const mangadex = new MangaDex();

    const cursor = Manga.find({ 'links.mangadex': { $exists: true } })
      .populate<{ volumes: TVolume[] }>('volumes')
      .populate<{ chapters: TChapter[] }>('chapters')
      .cursor();


    // MANGAS
    for await (const manga of cursor) {
      const manga_mangadex = await mangadex.manga.get(manga.links.get('mangadex')!)
        .then((res) => res.data)
        .catch(() => null);

      if (!manga_mangadex) {
        console.error(`Can't find manga with ID: ${manga.links.get('mangadex')} - ${manga.title.get('fr-FR')}`);
        continue;
      }

      if (!manga.get('title.en-US') && manga_mangadex.attributes.title['en']) 
        manga.set('title.en-US', manga_mangadex.attributes.title['en']);
      if (!manga.get('overview.en-US') && manga_mangadex.attributes.description['en']) 
        manga.set('overview.en-US', manga_mangadex.attributes.description['en']);

      if (manga.isModified()) {
        const directModifiedPaths = manga.directModifiedPaths();
        await manga.save();
        console.log(manga.title.get('fr-FR'), '|', 'UPDATE', directModifiedPaths);
      }


      const volumes_mangadex = await mangadex.manga.aggregate(manga.links.get('mangadex')!)
        .then((res) => res.volumes);

      // VOLUMES
      for (const volume_mangadex of Object.values(volumes_mangadex)) {
        let volume = +volume_mangadex.volume && Number.isInteger(+volume_mangadex.volume)
          ? manga.volumes.find((volume) => volume.number == +volume_mangadex.volume)
          : null;

        if (volume === undefined) {
          volume = new Volume({
            number: +volume_mangadex.volume,

            manga: manga,
          });

          await volume.save();
          manga.volumes.push(volume);
          console.log(manga.title.get('fr-FR'), '|', `V${volume.number}`, '|', 'CREATE');
        } else if (volume) {
        }


        // CHAPTERS
        for (const chapter_mangadex of Object.values(volume_mangadex.chapters)) {
          let chapter = +chapter_mangadex.chapter && Number.isInteger(+chapter_mangadex.chapter)
            ? manga.chapters.find((chapter) => chapter.number == +chapter_mangadex.chapter)
            : null;

          if (chapter === undefined) {
            chapter = new Chapter({
              number: +chapter_mangadex.chapter,

              manga: manga,
              volume: volume,
            });

            await chapter.save();
            manga.chapters.push(chapter);
            console.log(manga.title.get('fr-FR'), '|', `C${chapter.number}`, '|', 'CREATE');
          } else if (chapter) {
            if (!chapter.get('volume') && volume) chapter.set('volume', volume);

            if (chapter.isModified()) {
              const directModifiedPaths = chapter.directModifiedPaths();
              await chapter.save();
              console.log(manga.title.get('fr-FR'), '|', `C${chapter.number}`, '|', 'UPDATE', '|', directModifiedPaths);
            }
          }
        }
      }

      await delay(500);
    }
  }
}


export default abstract class MangaService {

  static async sync() {
    await MangaDexService.sync();
  }
}
