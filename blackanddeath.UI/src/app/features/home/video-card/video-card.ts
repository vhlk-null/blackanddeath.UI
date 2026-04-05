import { Component, input, signal } from '@angular/core';
import { VideoBand } from '../../../shared/models/video-band';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-video-card',
  imports: [SafeUrlPipe],
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})
export class VideoCard {
  videoCard = input.required<VideoBand>();
  playing = signal(false);

  get youtubeId(): string | null {
    return this.extractYoutubeId(this.videoCard().youtubeLink);
  }

  get thumbnailUrl(): string {
    const id = this.youtubeId;
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  }

  get embedUrl(): string {
    return `https://www.youtube.com/embed/${this.youtubeId}?autoplay=1`;
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}
