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

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchMusicFiles();
  }, []);

  const fetchMusicFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/music/files`);
      setMusicFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch music files:', error);
    }
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
      fetchMusicFiles(); // Обновляем список файлов
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

        {/* Список треков */}
        <div className="playlist">
          <h2>Playlist</h2>
          {musicFiles.map((track, index) => (
            <div 
              key={index} 
              className={`track-item ${currentTrack?.filename === track.filename ? 'active' : ''}`}
              onClick={() => playTrack(track)}
            >
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <div className="track-duration">
                {formatTime(track.duration)}
              </div>
            </div>
          ))}
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