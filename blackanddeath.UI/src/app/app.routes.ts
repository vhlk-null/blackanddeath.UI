import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Subgenres } from './features/albums/subgenres/subgenres';
import { Info } from './features/albums/info/info';
import { BandInfo } from './features/bands/info/info';
import { BandSubgenres } from './features/bands/subgenres/subgenres';
import { Genres } from './features/genres/genres';
import { CreateNewItem } from './features/create-new-item/create-new-item';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'albums/subgenres', component: Subgenres },
    { path: 'bands/subgenres', component: BandSubgenres },
    { path: 'albums/:id/:slug', component: Info },
    { path: 'bands/:id/:slug', component: BandInfo },
    { path: 'genres', component: Genres },
    { path: 'create', component: CreateNewItem }
];
