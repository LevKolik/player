import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import musicMetadata from 'music-metadata';

export const getMusicFiles = async (req: Request, res: Response) => {
  try {
    const musicDir = path.join(__dirname, '../../uploads/music');
    const files = fs.readdirSync(musicDir);
    
    const musicFiles = [];
    
    for (const file of files) {
      const filePath = path.join(musicDir, file);
      try {
        const metadata = await musicMetadata.parseFile(filePath);
        musicFiles.push({
          filename: file,
          title: metadata.common.title || file,
          artist: metadata.common.artist || 'Unknown Artist',
          duration: metadata.format.duration || 0,
          size: fs.statSync(filePath).size
        });
      } catch (error) {
        // Если не удалось прочитать метаданные, используем базовую информацию
        musicFiles.push({
          filename: file,
          title: file,
          artist: 'Unknown Artist',
          duration: 0,
          size: fs.statSync(filePath).size
        });
      }
    }
    
    res.json(musicFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read music files' });
  }
};

export const uploadMusic = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({ 
    message: 'File uploaded successfully', 
    filename: req.file.filename 
  });
};