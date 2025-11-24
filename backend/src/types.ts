export interface MusicFile {
  filename: string;
  title: string;
  artist: string;
  duration: number;
  size: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  createdAt: Date;
}