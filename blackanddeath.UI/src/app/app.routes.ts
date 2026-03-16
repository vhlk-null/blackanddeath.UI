import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Subgenres } from './features/albums/subgenres/subgenres';
import { Info } from './features/albums/info/info';
import { BandInfo } from './features/bands/info/info';
import { BandSubgenres } from './features/bands/subgenres/subgenres';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'albums/subgenres', component: Subgenres },
    { path: 'bands/subgenres', component: BandSubgenres },
    { path: 'album/:id', component: Info },
    { path: 'band/:id', component: BandInfo },
];
