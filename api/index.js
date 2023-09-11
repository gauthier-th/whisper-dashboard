import path from 'path';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import 'dotenv/config';
import { checkUserCredentials } from './database.js';

const app = express();

// Middleware to handle JWT errors
const handleJwtError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  }
};
const jwtMiddleware = expressjwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] });

app.use(express.json());

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Serve React App
app.use(express.static(path.join(path.resolve(), '../app/dist')));

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
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } else {
    res.status(400).send('Bad credentials');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
