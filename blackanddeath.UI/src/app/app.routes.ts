import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Subgenres } from './features/albums/subgenres/subgenres';
import { Info } from './features/albums/info/info';
import { AllAlbums } from './features/albums/all/all-albums';
import { BandInfo } from './features/bands/info/info';
import { BandSubgenres } from './features/bands/subgenres/subgenres';
import { AllBands } from './features/bands/all/all-bands';
import { Genres } from './features/genres/genres';
import { CreateNewItem } from './features/create-new-item/create-new-item';
import { AddAlbumForm } from './features/create-new-item/add-album-form/add-album-form';
import { AddBandForm } from './features/create-new-item/add-band-form/add-band-form';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'albums', component: AllAlbums },
    { path: 'albums/subgenres', component: Subgenres },
    { path: 'albums/:id/edit', component: AddAlbumForm },
    { path: 'albums/:id/:slug', component: Info },
    { path: 'bands', component: AllBands },
    { path: 'bands/subgenres', component: BandSubgenres },
    { path: 'bands/:id/edit', component: AddBandForm },
    { path: 'bands/:id/:slug', component: BandInfo },
    { path: 'genres', component: Genres },
    { path: 'create', component: CreateNewItem }
];
