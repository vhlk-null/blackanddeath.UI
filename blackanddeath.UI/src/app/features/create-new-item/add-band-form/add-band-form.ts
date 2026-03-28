import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from '../../../shared/components/section/section';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BandService } from '../../services/band.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-add-band-form',
  imports: [Section, ReactiveFormsModule],
  templateUrl: './add-band-form.html',
  styleUrl: './add-band-form.scss',
})
export class AddBandForm {
  private bandService = inject(BandService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  previewUrl: string | null = null;
  logoFile: File | null = null;
  submitting = false;

  bandForm = new FormGroup({
    bandName: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    formedYear: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1900), Validators.max(2099)],
    }),
    country: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    genre: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    subgenres: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    label: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    styles: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    facebook: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    youtube: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    instagram: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    twitter: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    website: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
  });

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  onSubmit(): void {
    if (this.bandForm.invalid) {
      this.bandForm.markAllAsTouched();
      return;
    }

    const v = this.bandForm.getRawValue();

    this.submitting = true;

    this.bandService.create({
      name: v.bandName,
      formedYear: v.formedYear!,
      country: v.country,
      genre: v.genre,
      subgenres: v.subgenres,
      label: v.label,
      bio: v.styles,
      facebook: v.facebook,
      youtube: v.youtube,
      instagram: v.instagram,
      twitter: v.twitter,
      website: v.website,
    }, this.logoFile).subscribe({
      next: () => {
        this.toastService.success('Band published successfully!');
        this.bandForm.reset();
        this.previewUrl = null;
        this.logoFile = null;
        this.submitting = false;
      },
      error: () => {
        this.toastService.error('Failed to publish band. Please try again.');
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
