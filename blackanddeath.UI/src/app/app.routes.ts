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

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'albums', component: AllAlbums },
    { path: 'albums/subgenres', component: Subgenres },
    { path: 'albums/:id/:slug', component: Info },
    { path: 'bands', component: AllBands },
    { path: 'bands/subgenres', component: BandSubgenres },
    { path: 'bands/:id/:slug', component: BandInfo },
    { path: 'genres', component: Genres },
    { path: 'create', component: CreateNewItem }
];
