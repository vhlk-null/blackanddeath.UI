import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Section } from '../../../shared/components/section/section';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BandService } from '../../services/band.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
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
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editMode = false;
  bandId: string | null = null;
  bandSlug: string | null = null;
  existingLogoUrl: string | null = null;

  previewUrl: string | null = null;
  logoFile: File | null = null;
  logoError = false;
  submitting = false;

  readonly genreOptions = signal<SelectOption[]>([]);
  readonly countryOptions = signal<SelectOption[]>([]);

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
    bandGenre: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    subgenreIds: new FormControl<string[]>([], {
      validators: [Validators.required],
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

  private readonly selectedGenre = toSignal(
    this.bandForm.get('bandGenre')!.valueChanges,
    { initialValue: '' }
  );
  readonly subgenreOptions = computed(() =>
    this.genreOptions().filter(g => g.id !== this.selectedGenre())
  );

  constructor() {
    effect(() => {
      const genreId = this.selectedGenre();
      if (!genreId) return;
      const current = this.bandForm.get('subgenreIds')!.value as string[];
      if (current.includes(genreId)) {
        this.bandForm.patchValue({ subgenreIds: current.filter(id => id !== genreId) });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.bandId = id;
    }

    forkJoin({
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      band: id ? this.bandService.getById(id) : of(null),
    }).subscribe({
      next: ({ genres, countries, band }) => {
        this.genreOptions.set(genres);
        this.countryOptions.set(countries);

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
      bandGenre: band.parentGenre?.id ?? '',
      subgenreIds: band.subgenres?.map(g => g.id) ?? [],
      styles: band.bio ?? '',
    });
  }

  get bandName() { return this.bandForm.get('bandName')!; }
  get formedYear() { return this.bandForm.get('formedYear')!; }
  get bandCountries() { return this.bandForm.get('bandCountries')!; }
  get bandGenre() { return this.bandForm.get('bandGenre')!; }
  get subgenreIds() { return this.bandForm.get('subgenreIds')!; }
  get styles() { return this.bandForm.get('styles')!; }
  get facebook() { return this.bandForm.get('facebook')!; }
  get youtube() { return this.bandForm.get('youtube')!; }
  get instagram() { return this.bandForm.get('instagram')!; }
  get twitter() { return this.bandForm.get('twitter')!; }
  get website() { return this.bandForm.get('website')!; }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      this.logoError = false;
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  onFormEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.logoError = !this.logoFile && !this.existingLogoUrl;

    if (this.bandForm.invalid || this.logoError) {
      this.bandForm.markAllAsTouched();
      return;
    }

    const v = this.bandForm.getRawValue();

    const dto = {
      name: v.bandName,
      formedYear: v.formedYear!,
      countryIds: v.bandCountries,
      genreId: v.bandGenre,
      subgenreIds: v.subgenreIds,
      bio: v.styles,
      facebook: v.facebook,
      youtube: v.youtube,
      instagram: v.instagram,
      twitter: v.twitter,
      website: v.website,
    };

    this.submitting = true;

    const request$ = this.editMode
      ? this.bandService.update(this.bandId!, dto, this.logoFile)
      : this.bandService.create(dto, this.logoFile);

    request$.subscribe({
      next: (band) => {
        if (this.editMode) {
          this.toastService.success('Band updated successfully!');
          this.router.navigate(['/bands', this.bandId, band?.slug ?? this.bandSlug]);
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
