import { Component } from '@angular/core';
import { Section } from '../../../shared/components/section/section';

@Component({
  selector: 'app-add-album-form',
  imports: [Section],
  templateUrl: './add-album-form.html',
  styleUrl: './add-album-form.scss',
})
export class AddAlbumForm {
  previewUrl: string | null = null;

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.previewUrl = URL.createObjectURL(file);
    }
  }
}
