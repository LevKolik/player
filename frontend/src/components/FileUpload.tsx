import React from 'react';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = "audio/*"
}) => {
  return (
    <div className="upload-section">
      <input 
        type="file" 
        accept={accept} 
        onChange={onFileUpload} 
      />
    </div>
  );
};

export default FileUpload;