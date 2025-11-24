export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getPlaylistTracks = (playlist: any, musicFiles: any[]) => {
  return musicFiles.filter(file => playlist.tracks.includes(file.filename));
};

export const API_BASE = 'http://localhost:5000/api';