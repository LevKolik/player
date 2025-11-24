import React, { useState, useEffect, useRef } from 'react';
import { MusicFile, Playlist, EditTrackData } from './types';
import { musicApi, playlistsApi, bulkApi } from './services/api';
import { getPlaylistTracks } from './utils';
import PlaylistItem from './components/PlaylistItem';
import TrackItem from './components/TrackItem';
import AudioPlayer from './components/AudioPlayer';
import FileUpload from './components/FileUpload';
import EditPlaylistModal from './components/EditPlaylistModal';
import EditTrackModal from './components/EditTrackModal';
import './App.css';

function App() {
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editingTrack, setEditingTrack] = useState<MusicFile | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [editTrackData, setEditTrackData] = useState<EditTrackData>({
    title: '',
    artist: '',
    album: ''
  });

  const [uploadingCoverFor, setUploadingCoverFor] = useState<{
    type: 'playlist' | 'track';
    id: string;
  } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMusicFiles();
    fetchPlaylists();
  }, []);

  const fetchMusicFiles = async () => {
    try {
      const data = await musicApi.getFiles();
      setMusicFiles(data);
    } catch (error) {
      console.error('Failed to fetch music files:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await playlistsApi.getAll();
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    try {
      const newPlaylist = await playlistsApi.create(newPlaylistName);
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, filename: string) => {
    try {
      await playlistsApi.addTrack(playlistId, filename);
      fetchPlaylists();
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await musicApi.upload(file);
      setTimeout(() => {
        fetchMusicFiles();
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const playTrack = (track: MusicFile) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Функции редактирования
  const updatePlaylist = async () => {
    if (!editingPlaylist || !editPlaylistName.trim()) return;
    
    try {
      const updatedPlaylist = await playlistsApi.update(editingPlaylist.id, editPlaylistName);
      setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
      setEditingPlaylist(null);
      setEditPlaylistName('');
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  const updateTrackMetadata = async () => {
    if (!editingTrack) return;
    
    try {
      const updatedTrack = await musicApi.updateMetadata(editingTrack.filename, editTrackData);
      setMusicFiles(musicFiles.map(track =>
        track.filename === editingTrack.filename ? { ...track, ...updatedTrack } : track
      ));
      setEditingTrack(null);
      setEditTrackData({ title: '', artist: '', album: '' });
    } catch (error) {
      console.error('Failed to update track:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await playlistsApi.delete(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      if (activePlaylist === playlistId) {
        setActivePlaylist(null);
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const deleteTrack = async (filename: string) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;
    
    try {
      await musicApi.delete(filename);
      setMusicFiles(musicFiles.filter(track => track.filename !== filename));
      setPlaylists(playlists.map(playlist => ({
        ...playlist,
        tracks: playlist.tracks.filter(track => track !== filename)
      })));
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  };

  const startEditingPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.name);
  };

  const startEditingTrack = (track: MusicFile) => {
    setEditingTrack(track);
    setEditTrackData({
      title: track.title,
      artist: track.artist,
      album: track.album || ''
    });
  };

  // Функции для работы с обложками
  const uploadPlaylistCover = async (playlistId: string, file: File) => {
    try {
      const updatedPlaylist = await playlistsApi.uploadCover(playlistId, file);
      setPlaylists(playlists.map(p => p.id === playlistId ? updatedPlaylist : p));
      setUploadingCoverFor(null);
    } catch (error) {
      console.error('Failed to upload playlist cover:', error);
    }
  };

  const uploadTrackCover = async (filename: string, file: File) => {
    try {
      const response = await musicApi.uploadCover(filename, file);
      setMusicFiles(musicFiles.map(track =>
        track.filename === filename ? { ...track, cover: response.cover } : track
      ));
      setUploadingCoverFor(null);
    } catch (error) {
      console.error('Failed to upload track cover:', error);
    }
  };

  const removePlaylistCover = async (playlistId: string) => {
    try {
      const updatedPlaylist = await playlistsApi.removeCover(playlistId);
      setPlaylists(playlists.map(p => p.id === playlistId ? updatedPlaylist : p));
    } catch (error) {
      console.error('Failed to remove playlist cover:', error);
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingCoverFor) return;

    if (uploadingCoverFor.type === 'playlist') {
      uploadPlaylistCover(uploadingCoverFor.id, file);
    } else {
      uploadTrackCover(uploadingCoverFor.id, file);
    }
  };

  const triggerCoverUpload = (type: 'playlist' | 'track', id: string) => {
    setUploadingCoverFor({ type, id });
    setTimeout(() => {
      coverInputRef.current?.click();
    }, 0);
  };

  // Функция для массового обновления треков
const handleBulkUpdate = async (updates: {
  filenames: string[];
  artist?: string;
  album?: string;
  cover?: File;
  removeCover?: boolean;
}) => {
  try {
    let updatedCount = 0;

    // Обновляем метаданные (артист и альбом)
    if (updates.artist || updates.album) {
      const metadataResponse = await bulkApi.updateTracks({
        filenames: updates.filenames,
        artist: updates.artist,
        album: updates.album
      });
      updatedCount += metadataResponse.updated;
      
      // Обновляем локальный стейт для метаданных
      setMusicFiles(prevFiles => 
        prevFiles.map(track => 
          updates.filenames.includes(track.filename) 
            ? {
                ...track,
                artist: updates.artist || track.artist,
                album: updates.album !== undefined ? updates.album : track.album
              }
            : track
        )
      );
    }

    // Обновляем обложки если есть файл
    if (updates.cover) {
      const uploadPromises = updates.filenames.map(filename => 
        musicApi.uploadCover(filename, updates.cover!)
      );
      
      await Promise.all(uploadPromises);
      updatedCount += updates.filenames.length;
      
      // Обновляем локальный стейт для обложек
      setMusicFiles(prevFiles => 
        prevFiles.map(track => 
          updates.filenames.includes(track.filename) 
            ? { ...track, cover: updates.cover?.name || track.cover }
            : track
        )
      );
    }

    // Удаляем обложки если нужно
    if (updates.removeCover) {
      updatedCount += updates.filenames.length;
      
      // Обновляем локальный стейт - удаляем обложки
      setMusicFiles(prevFiles => 
        prevFiles.map(track =>
          updates.filenames.includes(track.filename) 
            ? { ...track, cover: undefined }
            : track
        )
      );
    }

    // Показываем результат
    if (updatedCount > 0) {
      alert(`✅ Successfully updated ${updatedCount} track(s)`);
      
      // Принудительно обновляем данные
      setTimeout(() => {
        fetchMusicFiles();
      }, 500);
    } else {
      alert('⚠️ No changes were made');
    }
    
  } catch (error) {
    console.error('Bulk update failed:', error);
    alert('❌ Failed to update tracks. Please try again.');
  }
};

  const currentPlaylist = activePlaylist ? playlists.find(p => p.id === activePlaylist) : null;
  const displayedTracks = currentPlaylist 
    ? getPlaylistTracks(currentPlaylist, musicFiles)
    : musicFiles;

  const playlistTracks = editingPlaylist 
    ? getPlaylistTracks(editingPlaylist, musicFiles)
    : [];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Player</h1>
        
        <FileUpload onFileUpload={handleFileUpload} />

        <div className="playlist-creation">
          <input
            type="text"
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button onClick={createPlaylist}>Create Playlist</button>
        </div>

        <div className="content">
          <div className="playlists-section">
            <h2>Playlists</h2>
            {playlists.map(playlist => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                isActive={activePlaylist === playlist.id}
                onSelect={setActivePlaylist}
                onEdit={startEditingPlaylist}
              />
            ))}
          </div>

          <div className="tracks-section">
            <div className="tracks-header">
              {activePlaylist ? (
                <div className="playlist-header">
                  <button 
                    className="back-button"
                    onClick={() => setActivePlaylist(null)}
                  >
                    ←
                  </button>
                  <h2>Playlist: {currentPlaylist?.name}</h2>
                </div>
              ) : (
                <h2>All Tracks</h2>
              )}
            </div>
            
            {displayedTracks.map((track, index) => (
              <TrackItem
                key={index}
                track={track}
                playlists={playlists}
                isActive={currentTrack?.filename === track.filename}
                showAddToPlaylist={!activePlaylist}
                onPlay={playTrack}
                onAddToPlaylist={addToPlaylist}
                onEdit={startEditingTrack}
              />
            ))}
          </div>
        </div>

        <AudioPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onEnded={() => setIsPlaying(false)}
        />

        {editingPlaylist && (
          <EditPlaylistModal
            playlist={editingPlaylist}
            editName={editPlaylistName}
            onEditName={setEditPlaylistName}
            onUpdate={updatePlaylist}
            onDelete={deletePlaylist}
            onRemoveCover={removePlaylistCover}
            onClose={() => setEditingPlaylist(null)}
            onCoverUpload={(id) => triggerCoverUpload('playlist', id)}
            playlistTracks={playlistTracks}
            onBulkUpdate={handleBulkUpdate}
          />
        )}

        {editingTrack && (
          <EditTrackModal
            track={editingTrack}
            editData={editTrackData}
            onEditData={setEditTrackData}
            onUpdate={updateTrackMetadata}
            onDelete={deleteTrack}
            onClose={() => setEditingTrack(null)}
            onCoverUpload={(filename) => triggerCoverUpload('track', filename)}
          />
        )}

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={coverInputRef}
          onChange={handleCoverUpload}
        />
      </header>
    </div>
  );
}

export default App;