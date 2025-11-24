import React, { useState } from 'react';
import { Playlist, MusicFile } from '../types';
import { API_BASE } from '../utils';
import BulkEditModal from './BulkEditModal';

interface EditPlaylistModalProps {
  playlist: Playlist;
  editName: string;
  onEditName: (name: string) => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onRemoveCover: (id: string) => void;
  onClose: () => void;
  onCoverUpload: (id: string) => void;
  playlistTracks: MusicFile[];
  onBulkUpdate: (updates: { 
    filenames: string[]; 
    artist?: string; 
    album?: string; 
    cover?: File;
    removeCover?: boolean;
  }) => void;
}

const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  playlist,
  editName,
  onEditName,
  onUpdate,
  onDelete,
  onRemoveCover,
  onClose,
  onCoverUpload,
  playlistTracks,
  onBulkUpdate
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <h3>Edit Playlist</h3>
          
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditName(e.target.value)}
            placeholder="Playlist name"
          />
          
          <div className="playlist-actions-section">
            <h4>Playlist Actions</h4>
            
            <div className="action-buttons">
              <button 
                className="action-btn bulk-edit-btn"
                onClick={() => setShowBulkEdit(true)}
                disabled={playlistTracks.length === 0}
              >
                🎛️ Bulk Edit Tracks ({playlistTracks.length})
              </button>
              
              <button 
                className="action-btn cover-btn"
                onClick={() => onCoverUpload(playlist.id)}
              >
                🖼️ {playlist.cover ? 'Change Cover' : 'Upload Cover'}
              </button>
            </div>
          </div>
          
          <div className="cover-section">
            <h4>Playlist Cover</h4>
            {playlist.cover && (
              <div className="current-cover">
                <img 
                  src={`${API_BASE}/covers/${playlist.cover}`} 
                  alt="Current cover"
                />
                <button 
                  className="remove-cover-btn"
                  onClick={() => onRemoveCover(playlist.id)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button onClick={onUpdate}>Save Playlist Name</button>
            <button onClick={onClose}>Cancel</button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(playlist.id)}
            >
              Delete Playlist
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно массового редактирования */}
      {showBulkEdit && (
        <BulkEditModal
          tracks={playlistTracks}
          onUpdate={(updates) => {
            onBulkUpdate(updates);
            setShowBulkEdit(false);
          }}
          onClose={() => setShowBulkEdit(false)}
        />
      )}
    </>
  );
};

export default EditPlaylistModal;