/** Display model used in the UI tracklist */
export interface Track {
  number: number;
  title: string;
  duration: string;
}

/** API model returned from the server */
export interface ApiTrack {
  id: string;
  title: string;
  trackNumber: number;
  duration: string;
}
