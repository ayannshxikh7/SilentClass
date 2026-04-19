import { Router } from 'express';
import multer from 'multer';
import {
  getDashboard,
  previewTranscript,
  summarize,
  toggleFavorite,
  updateNoteMeta,
  uploadAudio,
  uploadPdf,
  uploadVideo
} from '../controllers/notes.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const mediaFileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio/video uploads are allowed for this endpoint.'));
  }
};

const pdfUpload = multer({
  dest: 'tmp/',
  limits: { fileSize: 20 * 1024 * 1024 }
});

const mediaUpload = multer({
  dest: 'tmp/',
  fileFilter: mediaFileFilter,
  limits: { fileSize: Number(process.env.MAX_MEDIA_UPLOAD_BYTES || 100 * 1024 * 1024) }
});

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.post('/summarize', summarize);
router.post('/transcript/preview', previewTranscript);
router.post('/upload/pdf', pdfUpload.single('pdf'), uploadPdf);
router.post('/upload/video', mediaUpload.single('video'), uploadVideo);
router.post('/upload/audio', mediaUpload.single('audio'), uploadAudio);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/meta', updateNoteMeta);

export default router;
