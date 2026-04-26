import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Copyright } from './features/copyright/copyright';
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
import { UserProfile } from './features/user-profile/user-profile';
import { CollectionDetailPage } from './features/collections/collection-detail/collection-detail';
import { Settings } from './features/settings/settings';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'profile', component: UserProfile, canActivate: [authGuard] },
    { path: 'collections/:id', component: CollectionDetailPage, canActivate: [authGuard] },
    { path: 'settings', component: Settings },
    { path: 'albums', component: AllAlbums },
    { path: 'albums/subgenres', component: Subgenres },
    { path: 'albums/:id/edit', component: AddAlbumForm, canActivate: [adminGuard] },
    { path: 'albums/:slug', component: Info },
    { path: 'bands', component: AllBands },
    { path: 'bands/subgenres', component: BandSubgenres },
    { path: 'bands/:id/edit', component: AddBandForm, canActivate: [adminGuard] },
    { path: 'bands/:slug', component: BandInfo },
    { path: 'videos', component: AllVideos },
    { path: 'genres', component: Genres },
    { path: 'genres/:id', component: GenreDetail },
    { path: 'create', component: CreateNewItem, canDeactivate: [unsavedChangesGuard] },
    { path: 'admin', component: Admin, canActivate: [adminGuard] },
    { path: 'auth/callback', component: AuthCallback },
    { path: 'copyright', component: Copyright }
];
