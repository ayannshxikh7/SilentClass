import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execFileAsync = promisify(execFile);
const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_TRANSCRIBE_DOWNLOAD_BYTES || 100 * 1024 * 1024);

const LOCAL_WHISPER_SCRIPT_PATH =
  process.env.LOCAL_WHISPER_SCRIPT_PATH ||
  path.resolve(__dirname, '../../scripts/local_whisper_transcribe.py');

const LOCAL_WHISPER_MODEL = process.env.LOCAL_WHISPER_MODEL || 'base';
const LOCAL_WHISPER_COMPUTE_TYPE = process.env.LOCAL_WHISPER_COMPUTE_TYPE || 'int8';
const LOCAL_WHISPER_DEVICE = process.env.LOCAL_WHISPER_DEVICE || 'cpu';
const LOCAL_WHISPER_PYTHON_BIN = process.env.LOCAL_WHISPER_PYTHON_BIN || 'python3';

const transcribeMediaFile = async (filePath) => {
  try {
    const { stdout } = await execFileAsync(
      LOCAL_WHISPER_PYTHON_BIN,
      [LOCAL_WHISPER_SCRIPT_PATH, filePath],
      {
        env: {
          ...process.env,
          LOCAL_WHISPER_MODEL,
          LOCAL_WHISPER_COMPUTE_TYPE,
          LOCAL_WHISPER_DEVICE
        },
        maxBuffer: 10 * 1024 * 1024
      }
    );

    const normalized = stdout.trim();

    if (!normalized) {
      const error = new Error('Local Whisper returned empty output.');
      error.status = 500;
      throw error;
    }

    return normalized;
  } catch (error) {
    const details = error.stderr?.toString()?.trim() || error.message;

    const wrapped = new Error(
      `Local Whisper transcription failed. Ensure Python + requirements are installed. Details: ${details}`
    );

    wrapped.status = 503;
    throw wrapped;
  }
};

const isYouTubeUrl = (parsedUrl) => {
  const host = parsedUrl.hostname.toLowerCase();
  return host.includes('youtube.com') || host.includes('youtu.be');
};

const downloadYouTubeAudio = async (videoUrl) => {
  const tmpPath = path.join(
    os.tmpdir(),
    `silentclass-youtube-${Date.now()}.%(ext)s`
  );

  try {
    await execFileAsync(
      LOCAL_WHISPER_PYTHON_BIN,
      [
        '-m',
        'yt_dlp',
        '--no-playlist',
        '-f',
        'bestaudio/best',
        '-o',
        tmpPath,
        videoUrl
      ],
      {
        maxBuffer: 20 * 1024 * 1024
      }
    );

    const dir = path.dirname(tmpPath);
    const prefix = path.basename(tmpPath).replace('.%(ext)s', '');

    const files = await fsPromises.readdir(dir);

    const downloadedFile = files
      .filter((name) => name.startsWith(prefix))
      .map((name) => path.join(dir, name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

    if (!downloadedFile) {
      const error = new Error(
        'YouTube download completed but media file was not found in temp directory.'
      );
      error.status = 500;
      throw error;
    }

    const stat = await fsPromises.stat(downloadedFile);

    if (stat.size > MAX_DOWNLOAD_BYTES) {
      await fsPromises.unlink(downloadedFile).catch(() => {});

      const error = new Error(
        `YouTube media exceeded ${Math.round(
          MAX_DOWNLOAD_BYTES / (1024 * 1024)
        )}MB limit.`
      );

      error.status = 413;
      throw error;
    }

    return downloadedFile;
  } catch (error) {
    const details = error.stderr?.toString()?.trim() || error.message;

    const wrapped = new Error(
      `Unable to process YouTube URL. Ensure 'yt-dlp' is installed in Python environment. Details: ${details}`
    );

    wrapped.status = error.status || 400;
    throw wrapped;
  }
};

const downloadDirectMediaFromUrl = async (parsed) => {
  const response = await fetch(parsed.toString());

  if (!response.ok || !response.body) {
    const error = new Error('Unable to fetch media URL for transcription.');
    error.status = 400;
    throw error;
  }

  const contentLength = Number(response.headers.get('content-length'));

  if (contentLength && contentLength > MAX_DOWNLOAD_BYTES) {
    const error = new Error(
      `Remote file is too large. Max supported size is ${Math.round(
        MAX_DOWNLOAD_BYTES / (1024 * 1024)
      )}MB.`
    );

    error.status = 413;
    throw error;
  }

  const extension = path.extname(parsed.pathname) || '.media';
  const tmpPath = path.join(
    os.tmpdir(),
    `silentclass-url-${Date.now()}${extension}`
  );

  const writer = fs.createWriteStream(tmpPath);
  let total = 0;

  try {
    for await (const chunk of response.body) {
      total += chunk.length;

      if (total > MAX_DOWNLOAD_BYTES) {
        writer.destroy();
        await fsPromises.unlink(tmpPath).catch(() => {});

        const error = new Error(
          `Remote file exceeded ${Math.round(
            MAX_DOWNLOAD_BYTES / (1024 * 1024)
          )}MB limit.`
        );

        error.status = 413;
        throw error;
      }

      writer.write(chunk);
    }

    await new Promise((resolve, reject) => {
      writer.end(resolve);
      writer.on('error', reject);
    });

    return tmpPath;
  } catch (error) {
    await fsPromises.unlink(tmpPath).catch(() => {});
    throw error;
  }
};

const downloadFileFromUrl = async (url) => {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    const error = new Error('Invalid video URL.');
    error.status = 400;
    throw error;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error('Only HTTP(S) URLs are allowed.');
    error.status = 400;
    throw error;
  }

  if (isYouTubeUrl(parsed)) {
    return downloadYouTubeAudio(parsed.toString());
  }

  return downloadDirectMediaFromUrl(parsed);
};

export const extractTextFromPdf = async (filePath) => {
  const data = await fsPromises.readFile(filePath);
  const parsed = await pdf(data);
  return parsed.text;
};

export const extractTextFromVideo = async (filePath) =>
  transcribeMediaFile(filePath);

export const extractTextFromAudio = async (filePath) =>
  transcribeMediaFile(filePath);

export const extractTextFromVideoUrl = async (videoUrl) => {
  const downloadedPath = await downloadFileFromUrl(videoUrl);

  try {
    return await transcribeMediaFile(downloadedPath);
  } finally {
    await fsPromises.unlink(downloadedPath).catch(() => {});
  }
};