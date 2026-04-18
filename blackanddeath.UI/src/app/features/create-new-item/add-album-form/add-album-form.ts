import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlbumService } from '../../services/album.servics';
import { AuthService } from '../../../core/auth/auth.service';
import { BandService } from '../../services/band.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
import { TagService } from '../../services/tag.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FormDirtyService } from '../../../core/services/form-dirty.service';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { CustomSelect, CustomSelectOption } from '../../../shared/components/custom-select/custom-select';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { AlbumFormat } from '../../../shared/models/enums/album-format.enum';
import { StreamingPlatform } from '../../../shared/models/enums/streaming-platform.enum';
import { Album } from '../../../shared/models/album';

@Component({
  selector: 'app-add-album-form',
  imports: [Section, ReactiveFormsModule, FormsModule, MultiSelectInput, CustomSelect],
  templateUrl: './add-album-form.html',
  styleUrl: './add-album-form.scss',
})
export class AddAlbumForm implements OnInit {
  private albumService = inject(AlbumService);
  private auth = inject(AuthService);
  private bandService = inject(BandService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private tagService = inject(TagService);
  private toastService = inject(ToastService);
  private formDirty = inject(FormDirtyService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly albumTypeOptions = Object.values(AlbumType);
  readonly albumTypeSelectOptions: CustomSelectOption[] = Object.values(AlbumType).map(t => ({ value: t, label: t }));
  readonly currentYear = new Date().getFullYear();

  readonly bandOptions = signal<SelectOption[]>([]);
  readonly genreOptions = signal<SelectOption[]>([]);
  readonly countryOptions = signal<SelectOption[]>([]);
  readonly labelOptions = signal<SelectOption[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  editMode = false;
  albumId: string | null = null;
  albumSlug: string | null = null;
  existingCoverUrl: string | null = null;

  previewUrl: string | null = null;
  coverFile: File | null = null;
  coverError = false;
  readonly submitting = signal(false);

  tracks: { title: string; duration: string }[] = [{ title: '', duration: '' }];

  albumForm = new FormGroup({
    albumName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      nonNullable: true,
    }),
    albumBands: new FormControl<string[]>([], {
      nonNullable: true,
    }),
    albumYear: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1960), Validators.max(new Date().getFullYear() + 1)],
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
    spotify: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    youtube: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    appleMusic: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    deezer: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    amazonMusic: new FormControl('', {
      validators: [Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    bandcamp: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.albumForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formDirty.markDirty());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.albumId = id;
    }

    forkJoin({
      bands: this.bandService.getSummaries(),
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      labels: this.labelService.getAll(),
      tags: this.tagService.getAll(),
      album: id ? (this.auth.isAdmin() ? this.albumService.adminGetById(id) : this.albumService.getById(id)) : of(null),
    }).subscribe({
      next: ({ bands, genres, countries, labels, tags, album }) => {
        this.bandOptions.set(bands.filter(b => b.id != null).map(b => ({ id: b.id!, name: b.name })));
        this.genreOptions.set(genres);
        this.countryOptions.set(countries);
        this.labelOptions.set(labels);
        this.tagOptions.set(tags);

        if (album) {
          this.patchForm(album);
          if (album.tracks && album.tracks.length > 0) {
            this.tracks = album.tracks
              .slice()
              .sort((a, b) => a.trackNumber - b.trackNumber)
              .map(t => ({ title: t.title, duration: t.duration }));
          }
        }
      },
      error: () => this.toastService.error('Failed to load data.'),
    });
  }

  private patchForm(album: Album): void {
    this.existingCoverUrl = album.coverUrl;
    this.previewUrl = album.coverUrl;
    this.albumSlug = album.slug;

    const getLink = (platform: StreamingPlatform) =>
      album.streamingLinks?.find(l =>
        l.platform === platform ||
        (l.platform as unknown as string) === StreamingPlatform[platform]
      )?.embedCode ?? '';

    this.albumForm.patchValue({
      albumName: album.title,
      albumBands: album.bands?.map(b => b.id).filter((id): id is string => id != null) ?? [],
      albumYear: album.releaseDate,
      albumType: album.type,
      albumCountries: album.countries?.map(c => c.id) ?? [],
      albumGenres: [
        ...(album.primaryGenre ? [album.primaryGenre.id] : []),
        ...(album.genres?.filter(g => g.id !== album.primaryGenre?.id).map(g => g.id) ?? []),
      ],
      albumLabels: album.label?.id ? [album.label.id] : [],
      albumTags: album.tags?.map(t => t.id) ?? [],
      spotify: getLink(StreamingPlatform.Spotify),
      youtube: getLink(StreamingPlatform.YouTube),
      appleMusic: getLink(StreamingPlatform.AppleMusic),
      deezer: getLink(StreamingPlatform.Deezer),
      amazonMusic: getLink(StreamingPlatform.AmazonMusic),
      bandcamp: getLink(StreamingPlatform.Bandcamp),
    });
  }

  get albumName() { return this.albumForm.get('albumName')!; }
  get albumBands() { return this.albumForm.get('albumBands')!; }
  get albumYear() { return this.albumForm.get('albumYear')!; }
  get albumType() { return this.albumForm.get('albumType')!; }
  get albumCountries() { return this.albumForm.get('albumCountries')!; }
  get albumGenres() { return this.albumForm.get('albumGenres')!; }
  get albumLabels() { return this.albumForm.get('albumLabels')!; }
  get albumTags() { return this.albumForm.get('albumTags')!; }
  get spotify() { return this.albumForm.get('spotify')!; }
  get youtube() { return this.albumForm.get('youtube')!; }
  get appleMusic() { return this.albumForm.get('appleMusic')!; }
  get deezer() { return this.albumForm.get('deezer')!; }
  get amazonMusic() { return this.albumForm.get('amazonMusic')!; }
  get bandcamp() { return this.albumForm.get('bandcamp')!; }

  addTrack(): void {
    this.tracks = [...this.tracks, { title: '', duration: '' }];
  }

  deleteTrack(): void {
    if (this.tracks.length > 1) {
      this.tracks = this.tracks.slice(0, -1);
    }
  }

  trackByIndex(index: number): number {
    return index;
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
    if (this.albumForm.invalid) {
      this.albumForm.markAllAsTouched();
      return;
    }

    const v = this.albumForm.getRawValue();
    const streamingLinks = [];

    if (v.spotify.trim()) streamingLinks.push({ platform: StreamingPlatform.Spotify, embedCode: v.spotify.trim() });
    if (v.youtube.trim()) streamingLinks.push({ platform: StreamingPlatform.YouTube, embedCode: v.youtube.trim() });
    if (v.appleMusic.trim()) streamingLinks.push({ platform: StreamingPlatform.AppleMusic, embedCode: v.appleMusic.trim() });
    if (v.deezer.trim()) streamingLinks.push({ platform: StreamingPlatform.Deezer, embedCode: v.deezer.trim() });
    if (v.amazonMusic.trim()) streamingLinks.push({ platform: StreamingPlatform.AmazonMusic, embedCode: v.amazonMusic.trim() });
    if (v.bandcamp.trim()) streamingLinks.push({ platform: StreamingPlatform.Bandcamp, embedCode: v.bandcamp.trim() });

    const tracks = this.tracks
      .map((t, i) => ({ trackNumber: i + 1, title: t.title.trim(), duration: t.duration?.trim() || '' }))
      .filter(t => t.title);

    const labelIds = v.albumLabels.filter(id => !id.startsWith('new::'));
    const labelNames = v.albumLabels
      .filter(id => id.startsWith('new::'))
      .map(id => id.slice(5));

    const dto = {
      title: v.albumName.trim(),
      releaseDate: v.albumYear!,
      type: v.albumType,
      format: AlbumFormat.CD,
      bandIds: v.albumBands.filter(id => !id.startsWith('new::')),
      bandNames: v.albumBands.filter(id => id.startsWith('new::')).map(id => id.slice(5)),
      countryIds: v.albumCountries,
      genreIds: v.albumGenres,
      labelIds,
      labelNames,
      tagIds: v.albumTags,
      streamingLinks,
      tracks,
    };

    this.submitting.set(true);

    const request$ = this.editMode
      ? this.albumService.update(this.albumId!, dto, this.coverFile)
      : this.albumService.create(dto, this.coverFile);

    request$.subscribe({
      next: (album) => {
        if (this.editMode) {
          this.toastService.success('Album updated successfully!');
          this.router.navigate(['/albums', album?.slug ?? this.albumSlug]);
        } else {
          this.toastService.success('Album published successfully!');
          this.albumForm.reset({ albumType: AlbumType.FullLength });
          this.formDirty.markClean();
          this.previewUrl = null;
          this.coverFile = null;
        }
        this.submitting.set(false);
      },
      error: () => {
        this.toastService.error(this.editMode ? 'Failed to update album.' : 'Failed to publish album.');
        this.submitting.set(false);
      },
    });
  }

  onDelete(): void {
    if (!confirm(`Delete this album? This cannot be undone.`)) return;
    this.albumService.delete(this.albumId!).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.toastService.error('Failed to delete album.'),
    });
  }

  onCancel(): void {
    if (this.editMode && this.albumId) {
      this.router.navigate(['/albums', this.albumId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
