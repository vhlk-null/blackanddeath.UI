import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export class AlbumEndpoints {
  public static GET_ALL = `${base}/library/albums`;
  public static GET_BY_ID = (id: string) => `${base}/library/albums/${id}`;
  public static GET_BY_SLUG = (slug: string) => `${base}/library/albums/slug/${slug}`;
  public static GET_NAMES = `${base}/library/albums/names`;
  public static GET_BY_BAND = (bandId: string) => `${base}/library/albums/band/${bandId}`;
  public static CREATE = `${base}/library/albums`;
  public static UPDATE = (id: string) => `${base}/library/albums/${id}`;
  public static UPDATE_COVER = (id: string) => `${base}/library/albums/${id}/cover`;
  public static DELETE = (id: string) => `${base}/library/albums/${id}`;
  public static PENDING_APPROVAL = `${base}/library/albums/pending-approval`;
}

export class BandEndpoints {
  public static GET_ALL = `${base}/library/bands`;
  public static GET_SUMMARIES = `${base}/library/bands/summaries`;
  public static GET_NAMES = `${base}/library/bands/names`;
  public static GET_BY_ID = (id: string) => `${base}/library/bands/${id}`;
  public static GET_BY_SLUG = (slug: string) => `${base}/library/bands/slug/${slug}`;
  public static CREATE = `${base}/library/bands`;
  public static UPDATE = (id: string) => `${base}/library/bands/${id}`;
  public static UPDATE_LOGO = (id: string) => `${base}/library/bands/${id}/logo`;
  public static DELETE = (id: string) => `${base}/library/bands/${id}`;
  public static PENDING_APPROVAL = `${base}/library/bands/pending-approval`;
}

export class VideoBandEndpoints {
  public static GET_ALL = `${base}/library/videos`;
  public static GET_BY_BAND = (bandId: string) => `${base}/library/bands/${bandId}/videos`;
  public static CREATE = (bandId: string) => `${base}/library/bands/${bandId}/videos`;
  public static UPDATE = (bandId: string, id: string) => `${base}/library/bands/${bandId}/videos/${id}`;
  public static DELETE = (bandId: string, id: string) => `${base}/library/bands/${bandId}/videos/${id}`;
  public static PENDING_APPROVAL = `${base}/library/video-bands/pending-approval`;
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

export class AdminEndpoints {
  public static GET_ALL_ALBUMS = `${base}/library/admin/albums`;
  public static GET_ALBUM_BY_ID = (id: string) => `${base}/library/admin/albums/${id}`;
  public static GET_ALL_BANDS = `${base}/library/admin/bands`;
  public static GET_BAND_BY_ID = (id: string) => `${base}/library/admin/bands/${id}`;
  public static GET_ALL_VIDEOS = `${base}/library/admin/videos`;
  public static GET_VIDEOS_BY_BAND = (bandId: string) => `${base}/library/admin/bands/${bandId}/videos`;
}

export class FavoriteEndpoints {
  static readonly base = environment.usercontentUrl;
  public static FAVORITE_ALBUMS = `${FavoriteEndpoints.base}/favoriteAlbums`;
  public static FAVORITE_BANDS = `${FavoriteEndpoints.base}/favoriteBands`;
  public static GET_FAVORITE_ALBUMS = (userId: string) => `${FavoriteEndpoints.base}/favoriteAlbums/${userId}`;
  public static GET_FAVORITE_BANDS = (userId: string) => `${FavoriteEndpoints.base}/favoriteBands/${userId}`;
  public static CHECK_FAVORITE_ALBUM = `${FavoriteEndpoints.base}/favoriteAlbums/check`;
  public static CHECK_FAVORITE_BAND = `${FavoriteEndpoints.base}/favoriteBands/check`;
  public static DELETE_FAVORITE_ALBUM = (albumId: string, userId: string) => `${FavoriteEndpoints.base}/favoriteAlbums?userId=${userId}&albumId=${albumId}`;
  public static DELETE_FAVORITE_BAND = (bandId: string, userId: string) => `${FavoriteEndpoints.base}/favoriteBands?userId=${userId}&bandId=${bandId}`;
  public static GET_FAVORITE_VIDEOS = (userId: string) => `${FavoriteEndpoints.base}/favoriteVideos/${userId}`;
  public static CHECK_FAVORITE_VIDEO = `${FavoriteEndpoints.base}/favoriteVideos/check`;
  public static FAVORITE_VIDEOS = `${FavoriteEndpoints.base}/favoriteVideos`;
  public static DELETE_FAVORITE_VIDEO = (videoId: string, userId: string) => `${FavoriteEndpoints.base}/favoriteVideos?userId=${userId}&videoId=${videoId}`;
}

export class ReviewEndpoints {
  static readonly base = environment.usercontentUrl;
  public static GET_ALBUM_REVIEWS = (albumId: string) => `${ReviewEndpoints.base}/album-reviews/${albumId}`;
  public static GET_ALBUM_REVIEWS_COUNT = (albumId: string) => `${ReviewEndpoints.base}/album-reviews/${albumId}/count`;
  public static GET_BAND_REVIEWS_COUNT = (bandId: string) => `${ReviewEndpoints.base}/band-reviews/${bandId}/count`;
  public static CREATE_ALBUM_REVIEW = `${ReviewEndpoints.base}/albumReviews`;
  public static DELETE_ALBUM_REVIEW = (reviewId: string) => `${ReviewEndpoints.base}/albumReviews/${reviewId}`;
  public static GET_BAND_REVIEWS = (bandId: string) => `${ReviewEndpoints.base}/band-reviews/${bandId}`;
  public static CREATE_BAND_REVIEW = `${ReviewEndpoints.base}/bandReviews`;
  public static DELETE_BAND_REVIEW = (reviewId: string) => `${ReviewEndpoints.base}/bandReviews/${reviewId}`;
}

export class RatingEndpoints {
  static readonly base = environment.usercontentUrl;
  public static RATE_ALBUM = `${RatingEndpoints.base}/albumRatings`;
  public static RATE_BAND = `${RatingEndpoints.base}/bandRatings`;
  public static GET_ALBUM_RATING = (albumId: string) => `${RatingEndpoints.base}/albumRatings/${albumId}`;
  public static GET_ALBUM_AVERAGE = (albumId: string) => `${RatingEndpoints.base}/albumRatings/${albumId}/average`;
  public static GET_BAND_RATING = (bandId: string) => `${RatingEndpoints.base}/bandRatings/${bandId}`;
  public static GET_BAND_AVERAGE = (bandId: string) => `${RatingEndpoints.base}/bandRatings/${bandId}/average`;
  public static TOP_RATED_ALBUMS = `${RatingEndpoints.base}/top-rated/albums`;
  public static TOP_RATED_BANDS = `${RatingEndpoints.base}/top-rated/bands`;
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
