import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export class AlbumEndpoints {
  public static GET_ALL = `${base}/library/albums`;
  public static GET_BY_ID = (id: string) => `${base}/library/albums/${id}`;
  public static GET_BY_BAND = (bandId: string) => `${base}/library/albums/band/${bandId}`;
  public static CREATE = `${base}/library/albums`;
  public static UPDATE = (id: string) => `${base}/library/albums/${id}`;
  public static UPDATE_COVER = (id: string) => `${base}/library/albums/${id}/cover`;
  public static DELETE = (id: string) => `${base}/library/albums/${id}`;
}

export class BandEndpoints {
  public static GET_ALL = `${base}/library/bands`;
  public static GET_SUMMARIES = `${base}/library/bands/summaries`;
  public static GET_BY_ID = (id: string) => `${base}/library/bands/${id}`;
  public static CREATE = `${base}/library/bands`;
  public static UPDATE = (id: string) => `${base}/library/bands/${id}`;
  public static UPDATE_LOGO = (id: string) => `${base}/library/bands/${id}/logo`;
  public static DELETE = (id: string) => `${base}/library/bands/${id}`;
}

export class GenreEndpoints {
  public static GET_ALL = `${base}/library/genres`;
  public static GET_CARDS = `${base}/library/genre-cards`;
  public static GET_CARDS_DETAILS = `${base}/library/genre-cards-details`;
  public static CREATE_CARD = `${base}/library/genre-cards`;
  public static GET_CARD_BY_ID = (id: string) => `${base}/library/genre-cards/${id}`;
  public static UPDATE_CARD = (id: string) => `${base}/library/genre-cards/${id}`;
  public static DELETE_CARD = (id: string) => `${base}/library/genre-cards/${id}`;
  public static UPDATE_CARD_COVER = (id: string) => `${base}/library/genre-cards/${id}/cover`;
  public static GET_CARD_ALBUMS = (id: string) => `${base}/library/genre-cards/${id}/albums`;
  public static ADD_GENRE_TO_CARD = (id: string, genreId: string) => `${base}/library/genre-cards/${id}/genres/${genreId}`;
  public static REMOVE_GENRE_FROM_CARD = (id: string, genreId: string) => `${base}/library/genre-cards/${id}/genres/${genreId}`;
  public static ADD_TAG_TO_CARD = (id: string, tagId: string) => `${base}/library/genre-cards/${id}/tags/${tagId}`;
  public static REMOVE_TAG_FROM_CARD = (id: string, tagId: string) => `${base}/library/genre-cards/${id}/tags/${tagId}`;
  public static GET_BY_ID = (id: string) => `${base}/library/genres/${id}`;
  public static CREATE = `${base}/library/genres`;
  public static UPDATE = (id: string) => `${base}/library/genres/${id}`;
  public static DELETE = (id: string) => `${base}/library/genres/${id}`;
}

export class CountryEndpoints {
  public static GET_ALL = `${base}/library/countries`;
  public static GET_BY_ID = (id: string) => `${base}/library/countries/${id}`;
  public static CREATE = `${base}/library/countries`;
  public static UPDATE = (id: string) => `${base}/library/countries/${id}`;
  public static DELETE = (id: string) => `${base}/library/countries/${id}`;
}

export class TagEndpoints {
  public static GET_ALL = `${base}/library/tags`;
  public static GET_BY_ID = (id: string) => `${base}/library/tags/${id}`;
  public static CREATE = `${base}/library/tags`;
  public static UPDATE = (id: string) => `${base}/library/tags/${id}`;
  public static DELETE = (id: string) => `${base}/library/tags/${id}`;
}

export class LabelEndpoints {
  public static GET_ALL = `${base}/library/labels`;
  public static GET_BY_ID = (id: string) => `${base}/library/labels/${id}`;
  public static CREATE = `${base}/library/labels`;
  public static UPDATE = (id: string) => `${base}/library/labels/${id}`;
  public static DELETE = (id: string) => `${base}/library/labels/${id}`;
}
