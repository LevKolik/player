import React from 'react';
import { Playlist, MusicFile, EditTrackData } from '../types';
import { API_BASE } from '../utils';

interface ModalProps {
  type: 'playlist' | 'track';
  editingPlaylist: Playlist | null;
  editingTrack: MusicFile | null;
  editPlaylistName: string;
  editTrackData: EditTrackData;
  onEditPlaylistName: (name: string) => void;
  onEditTrackData: (data: EditTrackData) => void;
  onUpdatePlaylist: () => void;
  onUpdateTrack: () => void;
  onDeletePlaylist: (id: string) => void;
  onDeleteTrack: (filename: string) => void;
  onRemovePlaylistCover: (id: string) => void;
  onClose: () => void;
  onCoverUpload: (type: 'playlist' | 'track', id: string) => void;
}

const Modal: React.FC<ModalProps> = ({
  type,
  editingPlaylist,
  editingTrack,
  editPlaylistName,
  editTrackData,
  onEditPlaylistName,
  onEditTrackData,
  onUpdatePlaylist,
  onUpdateTrack,
  onDeletePlaylist,
  onDeleteTrack,
  onRemovePlaylistCover,
  onClose,
  onCoverUpload
}) => {
  const isPlaylist = type === 'playlist';

  // Ранний возврат если нет данных для редактирования
  if (isPlaylist && !editingPlaylist) return null;
  if (!isPlaylist && !editingTrack) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit {isPlaylist ? 'Playlist' : 'Track'}</h3>
        
        {isPlaylist && editingPlaylist ? (
          <>
            <input
              type="text"
              value={editPlaylistName}
              onChange={(e) => onEditPlaylistName(e.target.value)}
              placeholder="Playlist name"
            />
            
            <div className="cover-section">
              <h4>Playlist Cover</h4>
              {editingPlaylist.cover && (
                <div className="current-cover">
                  <img 
                    src={`${API_BASE}/covers/${editingPlaylist.cover}`} 
                    alt="Current cover"
                  />
                  <button 
                    className="remove-cover-btn"
                    onClick={() => onRemovePlaylistCover(editingPlaylist.id)}
                  >
                    Remove
                  </button>
                </div>
              )}
              <button 
                className="upload-cover-btn"
                onClick={() => onCoverUpload('playlist', editingPlaylist.id)}
              >
                {editingPlaylist.cover ? 'Change Cover' : 'Upload Cover'}
              </button>
            </div>
          </>
        ) : editingTrack ? (
          <>
            <input
              type="text"
              value={editTrackData.title}
              onChange={(e) => onEditTrackData({...editTrackData, title: e.target.value})}
              placeholder="Title"
            />
            <input
              type="text"
              value={editTrackData.artist}
              onChange={(e) => onEditTrackData({...editTrackData, artist: e.target.value})}
              placeholder="Artist"
            />
            <input
              type="text"
              value={editTrackData.album}
              onChange={(e) => onEditTrackData({...editTrackData, album: e.target.value})}
              placeholder="Album"
            />
            
            <div className="cover-section">
              <h4>Track Cover</h4>
              {editingTrack.cover && (
                <div className="current-cover">
                  <img 
                    src={`${API_BASE}/covers/${editingTrack.cover}`} 
                    alt="Current cover"
                  />
                </div>
              )}
              <button 
                className="upload-cover-btn"
                onClick={() => onCoverUpload('track', editingTrack.filename)}
              >
                {editingTrack.cover ? 'Change Cover' : 'Upload Cover'}
              </button>
            </div>
          </>
        ) : null}
        
        <div className="modal-actions">
          <button onClick={isPlaylist ? onUpdatePlaylist : onUpdateTrack}>
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
          <button 
            className="delete-btn"
            onClick={() => {
              if (isPlaylist && editingPlaylist) {
                onDeletePlaylist(editingPlaylist.id);
              } else if (!isPlaylist && editingTrack) {
                onDeleteTrack(editingTrack.filename);
              }
            }}
          >
            Delete {isPlaylist ? 'Playlist' : 'Track'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;