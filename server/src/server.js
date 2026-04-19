import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import noteRoutes from './routes/notes.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use((error, _req, res, _next) => {
  const status = error.status || (error.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  res.status(status).json({ message: error.message || 'Internal Server Error' });
});

export default app;
