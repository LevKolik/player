import axios from 'axios';
import { MusicFile, Playlist, EditTrackData } from '../types';
import { API_BASE } from '../utils';

// Music API
export const musicApi = {
  getFiles: (): Promise<MusicFile[]> => 
    axios.get(`${API_BASE}/music/files`).then(res => res.data),

  upload: (file: File): Promise<{ message: string; filename: string }> => {
    const formData = new FormData();
    formData.append('music', file);
    return axios.post(`${API_BASE}/music/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  updateMetadata: (filename: string, data: EditTrackData): Promise<MusicFile> =>
    axios.put(`${API_BASE}/music/${filename}/metadata`, data).then(res => res.data),

  uploadCover: (filename: string, file: File): Promise<{ cover: string; message: string }> => {
    const formData = new FormData();
    formData.append('cover', file);
    return axios.post(`${API_BASE}/music/${filename}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  delete: (filename: string): Promise<{ message: string }> =>
    axios.delete(`${API_BASE}/music/${filename}`).then(res => res.data)
};

// Playlists API
export const playlistsApi = {
  getAll: (): Promise<Playlist[]> => 
    axios.get(`${API_BASE}/playlists`).then(res => res.data),

  create: (name: string): Promise<Playlist> => 
    axios.post(`${API_BASE}/playlists`, { name }).then(res => res.data),

  update: (id: string, name: string): Promise<Playlist> =>
    axios.put(`${API_BASE}/playlists/${id}`, { name }).then(res => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axios.delete(`${API_BASE}/playlists/${id}`).then(res => res.data),

  addTrack: (id: string, filename: string): Promise<Playlist> =>
    axios.post(`${API_BASE}/playlists/${id}/tracks`, { filename }).then(res => res.data),

  uploadCover: (id: string, file: File): Promise<Playlist> => {
    const formData = new FormData();
    formData.append('cover', file);
    return axios.post(`${API_BASE}/playlists/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  removeCover: (id: string): Promise<Playlist> =>
    axios.delete(`${API_BASE}/playlists/${id}/cover`).then(res => res.data)
};

// Mass update API
export const bulkApi = {
  updateTracks: (data: {
    filenames: string[];
    artist?: string;
    album?: string;
  }): Promise<{ message: string; updated: number; tracks: any[] }> =>
    axios.post(`${API_BASE}/music/bulk-update`, data).then(res => res.data),
};