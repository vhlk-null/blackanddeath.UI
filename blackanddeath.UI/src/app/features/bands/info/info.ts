import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../../albums/card/album-card';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { ImageLightbox } from '../../../shared/components/image-lightbox/image-lightbox';
import { BandService } from '../../services/band.service';
import { Band } from '../../../shared/models/band';
import {
  BAND_INFORMATION,
  DISCOGRAPHY_TITLE,
  VIDEOS_TITLE,
  SIMILAR_BANDS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-band-info',
  imports: [Section, AlbumCard, StarRating, ImageLightbox, RouterLink],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class BandInfo implements OnInit {

  private route = inject(ActivatedRoute);
  private bandService = inject(BandService);

  readonly tabs = { info: BAND_INFORMATION };
  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    videos: VIDEOS_TITLE,
    similarBands: SIMILAR_BANDS_TITLE,
  };

  readonly lightboxSrc = signal<string | null>(null);
  readonly infoTabIndex = signal(0);
  readonly bandData = signal<Band | null>(null);
  readonly loaded = signal(false);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.bandService.getById(id).subscribe({
      next: (band) => { this.bandData.set(band); this.loaded.set(true); },
      error: (err) => console.error('Failed to load band', err),
    });
  }
}
