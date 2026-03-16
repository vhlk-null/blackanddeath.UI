import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Subgenres } from './features/albums/subgenres/subgenres';
import { Info } from './features/albums/info/info';
import { BandInfo } from './features/bands/info/info';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'subgenres', component: Subgenres },
    { path: 'album/:id', component: Info },
    { path: 'band/:id', component: BandInfo },
];
