import React, { useState } from 'react';
import { MusicFile } from '../types';
import { API_BASE } from '../utils';

interface BulkEditModalProps {
  tracks: MusicFile[];
  onUpdate: (updates: { 
    filenames: string[]; 
    artist?: string; 
    album?: string; 
    cover?: File;
    removeCover?: boolean;
  }) => void;
  onClose: () => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  tracks,
  onUpdate,
  onClose
}) => {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const toggleTrack = (filename: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedTracks(newSelected);
  };

  const selectAll = () => {
    setSelectedTracks(new Set(tracks.map(track => track.filename)));
  };

  const selectNone = () => {
    setSelectedTracks(new Set());
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setRemoveCover(false);
    }
  };

  const handleSubmit = () => {
  if (selectedTracks.size === 0) {
    alert('Please select at least one track');
    return;
  }

  const hasChanges = artist || album || coverFile || removeCover;
  if (!hasChanges) {
    alert('Please make at least one change');
    return;
  }

  console.log('Bulk update data:', {
    filenames: Array.from(selectedTracks),
    artist,
    album,
    coverFile: coverFile?.name,
    removeCover
  });

  onUpdate({
    filenames: Array.from(selectedTracks),
    artist: artist || undefined,
    album: album || undefined,
    cover: coverFile || undefined,
    removeCover: removeCover || undefined
  });
};

  return (
    <div className="modal-overlay">
      <div className="modal bulk-edit-modal">
        <h3>Bulk Edit Tracks</h3>
        <p className="bulk-edit-subtitle">
          Select tracks to update their metadata and covers
        </p>

        {/* Selection controls */}
        <div className="bulk-selection-controls">
          <button onClick={selectAll} className="selection-btn">
            Select All ({tracks.length})
          </button>
          <button onClick={selectNone} className="selection-btn">
            Select None
          </button>
          <span className="selected-count">
            Selected: {selectedTracks.size}
          </span>
        </div>

        {/* Tracks list */}
        <div className="bulk-tracks-list">
          {tracks.map(track => (
            <div 
              key={track.filename} 
              className={`bulk-track-item ${selectedTracks.has(track.filename) ? 'selected' : ''}`}
              onClick={() => toggleTrack(track.filename)}
            >
              <div className="bulk-track-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTracks.has(track.filename)}
                  onChange={() => {}}
                />
              </div>
              <div className="bulk-track-cover">
                {track.cover ? (
                  <img 
                    src={`${API_BASE}/covers/${track.cover}`} 
                    alt={track.title}
                  />
                ) : (
                  <div className="cover-placeholder">🎵</div>
                )}
              </div>
              <div className="bulk-track-info">
                <div className="bulk-track-title">{track.title}</div>
                <div className="bulk-track-artist">{track.artist}</div>
                {track.album && <div className="bulk-track-album">{track.album}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Edit fields */}
        <div className="bulk-edit-fields">
          <h4>Apply changes to selected tracks:</h4>
          
          <div className="bulk-field">
            <label>Artist:</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Leave empty to keep current"
            />
          </div>

          <div className="bulk-field">
            <label>Album:</label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Leave empty to keep current"
            />
          </div>

          <div className="bulk-field">
            <label>Cover Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
            />
            {coverFile && (
              <div className="cover-preview">
                <img src={URL.createObjectURL(coverFile)} alt="Preview" />
                <span>{coverFile.name}</span>
              </div>
            )}
          </div>

          <div className="bulk-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={removeCover}
                onChange={(e) => {
                  setRemoveCover(e.target.checked);
                  if (e.target.checked) setCoverFile(null);
                }}
              />
              Remove existing covers
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="apply-btn">
            Apply to Selected ({selectedTracks.size})
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;