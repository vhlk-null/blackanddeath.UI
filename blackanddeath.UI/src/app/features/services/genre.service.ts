import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { GenreEndpoints } from "../../shared/constants/endpoints";
import { Genre } from "../../shared/models/genre";
import { Album } from "../../shared/models/album";

@Injectable({ providedIn: 'root' })
export class GenreService {

  private http = inject(BaseHttpService);

  createCard(dto: { name: string; description: string }) {
    return this.http.post<{ id: string; name: string; description: string; coverUrl: string | null }>(GenreEndpoints.CREATE_CARD, dto);
  }

  getCards() {
    return this.http.get<{ id: string; name: string; description: string; coverUrl: string | null; genres: { id: string; name: string }[]; tags: { id: string; name: string }[] }[]>(GenreEndpoints.GET_CARDS);
  }

  getCardsDetails() {
    return this.http.get<{ id: string; name: string; description: string; coverUrl: string | null; genres: { id: string; name: string }[]; tags: { id: string; name: string }[] }[]>(GenreEndpoints.GET_CARDS_DETAILS);
  }


  deleteCard(cardId: string) {
    return this.http.delete<void>(GenreEndpoints.DELETE_CARD(cardId));
  }

  getCardById(id: string) {
    return this.http.get<{ id: string; name: string; genres: { id: string; name: string }[]; tags: { id: string; name: string }[] }>(GenreEndpoints.GET_CARD_BY_ID(id));
  }

  getCardAlbums(id: string) {
    return this.http.get<Album[]>(GenreEndpoints.GET_CARD_ALBUMS(id));
  }

  updateCard(cardId: string, dto: { name: string; description: string; orderNumber?: number | null; genreIds: string[]; tagIds: string[]; coverImage?: File | null }) {
    const form = new FormData();
    form.append('name', dto.name);
    form.append('description', dto.description);
    if (dto.orderNumber != null) form.append('orderNumber', String(dto.orderNumber));
    dto.genreIds.forEach(id => form.append('genreIds', id));
    dto.tagIds.forEach(id => form.append('tagIds', id));
    if (dto.coverImage) {
      form.append('coverImage', dto.coverImage, dto.coverImage.name);
    }
    return this.http.put<void>(GenreEndpoints.UPDATE_CARD(cardId), form);
  }

  addGenreToCard(cardId: string, genreId: string) {
    return this.http.post<void>(GenreEndpoints.ADD_GENRE_TO_CARD(cardId, genreId), {});
  }

  removeGenreFromCard(cardId: string, genreId: string) {
    return this.http.delete<void>(GenreEndpoints.REMOVE_GENRE_FROM_CARD(cardId, genreId));
  }

  addTagToCard(cardId: string, tagId: string) {
    return this.http.post<void>(GenreEndpoints.ADD_TAG_TO_CARD(cardId, tagId), {});
  }

  removeTagFromCard(cardId: string, tagId: string) {
    return this.http.delete<void>(GenreEndpoints.REMOVE_TAG_FROM_CARD(cardId, tagId));
  }

  getAll() {
    return this.http.get<{ genres: Genre[] }>(GenreEndpoints.GET_ALL).pipe(
      map(response => response.genres)
    );
  }

  getById(id: string) {
    return this.http.get<Genre>(GenreEndpoints.GET_BY_ID(id));
  }

  create(payload: Omit<Genre, 'id'>) {
    return this.http.post<Genre>(GenreEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Genre, 'id'>>) {
    return this.http.put<Genre>(GenreEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(GenreEndpoints.DELETE(id));
  }
}
