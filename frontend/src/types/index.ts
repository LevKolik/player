export interface MusicFile {
  filename: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  size: number;
  cover?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  createdAt: Date;
  cover?: string;
}

export interface EditTrackData {
  title: string;
  artist: string;
  album: string;
}

export interface UploadingCover {
  type: 'playlist' | 'track';
  id: string;
}