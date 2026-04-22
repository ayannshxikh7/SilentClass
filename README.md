# SilentClass – AI-Powered Smart Note-Taking Application

SilentClass is a startup-grade full-stack SaaS starter focused on helping students transform raw study content into polished notes with AI.

## Product Highlights

- **Premium authentication flow** (login, register, forgot password, remember me, validation, responsive UX).
- **Modern dashboard** with advanced search/filtering, analytics cards, reminders panel, favorites, category breakdown, and dark mode toggle.
- **Multi-source note creation**:
  - Raw text input
  - PDF upload and extraction
  - Video upload + audio upload + direct media URL transcription support
- **AI note generation**:
  - Structured title + short summary + detailed summary + keywords
  - OpenAI integration with a reliable fallback summarizer
- **Output actions**:
  - Save and persist notes
  - Download as text
  - Export professionally formatted PDF
  - Share action placeholders ready for product extension

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- React Router

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer + pdf-parse for content extraction
- OpenAI SDK for optional summarization
- Local Whisper (`faster-whisper`) + `yt-dlp` for media transcription

## Project Structure

```bash
.
├── client/                  # React + Tailwind front-end
└── server/                  # Express + MongoDB API
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp server/.env.example server/.env
```

Set your values in `server/.env`.

### 3) Run development servers

```bash
npm run dev:server
npm run dev:client
```

- API: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### Notes
- `GET /api/notes/dashboard`
- `POST /api/notes/summarize`
- `POST /api/notes/upload/pdf`
- `POST /api/notes/upload/video`
- `POST /api/notes/upload/audio`
- `POST /api/notes/transcript/preview`
- `PATCH /api/notes/:id/favorite`
- `PATCH /api/notes/:id/meta`

All `/api/notes/*` routes require `Authorization: Bearer <JWT>`.

## Production Notes

- Replace the fallback summarizer with dedicated pipelines for chunking + retrieval.
- Media transcription runs locally via `faster-whisper`; tune model and compute type for your hardware.
- Implement full PDF export service and secure share links.
- Add email provider workflow for actual reset tokens.
- Add push/email scheduler worker for revision reminders in production queues.
- Add cloud object storage for uploads (S3/GCS).

## Local Whisper (Free Audio/Video + YouTube Transcription)

This project now uses **local transcription only** for media (audio/video upload and URL transcription), powered by `faster-whisper`.

### Software / dependency checklist

Install these once on your machine:

1. **Python 3.10+**
2. **pip**
3. Python packages from `server/requirements-whisper.txt`:
   - `faster-whisper`
   - `yt-dlp` (used for YouTube URL download)

Run one command:

```bash
bash server/scripts/setup_local_whisper.sh
```

### .env settings (minimum)

```env
LOCAL_WHISPER_PYTHON_BIN=py
LOCAL_WHISPER_MODEL=base
LOCAL_WHISPER_COMPUTE_TYPE=int8
LOCAL_WHISPER_DEVICE=cpu
MAX_TRANSCRIBE_DOWNLOAD_BYTES=104857600
```

> On Linux/macOS, use `python3` instead of `py`.

### YouTube URL support

- `https://youtube.com/watch?...` and `https://youtu.be/...` are supported.
- Backend downloads audio with `yt-dlp`, then transcribes locally.
- If it fails, the API returns a detailed message including missing dependency hints.

### FFmpeg note

- The `ffmpeg` terminal command is **not strictly required** for basic transcription flow.
- If certain files fail decoding, installing FFmpeg can improve compatibility.

### Important

No OpenAI API key is required for audio/video transcription.  
OpenAI remains optional only for advanced text summarization.