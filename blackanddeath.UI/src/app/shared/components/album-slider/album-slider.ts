import { Component, input, viewChild, ElementRef, AfterViewInit, OnChanges } from '@angular/core';
import { Album } from '../../models/album';
import { AlbumCard } from '../../../features/albums/card/album-card';

@Component({
  selector: 'app-album-slider',
  imports: [AlbumCard],
  templateUrl: './album-slider.html',
  styleUrl: './album-slider.scss',
})
export class AlbumSlider implements AfterViewInit, OnChanges {
  albums = input.required<Album[]>();

  private track = viewChild<ElementRef<HTMLElement>>('track');

  ngAfterViewInit(): void {
    this.resetScroll();
  }

  ngOnChanges(): void {
    this.resetScroll();
  }

  private resetScroll(): void {
    const el = this.track()?.nativeElement;
    if (el) el.scrollLeft = 0;
  }

  scroll(direction: 'prev' | 'next'): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const cardWidth = el.querySelector('app-album-card')?.clientWidth ?? 0;
    const gap = 10; // 0.625rem ≈ 10px
    el.scrollBy({ left: direction === 'next' ? cardWidth + gap : -(cardWidth + gap), behavior: 'smooth' });
  }
}
