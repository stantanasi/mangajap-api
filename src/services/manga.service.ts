import Manga from "../models/manga.model";
import MangaDex from "../utils/mangadex-client";
import { delay } from "../utils/utils";

abstract class MangaDexService {

  static async sync() {
    const mangadex = new MangaDex();

    const mangas = await Manga.find({ 'links.mangadex': { $exists: true } });


    // MANGAS
    for (const manga of mangas) {
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
        console.log(manga.title.get('fr-FR'), "|", "UPDATE", directModifiedPaths);
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
