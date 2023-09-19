import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import {
  checkUserCredentials,
  createTranscription,
  createUser,
  deleteTranscription,
  deleteUser,
  getTranscriptionById,
  getTranscriptions,
  getUserById,
  getUsers,
  updateUser,
} from './database.js';
import { browseTranscriptions } from './whisper.js';

browseTranscriptions(); // Start the transcription process

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN })); // CORS
}
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
app.post('/api/change-password', jwtMiddleware, async (req, res) => {
  const { password, newPassword } = req.body;
  const user = await checkUserCredentials(req.user.username, password);
  if (user) {
    await updateUser({ id: user.id, password: newPassword });
    res.status(204).send('Password changed');
  } else {
    res.status(400).send('Bad credentials');
  }
});

app.get('/api/users', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).send('Forbidden');
    return;
  }
  try {
    const users = await getUsers();
    res.json(users);
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});
app.post('/api/users', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).send('Forbidden');
    return;
  }
  const { username, password, email } = req.body;
  try {
    const user = await createUser({ username, password, email, role: 'user' });
    res.json(user);
  }
  catch {
    res.status(500).send('Internal server error');
  }
});
app.put('/api/users/:id', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).send('Forbidden');
    return;
  }
  const { username, password, email, role } = req.body;
  try {
    const user = await getUserById(req.params.id);
    if (user.id === 1 && req.user.id !== 1) {
      res.status(403).send('Forbidden');
      return;
    }
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    await updateUser({ id: user.id, username, password, email, role });
    res.status(204).send('User updated');
  }
  catch (e) {
    console.log(e);
    res.status(500).send('Internal server error');
  }
});
app.delete('/api/users/:id', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).send('Forbidden');
    return;
  }
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    if (user.id === 1) {
      res.status(403).send('Forbidden');
      return;
    }
    await deleteUser(req.params.id);
    res.status(204).send('User deleted');
  }
  catch {
    res.status(500).send('Internal server error');
  }
});

app.get('/api/transcriptions', jwtMiddleware, async (req, res) => {
  try {
    let page = 1;
    if (req.query.page && !isNaN(Number(req.query.page)) && Number(req.query.page) > 0) {
      page = Number(req.query.page);
    }
    const limit = 15;
    const offset = (page - 1) * limit;
    const filters = [];
    const filterParams = [];
    if (req.user.role !== 'admin') {
      filters.push('user_id = ?');
      filterParams.push(req.user.id);
    }
    const transcriptions = await getTranscriptions({ limit, offset, filters, filterParams });
    res.json(transcriptions);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});
app.get('/api/transcriptions/:id', jwtMiddleware, async (req, res) => {
  try {
    const transcription = await getTranscriptionById(req.params.id);
    if (!transcription) {
      res.status(404).send('Transcription not found');
      return;
    }
    if (req.user.role !== 'admin' && transcription.user_id !== req.user.id) {
      res.status(403).send('Forbidden');
      return;
    }
    res.json(transcription);
  }
  catch (err) {
    res.status(500).send('Internal server error');
  }
});
app.delete('/api/transcriptions/:id', jwtMiddleware, async (req, res) => {
  try {
    const transcription = await getTranscriptionById(req.params.id);
    if (!transcription) {
      res.status(404).send('Transcription not found');
      return;
    }
    if (req.user.role !== 'admin' && transcription.user_id !== req.user.id) {
      res.status(403).send('Forbidden');
      return;
    }
    await deleteTranscription(req.params.id);
    const files = [transcription.path];
    files.push(...['.txt', '.json', '.tsv', '.srt', '.vtt'].map((ext) => transcription.path.replace(/\.[^/.]+$/, '') + ext));
    for (const file of files) {
      try {
        await fs.unlink(path.join(path.resolve(), 'files', file));
      }
      catch {}
    }
    res.status(204).send('Transcription deleted');
  }
  catch {
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
    browseTranscriptions();
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
    if (req.user.role !== 'admin' && transcription.user_id !== req.user.id) {
      res.status(403).send('Forbidden');
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
app.get('/api/transcriptions/file/:token/:format?', async (req, res) => {
  try {
    const { transcriptionId } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const transcription = await getTranscriptionById(transcriptionId);
    if (!transcription) {
      res.status(404).send('Transcription not found');
      return;
    }
    const filePath = path.join(path.resolve(), 'files', req.params.format ? transcription.path.replace(/\.[^/.]+$/, '') + '.' + req.params.format : transcription.path);
    if (await fs.stat(filePath).catch(() => false) === false) {
      res.status(404).send('File not found');
      return;
    }
    res.download(filePath, req.params.format ? transcription.filename.replace(/\.[^/.]+$/, '') + '.' + req.params.format : transcription.filename);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Download link expired');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
