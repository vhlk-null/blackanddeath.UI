import { AppConfigService } from '../../core/services/app-config.service';

let _configService: AppConfigService;

export function initEndpoints(config: AppConfigService): void {
  _configService = config;
}

function base(): string { return _configService.apiUrl; }
function uc(): string { return _configService.usercontentUrl; }

export class AlbumEndpoints {
  static get GET_ALL() { return `${base()}/library/albums`; }
  static GET_BY_ID = (id: string) => `${base()}/library/albums/${id}`;
  static GET_BY_SLUG = (slug: string) => `${base()}/library/albums/slug/${slug}`;
  static get GET_NAMES() { return `${base()}/library/albums/names`; }
  static GET_BY_BAND = (bandId: string) => `${base()}/library/albums/band/${bandId}`;
  static get CREATE() { return `${base()}/library/albums`; }
  static UPDATE = (id: string) => `${base()}/library/albums/${id}`;
  static UPDATE_COVER = (id: string) => `${base()}/library/albums/${id}/cover`;
  static DELETE = (id: string) => `${base()}/library/albums/${id}`;
  static get PENDING_APPROVAL() { return `${base()}/library/albums/pending-approval`; }
  static get GET_UPCOMING() { return `${base()}/library/albums/upcoming`; }
  static get SEARCH() { return `${base()}/library/albums/search`; }
  static get TOP_RATED() { return `${base()}/library/albums/top-rated`; }
}

export class BandEndpoints {
  static get GET_ALL() { return `${base()}/library/bands`; }
  static get GET_SUMMARIES() { return `${base()}/library/bands/summaries`; }
  static get GET_NAMES() { return `${base()}/library/bands/names`; }
  static GET_BY_ID = (id: string) => `${base()}/library/bands/${id}`;
  static GET_BY_SLUG = (slug: string) => `${base()}/library/bands/slug/${slug}`;
  static get CREATE() { return `${base()}/library/bands`; }
  static UPDATE = (id: string) => `${base()}/library/bands/${id}`;
  static UPDATE_LOGO = (id: string) => `${base()}/library/bands/${id}/logo`;
  static DELETE = (id: string) => `${base()}/library/bands/${id}`;
  static get PENDING_APPROVAL() { return `${base()}/library/bands/pending-approval`; }
  static get SEARCH() { return `${base()}/library/bands/search`; }
  static get TOP_RATED() { return `${base()}/library/bands/top-rated`; }
}

export class VideoBandEndpoints {
  static get GET_ALL() { return `${base()}/library/videos`; }
  static CREATE = (bandId: string) => `${base()}/library/bands/${bandId}/videos`;
  static UPDATE = (bandId: string, id: string) => `${base()}/library/bands/${bandId}/videos/${id}`;
  static DELETE = (bandId: string, id: string) => `${base()}/library/bands/${bandId}/videos/${id}`;
  static get PENDING_APPROVAL() { return `${base()}/library/video-bands/pending-approval`; }
}

export class GenreEndpoints {
  static get GET_ALL() { return `${base()}/library/genres`; }
  static get GET_CARDS() { return `${base()}/library/genre-cards`; }
  static get GET_CARDS_DETAILS() { return `${base()}/library/genre-cards-details`; }
  static get CREATE_CARD() { return `${base()}/library/genre-cards`; }
  static GET_CARD_BY_ID = (id: string) => `${base()}/library/genre-cards/${id}`;
  static UPDATE_CARD = (id: string) => `${base()}/library/genre-cards/${id}`;
  static DELETE_CARD = (id: string) => `${base()}/library/genre-cards/${id}`;
  static UPDATE_CARD_COVER = (id: string) => `${base()}/library/genre-cards/${id}/cover`;
  static GET_CARD_ALBUMS = (id: string) => `${base()}/library/genre-cards/${id}/albums`;
  static ADD_GENRE_TO_CARD = (id: string, genreId: string) => `${base()}/library/genre-cards/${id}/genres/${genreId}`;
  static REMOVE_GENRE_FROM_CARD = (id: string, genreId: string) => `${base()}/library/genre-cards/${id}/genres/${genreId}`;
  static ADD_TAG_TO_CARD = (id: string, tagId: string) => `${base()}/library/genre-cards/${id}/tags/${tagId}`;
  static REMOVE_TAG_FROM_CARD = (id: string, tagId: string) => `${base()}/library/genre-cards/${id}/tags/${tagId}`;
  static get REORDER_CARDS() { return `${base()}/library/genre-cards/reorder`; }
  static get CREATE() { return `${base()}/library/genres`; }
  static UPDATE = (id: string) => `${base()}/library/genres/${id}`;
  static DELETE = (id: string) => `${base()}/library/genres/${id}`;
}

export class AdminEndpoints {
  static get GET_ALL_ALBUMS() { return `${base()}/library/admin/albums`; }
  static GET_ALBUM_BY_ID = (id: string) => `${base()}/library/admin/albums/${id}`;
  static get GET_ALL_BANDS() { return `${base()}/library/admin/bands`; }
  static GET_BAND_BY_ID = (id: string) => `${base()}/library/admin/bands/${id}`;
  static get GET_ALL_VIDEOS() { return `${base()}/library/admin/videos`; }
  static get IMPORT_BAND() { return `${base()}/library/admin/import/band`; }
  static get IMPORT_BAND_SEARCH() { return `${base()}/library/admin/import/band/search`; }
  static get IMPORT_BAND_PREVIEW() { return `${base()}/library/admin/import/band/preview`; }
  static get IMPORT_BAND_STREAM() { return `${base()}/library/admin/import/band/stream`; }
  static get IMPORT_BAND_STATUS() { return `${base()}/library/admin/import/band/status`; }
  static GET_ALL_USERS = (pageIndex: number, pageSize: number) => `${uc()}/admin/users?pageIndex=${pageIndex}&pageSize=${pageSize}`;
}

export class FavoriteEndpoints {
  static get FAVORITE_ALBUMS() { return `${uc()}/favoriteAlbums`; }
  static get FAVORITE_BANDS() { return `${uc()}/favoriteBands`; }
  static GET_FAVORITE_ALBUMS = (userId: string) => `${uc()}/favoriteAlbums/${userId}`;
  static GET_FAVORITE_BANDS = (userId: string) => `${uc()}/favoriteBands/${userId}`;
  static get CHECK_FAVORITE_ALBUM() { return `${uc()}/favoriteAlbums/check`; }
  static get CHECK_FAVORITE_BAND() { return `${uc()}/favoriteBands/check`; }
  static DELETE_FAVORITE_ALBUM = (albumId: string, userId: string) => `${uc()}/favoriteAlbums?userId=${userId}&albumId=${albumId}`;
  static DELETE_FAVORITE_BAND = (bandId: string, userId: string) => `${uc()}/favoriteBands?userId=${userId}&bandId=${bandId}`;
  static get REORDER_FAVORITE_ALBUMS() { return `${uc()}/favoriteAlbums/reorder`; }
  static get REORDER_FAVORITE_BANDS() { return `${uc()}/favoriteBands/reorder`; }
  static GET_FAVORITE_VIDEOS = (userId: string) => `${uc()}/favoriteVideos/${userId}`;
  static get CHECK_FAVORITE_VIDEO() { return `${uc()}/favoriteVideos/check`; }
  static get FAVORITE_VIDEOS() { return `${uc()}/favoriteVideos`; }
  static DELETE_FAVORITE_VIDEO = (videoId: string, userId: string) => `${uc()}/favoriteVideos?userId=${userId}&videoId=${videoId}`;
}

export class ReviewEndpoints {
  static GET_ALBUM_REVIEWS = (albumId: string) => `${uc()}/album-reviews/${albumId}`;
  static GET_ALBUM_REVIEWS_COUNT = (albumId: string) => `${uc()}/album-reviews/${albumId}/count`;
  static GET_BAND_REVIEWS = (bandId: string) => `${uc()}/band-reviews/${bandId}`;
  static GET_BAND_REVIEWS_COUNT = (bandId: string) => `${uc()}/band-reviews/${bandId}/count`;
  static get CREATE_ALBUM_REVIEW() { return `${uc()}/album-reviews`; }
  static UPDATE_ALBUM_REVIEW = (reviewId: string) => `${uc()}/album-reviews/${reviewId}`;
  static DELETE_ALBUM_REVIEW = (reviewId: string) => `${uc()}/album-reviews/${reviewId}`;
  static get CREATE_BAND_REVIEW() { return `${uc()}/band-reviews`; }
  static UPDATE_BAND_REVIEW = (reviewId: string) => `${uc()}/band-reviews/${reviewId}`;
  static DELETE_BAND_REVIEW = (reviewId: string) => `${uc()}/band-reviews/${reviewId}`;
}

export class CommentEndpoints {
  static GET_ALBUM_COMMENTS = (albumId: string) => `${uc()}/album-comments/${albumId}`;
  static get CREATE_ALBUM_COMMENT() { return `${uc()}/album-comments`; }
  static UPDATE_ALBUM_COMMENT = (commentId: string) => `${uc()}/album-comments/${commentId}`;
  static DELETE_ALBUM_COMMENT = (commentId: string) => `${uc()}/album-comments/${commentId}`;
  static REACT_ALBUM_COMMENT = (commentId: string) => `${uc()}/album-comments/${commentId}/reactions`;
  static DELETE_ALBUM_COMMENT_REACTION = (commentId: string, userId: string) => `${uc()}/album-comments/${commentId}/reactions/${userId}`;
  static GET_BAND_COMMENTS = (bandId: string) => `${uc()}/band-comments/${bandId}`;
  static get CREATE_BAND_COMMENT() { return `${uc()}/band-comments`; }
  static UPDATE_BAND_COMMENT = (commentId: string) => `${uc()}/band-comments/${commentId}`;
  static DELETE_BAND_COMMENT = (commentId: string) => `${uc()}/band-comments/${commentId}`;
  static REACT_BAND_COMMENT = (commentId: string) => `${uc()}/band-comments/${commentId}/reactions`;
  static DELETE_BAND_COMMENT_REACTION = (commentId: string, userId: string) => `${uc()}/band-comments/${commentId}/reactions/${userId}`;
}

export class UserProfileEndpoints {
  static GET_PROFILE = (userId: string) => `${uc()}/profile/${userId}`;
}

export class CollectionEndpoints {
  static GET_BY_USER = (userId: string) => `${uc()}/collections/user/${userId}`;
  static GET_BY_ID = (id: string) => `${uc()}/collections/${id}`;
  static get CREATE() { return `${uc()}/collections`; }
  static UPDATE = (id: string) => `${uc()}/collections/${id}`;
  static DELETE = (id: string) => `${uc()}/collections/${id}`;
  static ADD_ALBUM = (id: string) => `${uc()}/collections/${id}/albums`;
  static REMOVE_ALBUM = (id: string, albumId: string) => `${uc()}/collections/${id}/albums/${albumId}`;
  static ADD_BAND = (id: string) => `${uc()}/collections/${id}/bands`;
  static REMOVE_BAND = (id: string, bandId: string) => `${uc()}/collections/${id}/bands/${bandId}`;
  static REORDER_ALBUMS = (id: string) => `${uc()}/collections/${id}/albums/reorder`;
  static REORDER_BANDS = (id: string) => `${uc()}/collections/${id}/bands/reorder`;
}

export class RatingEndpoints {
  static RATE_ALBUM = (albumId: string) => `${base()}/library/albums/${albumId}/rating`;
  static RATE_BAND = (bandId: string) => `${base()}/library/bands/${bandId}/rating`;
  static GET_ALBUM_RATING = (albumId: string) => `${base()}/library/albums/${albumId}/rating`;
  static GET_ALBUM_AVERAGE = (albumId: string) => `${base()}/library/albums/${albumId}/rating`;
  static GET_BAND_RATING = (bandId: string) => `${base()}/library/bands/${bandId}/rating`;
  static GET_BAND_AVERAGE = (bandId: string) => `${base()}/library/bands/${bandId}/rating`;
}

export class CountryEndpoints {
  static get GET_ALL() { return `${base()}/library/countries`; }
  static get CREATE() { return `${base()}/library/countries`; }
  static UPDATE = (id: string) => `${base()}/library/countries/${id}`;
  static DELETE = (id: string) => `${base()}/library/countries/${id}`;
}

export class TagEndpoints {
  static get GET_ALL() { return `${base()}/library/tags`; }
  static get CREATE() { return `${base()}/library/tags`; }
  static UPDATE = (id: string) => `${base()}/library/tags/${id}`;
  static DELETE = (id: string) => `${base()}/library/tags/${id}`;
}

export class LabelEndpoints {
  static get GET_ALL() { return `${base()}/library/labels`; }
  static get CREATE() { return `${base()}/library/labels`; }
  static UPDATE = (id: string) => `${base()}/library/labels/${id}`;
  static DELETE = (id: string) => `${base()}/library/labels/${id}`;
}
