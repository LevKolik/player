import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Настройка загрузки файлов
const storage = multer.diskStorage({
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

const upload = multer({ storage });

// Статические файлы (для доступа к музыке)
app.use('/api/music', express.static(path.join(__dirname, '../uploads/music')));

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
        duration: 0,
        size: stats.size
      };
    });
    
    res.json(musicFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Загрузить файл
app.post('/api/music/upload', upload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({ 
    message: 'File uploaded successfully', 
    filename: req.file.filename 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Music API: http://localhost:${PORT}/api/music/files`);
});