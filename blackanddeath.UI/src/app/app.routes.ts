import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AlbumSubgenres } from './features/album-subgenres/album-subgenres';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'album-genre', component: AlbumSubgenres }
];
