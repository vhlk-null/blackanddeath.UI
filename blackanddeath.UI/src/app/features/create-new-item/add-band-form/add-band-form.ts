import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { PasteImageDirective } from '../../../shared/directives/paste-image.directive';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BandService } from '../../services/band.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FormDirtyService } from '../../../core/services/form-dirty.service';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { CustomSelect, CustomSelectOption } from '../../../shared/components/custom-select/custom-select';
import { Band } from '../../../shared/models/band';

@Component({
  selector: 'app-add-band-form',
  imports: [Section, ReactiveFormsModule, MultiSelectInput, CustomSelect, PasteImageDirective],
  templateUrl: './add-band-form.html',
  styleUrl: './add-band-form.scss',
})
export class AddBandForm implements OnInit {
  private bandService = inject(BandService);
  private auth = inject(AuthService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private toastService = inject(ToastService);
  private formDirty = inject(FormDirtyService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly currentYear = new Date().getFullYear();
  readonly statusSelectOptions: CustomSelectOption[] = [
    { value: 'Active', label: 'Active' },
    { value: 'Disbanded', label: 'Disbanded' },
    { value: 'OnHold', label: 'On hold' },
    { value: 'Unknown', label: 'Unknown' },
    { value: 'ChangedName', label: 'Changed name' },
  ];
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
    bandName: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    formedYear: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1960), Validators.max(new Date().getFullYear())],
    }),
    bandCountries: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    bandGenres: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    status: new FormControl('Active', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    facebook: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    youtube: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    instagram: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    twitter: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    website: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.bandForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formDirty.markDirty());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.bandId = id;
    }

    forkJoin({
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      band: id ? (this.auth.isAdmin() ? this.bandService.adminGetById(id) : this.bandService.getById(id)) : of(null),
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
      bandGenres: band.genres?.map(g => g.id) ?? [],
      status: band.status ?? 'Unknown',
    });
  }

  get bandName() { return this.bandForm.get('bandName')!; }
  get formedYear() { return this.bandForm.get('formedYear')!; }
  get bandCountries() { return this.bandForm.get('bandCountries')!; }
  get bandGenres() { return this.bandForm.get('bandGenres')!; }
  get status() { return this.bandForm.get('status')!; }
  get facebook() { return this.bandForm.get('facebook')!; }
  get youtube() { return this.bandForm.get('youtube')!; }
  get instagram() { return this.bandForm.get('instagram')!; }
  get twitter() { return this.bandForm.get('twitter')!; }
  get website() { return this.bandForm.get('website')!; }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.onImagePasted(file);
  }

  onImagePasted(file: File): void {
    this.logoFile = file;
    this.logoError = false;
    this.previewUrl = URL.createObjectURL(file);
  }

  onFormEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.bandForm.invalid) {
      this.bandForm.markAllAsTouched();
      return;
    }

    const v = this.bandForm.getRawValue();

    const dto = {
      name: v.bandName.trim(),
      formedYear: v.formedYear!,
      countryIds: v.bandCountries,
      genreIds: v.bandGenres,
      status: v.status,
      facebook: v.facebook.trim(),
      youtube: v.youtube.trim(),
      instagram: v.instagram.trim(),
      twitter: v.twitter.trim(),
      website: v.website.trim(),
    };

    this.submitting = true;

    const request$ = this.editMode
      ? this.bandService.update(this.bandId!, dto, this.logoFile)
      : this.bandService.create(dto, this.logoFile);

    request$.subscribe({
      next: (band) => {
        if (this.editMode) {
          this.toastService.success('Band updated successfully!');
          this.router.navigate(['/bands', band?.slug ?? this.bandSlug]);
        } else {
          this.toastService.success('Band published successfully!');
          this.bandForm.reset();
          this.formDirty.markClean();
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

  onDelete(): void {
    if (!confirm(`Delete this band? This cannot be undone.`)) return;
    this.bandService.delete(this.bandId!).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.toastService.error('Failed to delete band.'),
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
