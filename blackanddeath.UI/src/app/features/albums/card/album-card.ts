import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../../shared/models/album';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { TitleCaseAllPipe } from '../../../shared/pipes/title-case.pipe';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink, TitleCaseAllPipe],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
})
export class AlbumCard {
  albumCard = input.required<Album>();
  readonly imageError = signal(false);

  readonly typeLabels: Record<AlbumType, string> = {
    [AlbumType.FullLength]: 'Full-Length',
    [AlbumType.EP]: 'EP',
    [AlbumType.Demo]: 'Demo',
    [AlbumType.Single]: 'Single',
    [AlbumType.Compilation]: 'Compilation',
    [AlbumType.LiveAlbum]: 'Live Album',
    [AlbumType.Split]: 'Split',
  };

  typeLabel(): string {
    return this.typeLabels[this.albumCard().type] ?? this.albumCard().type;
  }
}
