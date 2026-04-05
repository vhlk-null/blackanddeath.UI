import { Component, input } from '@angular/core';
import { VideoBand } from '../../../shared/models/video-band';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})
export class VideoCard {
  videoCard = input.required<VideoBand>();

  get thumbnailUrl(): string {
    const id = this.extractYoutubeId(this.videoCard().youtubeLink);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}
