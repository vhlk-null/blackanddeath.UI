import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Section } from '../../../shared/components/section/section';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { BandService } from '../../services/band.service';
import { CountryService } from '../../services/country.service';
import { ToastService } from '../../../shared/services/toast.service';
import { VideoBandService } from '../../services/video-band.service';
import { VideoType } from '../../../shared/models/enums/video-type.enum';
import { forkJoin } from 'rxjs';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-add-video-form',
  imports: [Section, ReactiveFormsModule, MultiSelectInput, SafeUrlPipe],
  templateUrl: './add-video-form.html',
  styleUrl: './add-video-form.scss',
})
export class AddVideoForm implements OnInit {
  private bandService = inject(BandService);
  private countryService = inject(CountryService);
  private videoBandService = inject(VideoBandService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly bandOptions = signal<SelectOption[]>([]);
  readonly countryOptions = signal<SelectOption[]>([]);

  readonly videoTypeOptions = Object.values(VideoType);

  submitting = false;

  videoForm = new FormGroup({
    bandId: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    videoName: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    yearVideo: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1900), Validators.max(2099)],
    }),
    countryId: new FormControl<string[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    }),
    videoType: new FormControl('Clip', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    youtube: new FormControl('', {
      validators: [Validators.required, Validators.pattern('https?://.+')],
      nonNullable: true,
    }),
    info: new FormControl('', {
      nonNullable: true,
    }),
  });

  readonly youtubePreview = signal<string | null>(null);

  private parseYoutubeEmbed(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  ngOnInit(): void {
    this.videoForm.get('youtube')!.valueChanges.subscribe(url => {
      this.youtubePreview.set(this.parseYoutubeEmbed(url));
    });
    forkJoin({
      bands: this.bandService.getSummaries(),
      countries: this.countryService.getAll(),
    }).subscribe({
      next: ({ bands, countries }) => {
        this.bandOptions.set(bands.filter(b => b.id != null).map(b => ({ id: b.id!, name: b.name })));
        this.countryOptions.set(countries);
      },
      error: () => this.toastService.error('Failed to load data.'),
    });
  }

  get bandId() { return this.videoForm.get('bandId')!; }
  get videoName() { return this.videoForm.get('videoName')!; }
  get yearVideo() { return this.videoForm.get('yearVideo')!; }
  get countryId() { return this.videoForm.get('countryId')!; }
  get videoType() { return this.videoForm.get('videoType')!; }
  get youtube() { return this.videoForm.get('youtube')!; }
  get info() { return this.videoForm.get('info')!; }

  onFormEnter(event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const v = this.videoForm.getRawValue();
    const bandId = v.bandId[0];
    const dto = {
      name: v.videoName,
      year: v.yearVideo!,
      countryId: v.countryId.length ? v.countryId[0] : null,
      videoType: v.videoType as VideoType,
      youtubeLink: v.youtube,
      info: v.info || null,
    };

    this.videoBandService.create(bandId, dto).subscribe({
      next: () => {
        this.toastService.success('Video published successfully!');
        this.videoForm.reset({ bandId: [], videoName: '', yearVideo: null, countryId: [], videoType: 'Clip', youtube: '', info: '' });
        this.youtubePreview.set(null);
        this.submitting = false;
      },
      error: () => {
        this.toastService.error('Failed to publish video.');
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
