import path from 'path';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { expressjwt } from 'express-jwt';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import 'dotenv/config';
import { checkUserCredentials, createTranscription, getTranscriptionById, getTranscriptions } from './database.js';
import e from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN })); // CORS
app.use(express.static(path.join(path.resolve(), '../app/dist'))); // React App
app.use(fileUpload({
  limits: { fileSize: 500 * 1024 * 1024 },
  useTempFiles: true,
}));

// Middleware to handle JWT
const jwtMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send('Invalid token');
      } else {
        req.user = decoded;
        next();
      }
    });
  }
  else {
    res.status(401).send('No token provided');
  }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), '../app/dist', 'index.html'));
});

app.get('/api', (req, res) => {
  res.send('Hello from API!');
});

// Route to authenticate and get JWT
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await checkUserCredentials(username, password);
  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } else {
    res.status(400).send('Bad credentials');
  }
});

app.get('/api/transcriptions', jwtMiddleware, async (req, res) => {
  try {
    let page = 1;
    if (req.query.page && !isNaN(Number(req.query.page)) && Number(req.query.page) > 0) {
      page = Number(req.query.page);
    }
    const limit = 15;
    const transcriptions = await getTranscriptions({ limit, offset: (page - 1) * limit });
    res.json(transcriptions);
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});
app.get('/api/transcriptions/:id', jwtMiddleware, async (req, res) => {
  try {
    const transcription = await getTranscriptionById(req.params.id);
    res.json(transcription);
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});
app.post('/api/transcriptions', jwtMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      res.status(400).send('No file uploaded');
      return;
    }
    const file = req.files.file;
    const filename = file.name;
    const extension = filename.split('.').pop();
    const filePath = uuidv4() + '.' + extension;
    const { size, mimetype } = file;
    const duration = await getAudioDurationInSeconds(file.tempFilePath);
    await file.mv(path.join(path.resolve(), 'files', filePath));
    const transcriptionData = {
      filename,
      path: filePath,
      size,
      mimetype,
      duration,
      status: 'pending',
      user_id: req.user.id,
      result: null,
    };
    const { id: transcriptionId } = await createTranscription(transcriptionData);
    const transcription = await getTranscriptionById(transcriptionId);
    res.json(transcription);
  }
  catch (e) {
    console.log(e);
    res.status(500).send('Internal server error');
  }
});
app.get('/api/transcriptions/:id/download', jwtMiddleware, async (req, res) => {
  try {
    const transcription = await getTranscriptionById(req.params.id);
    if (!transcription) {
      res.status(404).send('Transcription not found');
      return;
    }
    const token = jwt.sign({ transcriptionId: transcription.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      url: `/transcriptions/file/${encodeURIComponent(token)}`,
    });
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});
app.get('/api/transcriptions/file/:token', async (req, res) => {
  try {
    const { transcriptionId } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const transcription = await getTranscriptionById(transcriptionId);
    if (!transcription) {
      res.status(404).send('Transcription not found');
      return;
    }
    const filePath = path.join(path.resolve(), 'files', transcription.path);
    res.download(filePath, transcription.filename);
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
