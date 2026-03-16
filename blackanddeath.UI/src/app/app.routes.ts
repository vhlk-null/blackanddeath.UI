import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AlbumSubgenres } from './features/albums/album-subgenres/album-subgenres';
import { Info } from './features/albums/info/info';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'album-genre', component: AlbumSubgenres },
    { path: 'album/:id', component: Info },
];
