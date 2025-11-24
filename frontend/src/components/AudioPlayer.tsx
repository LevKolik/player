import React from 'react';
import { MusicFile } from '../types';
import { API_BASE } from '../utils';

interface AudioPlayerProps {
  currentTrack: MusicFile | null;
  isPlaying: boolean;
  onEnded: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onEnded
}) => {
  if (!currentTrack) return null;

  return (
    <div className="audio-player">
      <audio 
        controls 
        autoPlay={isPlaying}
        onEnded={onEnded}
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
  );
};

export default AudioPlayer;