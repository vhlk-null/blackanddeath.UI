import { Component, computed, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RangeSlider } from '../range-slider/range-slider';
import { Router } from '@angular/router';
import { GenreService } from '../../../features/services/genre.service';
import { CountryService } from '../../../features/services/country.service';
import { LabelService } from '../../../features/services/label.service';
import { BandService } from '../../../features/services/band.service';
import { AlbumService } from '../../../features/services/album.servics';
import { TagService } from '../../../features/services/tag.service';
import { Genre } from '../../models/genre';
import { Country } from '../../models/country';
import { Label } from '../../models/label';
import { AlbumType } from '../../models/enums/album-type.enum';
import { MultiSelectInput, SelectOption } from '../multi-select/multi-select';
import { CustomSelect, CustomSelectOption } from '../custom-select/custom-select';

interface NameEntry { id: string; name: string; }

type FilterTab = 'albums' | 'bands';

@Component({
  selector: 'app-search-filter-panel',
  imports: [FormsModule, MultiSelectInput, CustomSelect, RangeSlider],
  templateUrl: './search-filter-panel.html',
  styleUrl: './search-filter-panel.scss',
})
export class SearchFilterPanel implements OnInit, OnDestroy {
  private router = inject(Router);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private bandService = inject(BandService);
  private albumService = inject(AlbumService);
  private tagService = inject(TagService);

  readonly closed = output<void>();

  readonly activeTab = signal<FilterTab>('albums');

  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly labels = signal<Label[]>([]);
  readonly bandNames = signal<NameEntry[]>([]);
  readonly albumNames = signal<NameEntry[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  readonly albumTypes = Object.values(AlbumType);

  readonly countryOptions = computed<CustomSelectOption[]>(() =>
    this.countries().map(c => ({ value: c.id, label: c.name }))
  );
  readonly genreOptions = computed<CustomSelectOption[]>(() =>
    this.genres().map(g => ({ value: g.id, label: g.name }))
  );
  readonly labelOptions = computed<CustomSelectOption[]>(() =>
    this.labels().map(l => ({ value: l.id, label: l.name }))
  );
  readonly albumTypeOptions = computed<CustomSelectOption[]>(() =>
    this.albumTypes.map(t => ({ value: t, label: t }))
  );

  // Band name autocomplete (Albums tab)
  readonly bandNameQuery = signal('');
  readonly bandNameDropdownOpen = signal(false);
  readonly filteredBandNames = computed(() => {
    const q = this.bandNameQuery().toLowerCase().trim();
    if (!q) return [];
    return this.bandNames().filter(b => b.name.toLowerCase().includes(q)).slice(0, 15);
  });

  // Release title autocomplete (Albums tab)
  readonly releaseTitleQuery = signal('');
  readonly releaseTitleDropdownOpen = signal(false);
  readonly filteredAlbumNames = computed(() => {
    const q = this.releaseTitleQuery().toLowerCase().trim();
    if (!q) return [];
    return this.albumNames().filter(a => a.name.toLowerCase().includes(q)).slice(0, 15);
  });

  // Album filters
  readonly selectedBandId = signal('');
  readonly selectedAlbumId = signal('');
  readonly selectedCountryId = signal('');
  readonly selectedGenreId = signal('');
  readonly selectedLabelId = signal('');
  readonly selectedType = signal('');
  readonly yearMin = 1980;
  readonly yearMax = new Date().getFullYear();

  readonly sliderA = signal<number | null>(null);
  readonly sliderB = signal<number | null>(null);

  readonly yearFrom = computed(() => Math.min(this.sliderA() ?? this.yearMin, this.sliderB() ?? this.yearMax));
  readonly yearTo = computed(() => Math.max(this.sliderA() ?? this.yearMin, this.sliderB() ?? this.yearMax));
  readonly selectedTagIds = signal<string[]>([]);

  // Band filters
  readonly bandFilterQuery = signal('');
  readonly bandFilterDropdownOpen = signal(false);
  readonly filteredBandNamesTab = computed(() => {
    const q = this.bandFilterQuery().toLowerCase().trim();
    if (!q) return [];
    return this.bandNames().filter(b => b.name.toLowerCase().includes(q)).slice(0, 15);
  });
  readonly selectedBandFilterId = signal('');
  readonly bandCountryId = signal('');
  readonly bandGenreId = signal('');
  readonly selectedBandTagIds = signal<string[]>([]);

  ngOnInit(): void {
    document.documentElement.classList.add('scroll-locked');
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));
    this.labelService.getAll().subscribe(l => this.labels.set(l));
    this.bandService.getNames().subscribe(b => this.bandNames.set(b));
    this.albumService.getNames().subscribe(a => this.albumNames.set(a));
    this.tagService.getAll().subscribe(t => this.tagOptions.set(t));
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('scroll-locked');
  }

  selectBand(band: NameEntry): void {
    this.selectedBandId.set(band.id);
    this.bandNameQuery.set(band.name);
    this.bandNameDropdownOpen.set(false);
  }

  selectAlbum(album: NameEntry): void {
    this.selectedAlbumId.set(album.id);
    this.releaseTitleQuery.set(album.name);
    this.releaseTitleDropdownOpen.set(false);
  }

  selectBandFilter(band: NameEntry): void {
    this.selectedBandFilterId.set(band.id);
    this.bandFilterQuery.set(band.name);
    this.bandFilterDropdownOpen.set(false);
  }

  onAutocompleteBlur(dropdown: 'bandName' | 'releaseTitle' | 'bandFilter'): void {
    setTimeout(() => {
      if (dropdown === 'bandName') this.bandNameDropdownOpen.set(false);
      else if (dropdown === 'releaseTitle') this.releaseTitleDropdownOpen.set(false);
      else this.bandFilterDropdownOpen.set(false);
    }, 150);
  }

  switchTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  searchAlbums(): void {
    const params: Record<string, string> = {};
    const genreName = this.genres().find(g => g.id === this.selectedGenreId())?.name;
    const countryName = this.countries().find(c => c.id === this.selectedCountryId())?.name;
    const labelName = this.labels().find(l => l.id === this.selectedLabelId())?.name;
    if (genreName) params['genreName'] = genreName;
    if (countryName) params['countryName'] = countryName;
    if (labelName) params['labelName'] = labelName;
    if (this.selectedType()) params['type'] = this.selectedType();
    if (this.sliderA() !== null || this.sliderB() !== null) {
      params['yearFrom'] = String(this.yearFrom());
      params['yearTo'] = String(this.yearTo());
    }
    if (this.selectedTagIds().length) params['tagIds'] = this.selectedTagIds().join(',');
    this.router.navigate(['/albums'], { queryParams: params });
    this.closed.emit();
  }

  searchBands(): void {
    const params: Record<string, string> = {};
    const genreName = this.genres().find(g => g.id === this.bandGenreId())?.name;
    const countryName = this.countries().find(c => c.id === this.bandCountryId())?.name;
    if (genreName) params['genreName'] = genreName;
    if (countryName) params['countryName'] = countryName;
    if (this.sliderA() !== null || this.sliderB() !== null) {
      params['yearFrom'] = String(this.yearFrom());
      params['yearTo'] = String(this.yearTo());
    }
    if (this.selectedBandTagIds().length) params['tagIds'] = this.selectedBandTagIds().join(',');

    this.router.navigate(['/bands'], { queryParams: params });
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('filter-overlay')) {
      this.closed.emit();
    }
  }
}
