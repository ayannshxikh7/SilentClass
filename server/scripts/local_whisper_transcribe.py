#!/usr/bin/env python3
import os
import sys


def fail(message: str, code: int = 1):
    sys.stderr.write(message + "\n")
    sys.exit(code)


if len(sys.argv) < 2:
    fail("Usage: local_whisper_transcribe.py <audio_or_video_file>")

file_path = sys.argv[1]
if not os.path.exists(file_path):
    fail(f"File not found: {file_path}")

try:
    from faster_whisper import WhisperModel
except Exception:
    fail(
        "faster-whisper is not installed. Run: python3 -m pip install -r server/requirements-whisper.txt"
    )

model_size = os.getenv("LOCAL_WHISPER_MODEL", "base")
compute_type = os.getenv("LOCAL_WHISPER_COMPUTE_TYPE", "int8")
device = os.getenv("LOCAL_WHISPER_DEVICE", "cpu")

try:
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    segments, _ = model.transcribe(file_path)
    text = " ".join(segment.text.strip() for segment in segments if segment.text and segment.text.strip()).strip()
    if not text:
        fail("No transcript text detected from media file.")
    print(text)
except Exception as exc:
    fail(f"Local whisper transcription error: {exc}")
