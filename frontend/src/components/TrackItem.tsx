import React from 'react';
import { MusicFile, Playlist } from '../types';
import { API_BASE, formatTime } from '../utils';

interface TrackItemProps {
  track: MusicFile;
  playlists: Playlist[];
  isActive: boolean;
  showAddToPlaylist: boolean;
  onPlay: (track: MusicFile) => void;
  onAddToPlaylist: (playlistId: string, filename: string) => void;
  onEdit: (track: MusicFile) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  playlists,
  isActive,
  showAddToPlaylist,
  onPlay,
  onAddToPlaylist,
  onEdit
}) => {
  return (
    <div className={`track-item ${isActive ? 'active' : ''}`}>
      <div 
        className="track-info"
        onClick={() => onPlay(track)}
      >
        <div className="track-cover">
          {track.cover ? (
            <img 
              src={`${API_BASE}/covers/${track.cover}`} 
              alt={track.title}
              className="cover-image"
            />
          ) : (
            <div className="cover-placeholder">🎵</div>
          )}
        </div>
        <div className="track-details">
          <div className="track-title">{track.title}</div>
          <div className="track-artist">{track.artist}</div>
          {track.album && <div className="track-album">{track.album}</div>}
        </div>
      </div>
      
      <div className="track-actions">
        {showAddToPlaylist && (
          <select 
            onChange={(e) => onAddToPlaylist(e.target.value, track.filename)}
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
        
        <button 
          className="menu-button"
          onClick={() => onEdit(track)}
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export default TrackItem;