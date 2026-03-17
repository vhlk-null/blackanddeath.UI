import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export class AlbumEndpoints {
  public static GET_ALL = `${base}/library/albums`;
  public static GET_BY_ID = (id: string) => `${base}/library/albums/${id}`;
  public static GET_BY_BAND = (bandId: string) => `${base}/library/albums/band/${bandId}`;
  public static CREATE = `${base}/library/albums`;
  public static UPDATE = (id: string) => `${base}/library/albums/${id}`;
  public static DELETE = (id: string) => `${base}/library/albums/${id}`;
}

export class BandEndpoints {
  public static GET_ALL = `${base}/bands`;
  public static GET_BY_ID = (id: string) => `${base}/bands/${id}`;
  public static CREATE = `${base}/bands`;
  public static UPDATE = (id: string) => `${base}/bands/${id}`;
  public static DELETE = (id: string) => `${base}/bands/${id}`;
}

export class GenreEndpoints {
  public static GET_ALL = `${base}/genres`;
  public static GET_BY_ID = (id: string) => `${base}/genres/${id}`;
  public static CREATE = `${base}/genres`;
  public static UPDATE = (id: string) => `${base}/genres/${id}`;
  public static DELETE = (id: string) => `${base}/genres/${id}`;
}
