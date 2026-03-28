import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BandService } from '../../services/band.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
import { ToastService } from '../../../shared/services/toast.service';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { Band } from '../../../shared/models/band';

@Component({
  selector: 'app-add-band-form',
  imports: [Section, ReactiveFormsModule, MultiSelectInput],
  templateUrl: './add-band-form.html',
  styleUrl: './add-band-form.scss',
})
export class AddBandForm implements OnInit {
  private bandService = inject(BandService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editMode = false;
  bandId: string | null = null;
  bandSlug: string | null = null;
  existingLogoUrl: string | null = null;

  previewUrl: string | null = null;
  logoFile: File | null = null;
  submitting = false;

  readonly genreOptions = signal<SelectOption[]>([]);
  readonly countryOptions = signal<SelectOption[]>([]);
  readonly labelOptions = signal<SelectOption[]>([]);

  bandForm = new FormGroup({
    bandName: new FormControl('Test Band', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    formedYear: new FormControl<number | null>(1991, {
      validators: [Validators.required, Validators.min(1900), Validators.max(2099)],
    }),
    bandCountries: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    bandGenres: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    bandLabels: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    subgenres: new FormControl('Raw, Atmospheric', {
      nonNullable: true,
    }),
    styles: new FormControl('Primitive and cold black metal with raw production', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    facebook: new FormControl('https://facebook.com/testband', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    youtube: new FormControl('https://youtube.com/@testband', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    instagram: new FormControl('https://instagram.com/testband', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    twitter: new FormControl('https://twitter.com/testband', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    website: new FormControl('https://testband.com', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.bandId = id;
    }

    forkJoin({
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      labels: this.labelService.getAll(),
      band: id ? this.bandService.getById(id) : of(null),
    }).subscribe({
      next: ({ genres, countries, labels, band }) => {
        this.genreOptions.set(genres);
        this.countryOptions.set(countries);
        this.labelOptions.set(labels);

        if (band) {
          this.patchForm(band);
        }
      },
      error: () => this.toastService.error('Failed to load data.'),
    });
  }

  private patchForm(band: Band): void {
    this.existingLogoUrl = band.logoUrl;
    this.previewUrl = band.logoUrl;
    this.bandSlug = band.slug;

    this.bandForm.patchValue({
      bandName: band.name,
      formedYear: band.formedYear,
      bandCountries: band.countries?.map(c => c.id) ?? [],
      bandGenres: band.genres?.map(g => g.id) ?? [],
      styles: band.bio ?? '',
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  onFormEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      event.preventDefault();
    }
  }

  onCreateLabel(name: string): void {
    this.labelService.create({ name }).subscribe({
      next: (result) => {
        const newOption = { id: result.id, name };
        this.labelOptions.update(opts => [...opts, newOption]);
        const current = this.bandForm.get('bandLabels')!.value as string[];
        this.bandForm.patchValue({ bandLabels: [...current, result.id] });
      },
      error: () => this.toastService.error(`Failed to create label "${name}".`),
    });
  }

  onSubmit(): void {
    if (this.bandForm.invalid) {
      this.bandForm.markAllAsTouched();
      return;
    }

    const v = this.bandForm.getRawValue();

    const dto = {
      name: v.bandName,
      formedYear: v.formedYear!,
      countryIds: v.bandCountries,
      genreIds: v.bandGenres,
      labelIds: v.bandLabels,
      subgenres: v.subgenres,
      bio: v.styles,
      facebook: v.facebook,
      youtube: v.youtube,
      instagram: v.instagram,
      twitter: v.twitter,
      website: v.website,
    };

    this.submitting = true;

    const request$ = this.editMode
      ? this.bandService.update(this.bandId!, dto)
      : this.bandService.create(dto, this.logoFile);

    request$.subscribe({
      next: () => {
        if (this.editMode) {
          this.toastService.success('Band updated successfully!');
          this.router.navigate(['/bands', this.bandId, this.bandSlug]);
        } else {
          this.toastService.success('Band published successfully!');
          this.bandForm.reset();
          this.previewUrl = null;
          this.logoFile = null;
        }
        this.submitting = false;
      },
      error: () => {
        this.toastService.error(this.editMode ? 'Failed to update band.' : 'Failed to publish band.');
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    if (this.editMode && this.bandId) {
      this.router.navigate(['/bands', this.bandId, this.bandSlug]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
