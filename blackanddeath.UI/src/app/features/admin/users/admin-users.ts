import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AdminEndpoints } from '../../../shared/constants/endpoints';

export interface AdminUserDto {
  userId: string;
  username: string;
  email: string;
  registeredDate: string;
  favoriteAlbumsCount: number;
  favoriteBandsCount: number;
  albumReviewsCount: number;
  bandReviewsCount: number;
  collectionsCount: number;
}

interface PagedResult {
  data: AdminUserDto[];
  count: number;
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-admin-users',
  imports: [DatePipe],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);

  readonly users = signal<AdminUserDto[]>([]);
  readonly totalCount = signal(0);
  readonly pageIndex = signal(1);
  readonly pageSize = 20;
  readonly loading = signal(false);

  readonly totalPages = () => Math.ceil(this.totalCount() / this.pageSize);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get<PagedResult>(AdminEndpoints.GET_ALL_USERS(this.pageIndex(), this.pageSize)).subscribe({
      next: res => {
        this.users.set(res.data);
        this.totalCount.set(res.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageIndex.set(page);
    this.load();
  }
}
