import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface MusicFile {
  filename: string;
  title: string;
  artist: string;
  duration: number;
  size: number;
}

interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  createdAt: Date;
}

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);

  useEffect(() => {
    fetchMusicFiles();
    fetchPlaylists();
  }, []);

  const fetchMusicFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/music/files`);
      setMusicFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch music files:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`${API_BASE}/playlists`);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const createPlaylist = async () => {
  console.log('Create playlist clicked'); // ← добавить
  console.log('Playlist name:', newPlaylistName); // ← добавить
  
  if (!newPlaylistName.trim()) {
    console.log('Playlist name is empty'); // ← добавить
    return;
  }
  
  try {
    console.log('Sending request to backend...'); // ← добавить
    const response = await axios.post(`${API_BASE}/playlists`, {
      name: newPlaylistName
    });
    console.log('Backend response:', response.data); // ← добавить
    
    setPlaylists([...playlists, response.data]);
    setNewPlaylistName('');
  } catch (error) {
    console.error('Failed to create playlist:', error);
    // Добавим больше информации об ошибке
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  }
};

  const addToPlaylist = async (playlistId: string, filename: string) => {
    try {
      await axios.post(`${API_BASE}/playlists/${playlistId}/tracks`, {
        filename
      });
      fetchPlaylists(); // Обновляем плейлисты
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
    }
  };

  const getPlaylistTracks = (playlist: Playlist) => {
    return musicFiles.filter(file => playlist.tracks.includes(file.filename));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('music', file);

    try {
      await axios.post(`${API_BASE}/music/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Player</h1>
        
        {/* Загрузка файлов */}
        <div className="upload-section">
          <input type="file" accept="audio/*" onChange={handleFileUpload} />
        </div>

        {/* Создание плейлиста */}
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
          {/* Список плейлистов */}
          <div className="playlists-section">
            <h2>Playlists</h2>
            {playlists.map(playlist => (
              <div 
                key={playlist.id} 
                className={`playlist-item ${activePlaylist === playlist.id ? 'active' : ''}`}
                onClick={() => setActivePlaylist(playlist.id)}
              >
                <div className="playlist-name">{playlist.name}</div>
                <div className="track-count">{playlist.tracks.length} tracks</div>
              </div>
            ))}
          </div>

          {/* Список треков */}
          <div className="tracks-section">
            <h2>
              {activePlaylist 
                ? `Playlist: ${playlists.find(p => p.id === activePlaylist)?.name}`
                : 'All Tracks'
              }
            </h2>
            
            {(activePlaylist 
              ? getPlaylistTracks(playlists.find(p => p.id === activePlaylist)!)
              : musicFiles
            ).map((track, index) => (
              <div 
                key={index} 
                className={`track-item ${currentTrack?.filename === track.filename ? 'active' : ''}`}
              >
                <div 
                  className="track-info"
                  onClick={() => playTrack(track)}
                >
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                
                <div className="track-actions">
                  {!activePlaylist && (
                    <select 
                      onChange={(e) => addToPlaylist(e.target.value, track.filename)}
                      defaultValue=""
                    >
                      <option value="" disabled>Add to playlist</option>
                      {playlists.map(playlist => (
                        <option key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="track-duration">
                    {formatTime(track.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Аудиоплеер */}
        {currentTrack && (
          <div className="audio-player">
            <audio 
              controls 
              autoPlay={isPlaying}
              onEnded={() => setIsPlaying(false)}
              key={currentTrack.filename}
            >
              <source 
                src={`${API_BASE}/music/${currentTrack.filename}`} 
                type="audio/mpeg" 
              />
              Your browser does not support the audio element.
            </audio>
            <div className="now-playing">
              Now playing: {currentTrack.title} - {currentTrack.artist}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;