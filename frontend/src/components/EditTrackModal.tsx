import React from 'react';
import { MusicFile, EditTrackData } from '../types';
import { API_BASE } from '../utils';

interface EditTrackModalProps {
  track: MusicFile;
  editData: EditTrackData;
  onEditData: (data: EditTrackData) => void;
  onUpdate: () => void;
  onDelete: (filename: string) => void;
  onClose: () => void;
  onCoverUpload: (filename: string) => void;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({
  track,
  editData,
  onEditData,
  onUpdate,
  onDelete,
  onClose,
  onCoverUpload
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Track</h3>
        
        <input
          type="text"
          value={editData.title}
          onChange={(e) => onEditData({...editData, title: e.target.value})}
          placeholder="Title"
        />
        <input
          type="text"
          value={editData.artist}
          onChange={(e) => onEditData({...editData, artist: e.target.value})}
          placeholder="Artist"
        />
        <input
          type="text"
          value={editData.album}
          onChange={(e) => onEditData({...editData, album: e.target.value})}
          placeholder="Album"
        />
        
        <div className="cover-section">
          <h4>Track Cover</h4>
          {track.cover && (
            <div className="current-cover">
              <img 
                src={`${API_BASE}/covers/${track.cover}`} 
                alt="Current cover"
              />
            </div>
          )}
          <button 
            className="upload-cover-btn"
            onClick={() => onCoverUpload(track.filename)}
          >
            {track.cover ? 'Change Cover' : 'Upload Cover'}
          </button>
        </div>
        
        <div className="modal-actions">
          <button onClick={onUpdate}>Save</button>
          <button onClick={onClose}>Cancel</button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(track.filename)}
          >
            Delete Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTrackModal;