import React from 'react';
import { Playlist } from '../types';
import { API_BASE } from '../utils';

interface PlaylistItemProps {
  playlist: Playlist;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (playlist: Playlist) => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
  playlist,
  isActive,
  onSelect,
  onEdit
}) => {
  return (
    <div className={`playlist-item ${isActive ? 'active' : ''}`}>
      <div 
        className="playlist-info"
        onClick={() => onSelect(playlist.id)}
      >
        <div className="playlist-cover">
          {playlist.cover ? (
            <img 
              src={`${API_BASE}/covers/${playlist.cover}`} 
              alt={playlist.name}
              className="cover-image"
            />
          ) : (
            <div className="cover-placeholder">🎵</div>
          )}
        </div>
        <div className="playlist-details">
          <div className="playlist-name">{playlist.name}</div>
          <div className="track-count">{playlist.tracks.length} tracks</div>
        </div>
      </div>
      
      <div className="playlist-actions">
        <button 
          className="menu-button"
          onClick={() => onEdit(playlist)}
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export default PlaylistItem;