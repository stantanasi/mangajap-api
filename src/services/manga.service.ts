abstract class MangaDexService {

  static async sync() {
  }
}


export default abstract class MangaService {

  static async sync() {
    await MangaDexService.sync();
  }
}
