import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlbumService } from '../../services/album.servics';
import { BandService } from '../../services/band.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
import { TagService } from '../../services/tag.service';
import { ToastService } from '../../../shared/services/toast.service';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { AlbumFormat } from '../../../shared/models/enums/album-format.enum';
import { StreamingPlatform } from '../../../shared/models/enums/streaming-platform.enum';

@Component({
  selector: 'app-add-album-form',
  imports: [Section, ReactiveFormsModule, MultiSelectInput],
  templateUrl: './add-album-form.html',
  styleUrl: './add-album-form.scss',
})
export class AddAlbumForm implements OnInit {
  private albumService = inject(AlbumService);
  private bandService = inject(BandService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private tagService = inject(TagService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly albumTypeOptions = Object.values(AlbumType);

  readonly bandOptions = signal<SelectOption[]>([]);
  readonly genreOptions = signal<SelectOption[]>([]);
  readonly countryOptions = signal<SelectOption[]>([]);
  readonly labelOptions = signal<SelectOption[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  previewUrl: string | null = null;
  coverFile: File | null = null;
  coverError = false;
  submitting = false;

  albumForm = new FormGroup({
    albumName: new FormControl('Test Album', {
      validators: [Validators.required, Validators.minLength(2)],
      nonNullable: true,
    }),
    albumBands: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    albumYear: new FormControl<number | null>(2024, {
      validators: [Validators.required, Validators.min(1900), Validators.max(2099)],
    }),
    albumType: new FormControl<AlbumType>(AlbumType.FullLength, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    albumCountries: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    albumGenres: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    albumLabels: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    albumTags: new FormControl<string[]>([], {
      nonNullable: true,
    }),
    albumStyles: new FormControl('Raw, Atmospheric', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    spotify: new FormControl('https://open.spotify.com/test', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    appleMusic: new FormControl('https://music.apple.com/test', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    youtube: new FormControl('https://youtube.com/test', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    bandcamp: new FormControl('https://testband.bandcamp.com', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    forkJoin({
      bands: this.bandService.getSummaries(),
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      labels: this.labelService.getAll(),
      tags: this.tagService.getAll(),
    }).subscribe({
      next: ({ bands, genres, countries, labels, tags }) => {
        this.bandOptions.set(bands.filter(b => b.id != null).map(b => ({ id: b.id!, name: b.name })));
        this.genreOptions.set(genres);
        this.countryOptions.set(countries);
        this.labelOptions.set(labels);
        this.tagOptions.set(tags);
      },
      error: () => this.toastService.error('Failed to load metadata options.'),
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.coverFile = file;
      this.coverError = false;
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  onFormEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.coverError = !this.coverFile;

    if (this.albumForm.invalid || this.coverError) {
      this.albumForm.markAllAsTouched();
      return;
    }

    const v = this.albumForm.getRawValue();
    const streamingLinks = [];

    if (v.spotify) streamingLinks.push({ platform: StreamingPlatform.Spotify, embedCode: v.spotify });
    if (v.appleMusic) streamingLinks.push({ platform: StreamingPlatform.AppleMusic, embedCode: v.appleMusic });
    if (v.youtube) streamingLinks.push({ platform: StreamingPlatform.YouTube, embedCode: v.youtube });
    if (v.bandcamp) streamingLinks.push({ platform: StreamingPlatform.Bandcamp, embedCode: v.bandcamp });

    this.submitting = true;

    this.albumService.create({
      title: v.albumName,
      releaseDate: v.albumYear!,
      type: v.albumType,
      format: AlbumFormat.CD,
      bandIds: v.albumBands,
      countryIds: v.albumCountries,
      genreIds: v.albumGenres,
      labelIds: v.albumLabels,
      tagIds: v.albumTags,
      streamingLinks,
    }, this.coverFile).subscribe({
      next: () => {
        this.toastService.success('Album published successfully!');
        this.albumForm.reset({ albumType: AlbumType.FullLength });
        this.previewUrl = null;
        this.coverFile = null;
        this.submitting = false;
      },
      error: () => {
        this.toastService.error('Failed to publish album. Please try again.');
        this.submitting = false;
      },
    });
  }

  onCreateLabel(name: string): void {
    this.labelService.create({ name }).subscribe({
      next: (result) => {
        const newOption = { id: result.id, name };
        this.labelOptions.update(opts => [...opts, newOption]);
        const current = this.albumForm.get('albumLabels')!.value as string[];
        this.albumForm.patchValue({ albumLabels: [...current, result.id] });
      },
      error: () => this.toastService.error(`Failed to create label "${name}".`),
    });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
