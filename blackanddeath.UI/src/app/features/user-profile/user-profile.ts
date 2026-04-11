import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);

  // Tabs for main content
  readonly mainTabs = ['Favourites', 'Playlists', 'Collections', 'Activity'];
  readonly activeMainTab = signal(0);

  readonly favouritesTabs = ['Albums', 'Bands', 'Clips'];
  readonly activeFavouritesTab = signal(0);

  // Mock stats — will be replaced with real data from API
  readonly stats = [
    { label: 'Rank', value: 'Azazel' },
    { label: 'Comments', value: '50' },
    { label: 'Joined', value: '2015' },
    { label: 'Voted', value: '170' },
  ];

  readonly isOnline = signal(true);

  readonly username = computed(() => this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User');

  // Mock collection data
  readonly collections = [
    { id: 1, name: 'Norwegian BM', albumCount: 24, bandCount: 8, covers: Array(8).fill(null) },
    { id: 2, name: 'War Metal', albumCount: 11, bandCount: 3, covers: Array(8).fill(null) },
    { id: 3, name: 'Atmospheric', albumCount: 18, bandCount: 12, covers: Array(8).fill(null) },
    { id: 4, name: 'Satanic Cults', albumCount: 4, bandCount: 4, covers: Array(8).fill(null) },
  ];

  // Mock activity data
  readonly activities = [
    { user: 'JabeGreen', action: 'commented band', target: 'Shamhamforash', time: '2 hours ago' },
    { user: 'JabeGreen', action: 'rated album', target: 'Aether (2015)', time: '2 hours ago' },
    { user: 'JabeGreen', action: 'added album', target: 'The Grand Arc Of Madness (2024) to favourites', time: '3 hours ago' },
    { user: 'JabeGreen', action: 'commented band', target: 'Shaarimoth', time: '3 hours ago' },
    { user: 'JabeGreen', action: 'added to playlist', target: 'De Mysteriis Dom Sathanas → Rituals', time: '5 hours ago' },
  ];

  placeholders(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
