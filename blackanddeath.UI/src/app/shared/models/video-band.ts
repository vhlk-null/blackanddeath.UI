import { VideoType } from './enums/video-type.enum';

export interface VideoBand {
  id: string;
  bandId: string;
  bandName?: string;
  name: string;
  year: number;
  countryId?: string | null;
  videoType: VideoType;
  youtubeLink: string;
}

export interface CreateVideoBandDto {
  name: string;
  year: number;
  countryId?: string | null;
  videoType: VideoType;
  youtubeLink: string;
}

export interface UpdateVideoBandDto {
  name: string;
  year: number;
  countryId?: string | null;
  videoType: VideoType;
  youtubeLink: string;
}
