import { Component, computed, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GenreService } from '../../../features/services/genre.service';
import { CountryService } from '../../../features/services/country.service';
import { LabelService } from '../../../features/services/label.service';
import { BandService } from '../../../features/services/band.service';
import { AlbumService } from '../../../features/services/album.servics';
import { Genre } from '../../models/genre';
import { Country } from '../../models/country';
import { Label } from '../../models/label';
import { AlbumType } from '../../models/enums/album-type.enum';

interface NameEntry { id: string; name: string; }

type FilterTab = 'albums' | 'bands';

@Component({
  selector: 'app-search-filter-panel',
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

  readonly closed = output<void>();

  readonly activeTab = signal<FilterTab>('albums');

  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly labels = signal<Label[]>([]);
  readonly bandNames = signal<NameEntry[]>([]);
  readonly albumNames = signal<NameEntry[]>([]);

  readonly albumTypes = Object.values(AlbumType);

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
  readonly yearMin = 1960;
  readonly yearMax = new Date().getFullYear();

  readonly yearFrom = signal<number | null>(null);
  readonly yearTo = signal<number | null>(null);

  readonly yearFromPct = computed(() =>
    ((( this.yearFrom() ?? this.yearMin) - this.yearMin) / (this.yearMax - this.yearMin)) * 100
  );
  readonly yearToPct = computed(() =>
    (((this.yearTo() ?? this.yearMax) - this.yearMin) / (this.yearMax - this.yearMin)) * 100
  );
  readonly tags = signal('');

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
  readonly bandTags = signal('');

  ngOnInit(): void {
    document.documentElement.classList.add('scroll-locked');
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));
    this.labelService.getAll().subscribe(l => this.labels.set(l));
    this.bandService.getNames().subscribe(b => this.bandNames.set(b));
    this.albumService.getNames().subscribe(a => this.albumNames.set(a));
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
    if (this.selectedGenreId()) params['genreId'] = this.selectedGenreId();
    if (this.selectedCountryId()) params['countryId'] = this.selectedCountryId();
    if (this.selectedLabelId()) params['labelId'] = this.selectedLabelId();
    if (this.selectedType()) params['type'] = this.selectedType();
    if (this.yearFrom()) params['yearFrom'] = String(this.yearFrom());
    if (this.yearTo()) params['yearTo'] = String(this.yearTo());

    this.router.navigate(['/albums'], { queryParams: params });
    this.closed.emit();
  }

  searchBands(): void {
    const params: Record<string, string> = {};
    if (this.bandGenreId()) params['genreId'] = this.bandGenreId();
    if (this.bandCountryId()) params['countryId'] = this.bandCountryId();
    if (this.yearFrom()) params['yearFrom'] = String(this.yearFrom());
    if (this.yearTo()) params['yearTo'] = String(this.yearTo());

    this.router.navigate(['/bands'], { queryParams: params });
    this.closed.emit();
  }

  onYearFromInput(value: string): void {
    const v = +value;
    const to = this.yearTo() ?? this.yearMax;
    this.yearFrom.set(v >= to ? to - 1 : v);
  }

  onYearToInput(value: string): void {
    const v = +value;
    const from = this.yearFrom() ?? this.yearMin;
    this.yearTo.set(v <= from ? from + 1 : v);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('filter-overlay')) {
      this.closed.emit();
    }
  }
}
