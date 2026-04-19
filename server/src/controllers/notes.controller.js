import fs from 'fs/promises';
import Note from '../models/Note.js';
import { summarizeContent } from '../services/ai.service.js';
import {
  extractTextFromAudio,
  extractTextFromPdf,
  extractTextFromVideo,
  extractTextFromVideoUrl
} from '../services/extract.service.js';

const buildDashboardQuery = (userId, query) => {
  const filters = { userId };

  if (query.q) {
    const safeQ = query.q.slice(0, 120);
    filters.$or = [
      { title: { $regex: safeQ, $options: 'i' } },
      { shortSummary: { $regex: safeQ, $options: 'i' } },
      { keywords: { $regex: safeQ, $options: 'i' } }
    ];
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.favorite === 'true') {
    filters.favorite = true;
  }

  return filters;
};

export const getDashboard = async (req, res) => {
  const filters = buildDashboardQuery(req.user.sub, req.query);

  const [recentNotes, totalNotes, totalFavorites, remindersDue, categoriesAgg] = await Promise.all([
    Note.find(filters).sort({ createdAt: -1 }).limit(20),
    Note.countDocuments({ userId: req.user.sub }),
    Note.countDocuments({ userId: req.user.sub, favorite: true }),
    Note.countDocuments({ userId: req.user.sub, revisionReminderAt: { $lte: new Date() } }),
    Note.aggregate([
      { $match: { userId: req.user.sub } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ])
  ]);

  res.json({
    recentNotes,
    analytics: {
      totalNotes,
      totalFavorites,
      remindersDue,
      categoriesTracked: categoriesAgg.length
    },
    categoryBreakdown: categoriesAgg
  });
};

export const summarize = async (req, res) => {
  const { sourceType, content, summaryType, videoUrl, category, revisionReminderAt } = req.body;

  let transcriptPreview = null;
  let normalizedContent = content?.trim() || '';

  if ((sourceType === 'video' || sourceType === 'audio') && !normalizedContent && videoUrl) {
    transcriptPreview = await extractTextFromVideoUrl(videoUrl);
    normalizedContent = transcriptPreview;
  }

  if (!normalizedContent) {
    return res.status(400).json({ message: 'No content found for summarization.' });
  }

  const generated = await summarizeContent({ content: normalizedContent, summaryType });

  const note = await Note.create({
    userId: req.user.sub,
    sourceType,
    category: category || 'General',
    revisionReminderAt: revisionReminderAt || null,
    title: generated.title,
    shortSummary: generated.shortSummary,
    detailedSummary: generated.detailedSummary,
    keywords: generated.keywords
  });

  res.status(201).json({ ...note.toObject(), transcriptPreview });
};

export const toggleFavorite = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user.sub });
  if (!note) return res.status(404).json({ message: 'Note not found.' });

  note.favorite = !note.favorite;
  await note.save();
  return res.json(note);
};

export const updateNoteMeta = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user.sub });
  if (!note) return res.status(404).json({ message: 'Note not found.' });

  if (typeof req.body.category === 'string') {
    note.category = req.body.category.slice(0, 40) || 'General';
  }
  if (req.body.revisionReminderAt !== undefined) {
    note.revisionReminderAt = req.body.revisionReminderAt || null;
  }

  await note.save();
  return res.json(note);
};

export const uploadPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file.' });
  }

  const extractedText = await extractTextFromPdf(req.file.path);
  await fs.unlink(req.file.path).catch(() => {});
  return res.json({ extractedText });
};

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a video file.' });
  }

  const extractedText = await extractTextFromVideo(req.file.path);
  await fs.unlink(req.file.path).catch(() => {});
  return res.json({ extractedText, transcriptPreview: extractedText });
};

export const uploadAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an audio file.' });
  }

  const extractedText = await extractTextFromAudio(req.file.path);
  await fs.unlink(req.file.path).catch(() => {});
  return res.json({ extractedText, transcriptPreview: extractedText });
};

export const previewTranscript = async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ message: 'Video URL is required.' });
  }

  const transcriptPreview = await extractTextFromVideoUrl(videoUrl);
  return res.json({ transcriptPreview, extractedText: transcriptPreview });
};
