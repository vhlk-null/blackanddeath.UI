import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AuthCallback } from './features/auth-callback/auth-callback';
import { Subgenres } from './features/albums/subgenres/subgenres';
import { Info } from './features/albums/info/info';
import { AllAlbums } from './features/albums/all/all-albums';
import { BandInfo } from './features/bands/info/info';
import { BandSubgenres } from './features/bands/subgenres/subgenres';
import { AllBands } from './features/bands/all/all-bands';
import { Genres } from './features/genres/genres';
import { GenreDetail } from './features/genres/genre-detail/genre-detail';
import { CreateNewItem } from './features/create-new-item/create-new-item';
import { AddAlbumForm } from './features/create-new-item/add-album-form/add-album-form';
import { AddBandForm } from './features/create-new-item/add-band-form/add-band-form';
import { Admin } from './features/admin/admin';
import { AllVideos } from './features/videos/all/all-videos';
import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

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
    { path: 'videos', component: AllVideos },
    { path: 'genres', component: Genres },
    { path: 'genres/:id', component: GenreDetail },
    { path: 'create', component: CreateNewItem, canActivate: [authGuard], canDeactivate: [unsavedChangesGuard] },
    { path: 'admin', component: Admin },
    { path: 'auth/callback', component: AuthCallback }
];
