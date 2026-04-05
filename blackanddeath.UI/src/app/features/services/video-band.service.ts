import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { VideoBandEndpoints } from '../../shared/constants/endpoints';
import { VideoBand, CreateVideoBandDto, UpdateVideoBandDto } from '../../shared/models/video-band';

@Injectable({ providedIn: 'root' })
export class VideoBandService {

  private http = inject(BaseHttpService);

  getAll(params?: { pageIndex?: number; pageSize?: number; videoType?: string }) {
    return this.http.get<{ videos: VideoBand[] }>(VideoBandEndpoints.GET_ALL, params).pipe(
      map(response => response.videos)
    );
  }

  getByBand(bandId: string) {
    return this.http.get<{ videos: VideoBand[] }>(VideoBandEndpoints.GET_BY_BAND(bandId)).pipe(
      map(response => response.videos)
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
}
