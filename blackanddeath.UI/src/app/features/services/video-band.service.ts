import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { VideoBandEndpoints } from '../../shared/constants/endpoints';
import { VideoBand, CreateVideoBandDto, UpdateVideoBandDto } from '../../shared/models/video-band';
import { PaginatedResult } from '../../shared/models/paginated-result';
import { PendingApprovalDto } from './album.servics';

@Injectable({ providedIn: 'root' })
export class VideoBandService {

  private http = inject(BaseHttpService);

  getAll(params?: { pageIndex?: number; pageSize?: number }) {
    return this.http.get<{ videoBands: PaginatedResult<VideoBand> }>(VideoBandEndpoints.GET_ALL, params).pipe(
      map(response => response.videoBands.data)
    );
  }

  getAllPaginated(params: { pageIndex: number; pageSize: number; sortBy?: string; videoType?: string }) {
    return this.http.get<{ videoBands: PaginatedResult<VideoBand> }>(VideoBandEndpoints.GET_ALL, params).pipe(
      map(response => response.videoBands)
    );
  }

  getByBand(bandId: string, params?: { pageIndex?: number; pageSize?: number }) {
    return this.http.get<{ videoBands: PaginatedResult<VideoBand> }>(VideoBandEndpoints.GET_BY_BAND(bandId), params).pipe(
      map(response => response.videoBands.data)
    );
  }

  create(bandId: string, dto: CreateVideoBandDto) {
    return this.http.post<VideoBand>(VideoBandEndpoints.CREATE(bandId), dto);
  }

  update(bandId: string, id: string, dto: UpdateVideoBandDto) {
    return this.http.put<VideoBand>(VideoBandEndpoints.UPDATE(bandId, id), dto);
  }

  delete(bandId: string, id: string) {
    return this.http.delete<void>(VideoBandEndpoints.DELETE(bandId, id));
  }

  getPendingApproval() {
    return this.http.get<{ videoBands: PendingApprovalDto[] }>(VideoBandEndpoints.PENDING_APPROVAL).pipe(
      map(response => response.videoBands)
    );
  }
}
