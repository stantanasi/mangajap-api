abstract class TMDbService {

  static async sync() {
  }
}


export default abstract class AnimeService {

  static async sync() {
    await TMDbService.sync();
  }
}
