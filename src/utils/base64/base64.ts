import axios from 'axios';

export default abstract class Base64 {

  static async fromImageURL(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  }
}
