import { Component } from '@angular/core';
import { Section } from '../../../shared/components/section/section';

@Component({
  selector: 'app-add-band-form',
  imports: [Section],
  templateUrl: './add-band-form.html',
  styleUrl: './add-band-form.scss',
})
export class AddBandForm {
  previewUrl: string | null = null;

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.previewUrl = URL.createObjectURL(file);
    }
  }
}
