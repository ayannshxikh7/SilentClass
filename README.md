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
- OpenAI SDK for summarization + Whisper-style transcription

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
- Transcription is live via OpenAI audio transcription API; tune model and chunking for your content domain.
- Implement full PDF export service and secure share links.
- Add email provider workflow for actual reset tokens.
- Add push/email scheduler worker for revision reminders in production queues.
- Add cloud object storage for uploads (S3/GCS).


## Local Whisper (Free Audio/Video Transcription)

You can run audio/video transcription fully locally (without OpenAI billing) using `faster-whisper`.

### One-time software needed
- Python 3.10+
- `pip` (Python package installer)

### Quick setup
```bash
bash server/scripts/setup_local_whisper.sh
```

Then set these variables in `server/.env`:
```env
LOCAL_TRANSCRIBE_MODE=local-only
LOCAL_WHISPER_MODEL=base
LOCAL_WHISPER_COMPUTE_TYPE=int8
LOCAL_WHISPER_DEVICE=cpu
```

Now start the backend normally:
```bash
npm run dev:server
```

### Modes
- `LOCAL_TRANSCRIBE_MODE=local-only` → force local whisper only
- `LOCAL_TRANSCRIBE_MODE=prefer-local` → local first, fallback to OpenAI if available
- `LOCAL_TRANSCRIBE_MODE=openai-only` → force OpenAI only

The local transcriber script is at `server/scripts/local_whisper_transcribe.py`.
