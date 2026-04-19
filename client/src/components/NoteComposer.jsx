import { useState } from 'react';
import toast from 'react-hot-toast';
import { notesApi } from '../services/api';

const tabs = ['text', 'pdf', 'video', 'audio'];

export default function NoteComposer({ token, onResult }) {
  const [activeTab, setActiveTab] = useState('text');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [category, setCategory] = useState('General');
  const [revisionReminderAt, setRevisionReminderAt] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = { sourceType: activeTab, summaryType, content, videoUrl, category, revisionReminderAt };
      const data = await notesApi.summarize(token, payload);
      if (data.transcriptPreview) {
        setTranscriptPreview(data.transcriptPreview);
        setContent(data.transcriptPreview);
      }
      onResult(data);
      toast.success('Notes generated successfully.');
    } catch {
      toast.error('Failed to generate notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data =
        activeTab === 'pdf'
          ? await notesApi.uploadPdf(token, file)
          : activeTab === 'audio'
            ? await notesApi.uploadAudio(token, file)
            : await notesApi.uploadVideo(token, file);

      setContent(data.extractedText);
      if (data.transcriptPreview) {
        setTranscriptPreview(data.transcriptPreview);
      }
      toast.success('Content extracted successfully.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewFromUrl = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please provide a valid media URL.');
      return;
    }

    setLoading(true);
    try {
      const data = await notesApi.previewTranscript(token, videoUrl.trim());
      setTranscriptPreview(data.transcriptPreview);
      setContent(data.extractedText);
      toast.success('Transcript preview ready.');
    } catch {
      toast.error('Could not transcribe this URL. Try direct media file URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setTranscriptPreview('');
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'video' ? (
        <div className="mb-3 space-y-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Paste direct video/audio URL for transcription"
          />
          <button
            onClick={handlePreviewFromUrl}
            disabled={loading}
            className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
          >
            Preview Transcript from URL
          </button>
        </div>
      ) : null}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        placeholder="Paste lecture transcript, chapter content, or extracted text here..."
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
      />

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. Biology, Calculus)"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          type="datetime-local"
          value={revisionReminderAt}
          onChange={(e) => setRevisionReminderAt(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {activeTab !== 'text' ? (
        <label className="mt-3 block text-sm font-medium">
          Upload {activeTab.toUpperCase()} file
          <input type="file" className="mt-2 block w-full text-sm" onChange={handleFile} />
        </label>
      ) : null}

      {transcriptPreview ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <p className="mb-1 font-semibold text-brand-600">Transcript Preview</p>
          <p className="max-h-28 overflow-y-auto whitespace-pre-wrap">{transcriptPreview}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="short">Short Summary</option>
          <option value="detailed">Detailed Summary</option>
        </select>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Notes'}
        </button>
      </div>
    </section>
  );
}
