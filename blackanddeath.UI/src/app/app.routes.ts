import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AlbumBandSubgenres } from './features/album-band-subgenres/album-band-subgenres';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'subgenres', component: AlbumBandSubgenres }
];
