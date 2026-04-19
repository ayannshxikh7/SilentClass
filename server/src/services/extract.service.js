import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import os from 'os';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_TRANSCRIBE_DOWNLOAD_BYTES || 100 * 1024 * 1024);

const ensureTranscriptionClient = () => {
  if (!client) {
    const error = new Error('Transcription requires OPENAI_API_KEY.');
    error.status = 503;
    throw error;
  }
};

const transcribeMediaFile = async (filePath) => {
  ensureTranscriptionClient();

  const fileStream = fs.createReadStream(filePath);
  try {
    const transcript = await client.audio.transcriptions.create({
      file: fileStream,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe'
    });
    return transcript.text;
  } finally {
    fileStream.destroy();
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

  const response = await fetch(parsed.toString());
  if (!response.ok || !response.body) {
    const error = new Error('Unable to fetch media URL for transcription.');
    error.status = 400;
    throw error;
  }

  const contentLength = Number(response.headers.get('content-length'));
  if (contentLength && contentLength > MAX_DOWNLOAD_BYTES) {
    const error = new Error(`Remote file is too large. Max supported size is ${Math.round(MAX_DOWNLOAD_BYTES / (1024 * 1024))}MB.`);
    error.status = 413;
    throw error;
  }

  const extension = path.extname(parsed.pathname) || '.media';
  const tmpPath = path.join(os.tmpdir(), `silentclass-url-${Date.now()}${extension}`);
  const writer = fs.createWriteStream(tmpPath);

  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > MAX_DOWNLOAD_BYTES) {
      writer.destroy();
      await fsPromises.unlink(tmpPath).catch(() => {});
      const error = new Error(`Remote file exceeded ${Math.round(MAX_DOWNLOAD_BYTES / (1024 * 1024))}MB limit.`);
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
};

export const extractTextFromPdf = async (filePath) => {
  const data = await fsPromises.readFile(filePath);
  const parsed = await pdf(data);
  return parsed.text;
};

export const extractTextFromVideo = async (filePath) => transcribeMediaFile(filePath);

export const extractTextFromAudio = async (filePath) => transcribeMediaFile(filePath);

export const extractTextFromVideoUrl = async (videoUrl) => {
  const downloadedPath = await downloadFileFromUrl(videoUrl);
  try {
    return await transcribeMediaFile(downloadedPath);
  } finally {
    await fsPromises.unlink(downloadedPath).catch(() => {});
  }
};
