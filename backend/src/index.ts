import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MusicFile, Playlist } from './types';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Настройка загрузки аудио файлов
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/music');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Настройка загрузки изображений
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/covers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const audioUpload = multer({ 
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/flac'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type'));
    }
  }
});

// Статические файлы
app.use('/api/music', express.static(path.join(__dirname, '../uploads/music')));
app.use('/api/covers', express.static(path.join(__dirname, '../uploads/covers')));

// Получить список файлов
app.get('/api/music/files', (req, res) => {
  try {
    const musicDir = path.join(__dirname, '../uploads/music');
    if (!fs.existsSync(musicDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(musicDir);
    const musicFiles = files.map(file => {
      const filePath = path.join(musicDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        filename: file,
        title: file.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        album: '',
        duration: 0,
        size: stats.size,
        cover: undefined
      };
    });
    
    res.json(musicFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Загрузить файл
app.post('/api/music/upload', audioUpload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({ 
    message: 'File uploaded successfully', 
    filename: req.file.filename 
  });
});

// Хранилище плейлистов в памяти
let playlists: Playlist[] = [];
let playlistIdCounter = 1;

// === ПЛЕЙЛИСТЫ ===

// Получить все плейлисты
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

// Создать плейлист
app.post('/api/playlists', (req, res) => {
  console.log('POST /api/playlists - body:', req.body);
  
  const { name } = req.body;
  
  if (!name) {
    console.log('No name provided');
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const newPlaylist: Playlist = {
    id: (playlistIdCounter++).toString(),
    name,
    tracks: [],
    createdAt: new Date(),
    cover: undefined
  };

  playlists.push(newPlaylist);
  console.log('Created playlist:', newPlaylist);
  console.log('Total playlists:', playlists.length);
  
  res.json(newPlaylist);
});

// Получить конкретный плейлист
app.get('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  const playlist = playlists.find(p => p.id === id);
  
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  res.json(playlist);
});

// Добавить трек в плейлист
app.post('/api/playlists/:id/tracks', (req, res) => {
  const { id } = req.params;
  const { filename } = req.body;

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  // Проверяем что трек не уже в плейлисте
  if (!playlist.tracks.includes(filename)) {
    playlist.tracks.push(filename);
  }

  res.json(playlist);
});

// Удалить трек из плейлиста
app.delete('/api/playlists/:id/tracks/:filename', (req, res) => {
  const { id, filename } = req.params;

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  playlist.tracks = playlist.tracks.filter(track => track !== filename);
  res.json(playlist);
});

// Удалить плейлист
app.delete('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  playlists = playlists.filter(p => p.id !== id);
  res.json({ message: 'Playlist deleted' });
});

// === РЕДАКТИРОВАНИЕ ===

// Редактировать плейлист
app.put('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  playlist.name = name;
  res.json(playlist);
});

// Редактировать метаданные трека
app.put('/api/music/:filename/metadata', (req, res) => {
  const { filename } = req.params;
  const { title, artist, album } = req.body;

  // В реальном приложении здесь бы сохранялись в БД
  // Пока просто возвращаем обновленные данные
  const updatedMetadata = {
    filename,
    title: title || filename.replace(/\.[^/.]+$/, ""),
    artist: artist || 'Unknown Artist',
    album: album || '',
    duration: 0,
    size: 0,
    cover: undefined
  };

  res.json(updatedMetadata);
});

// Удалить трек с сервера
app.delete('/api/music/:filename', (req, res) => {
  const { filename } = req.params;
  
  try {
    const musicDir = path.join(__dirname, '../uploads/music');
    const filePath = path.join(musicDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // Удаляем трек из всех плейлистов
      playlists.forEach(playlist => {
        playlist.tracks = playlist.tracks.filter(track => track !== filename);
      });
      
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// === ОБЛОЖКИ ===

// Загрузить обложку для плейлиста
app.post('/api/playlists/:id/cover', imageUpload.single('cover'), (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No cover image uploaded' });
  }

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  playlist.cover = req.file.filename;
  res.json(playlist);
});

// Загрузить обложку для трека
app.post('/api/music/:filename/cover', imageUpload.single('cover'), (req, res) => {
  const { filename } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No cover image uploaded' });
  }

  res.json({ 
    cover: req.file.filename,
    message: 'Cover uploaded successfully'
  });
});

// Удалить обложку плейлиста
app.delete('/api/playlists/:id/cover', (req, res) => {
  const { id } = req.params;

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  if (playlist.cover) {
    const coverPath = path.join(__dirname, '../uploads/covers', playlist.cover);
    if (fs.existsSync(coverPath)) {
      fs.unlinkSync(coverPath);
    }
    playlist.cover = undefined;
  }

  res.json(playlist);
});

// Тестовый эндпоинт
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Music API: http://localhost:${PORT}/api/music/files`);
  console.log(`✅ Playlists API: http://localhost:${PORT}/api/playlists`);
});