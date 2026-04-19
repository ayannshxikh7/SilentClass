import { Download, FileText, Heart, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function SummaryPanel({ note, onToggleFavorite, onMetaUpdate }) {
  const downloadText = () => {
    if (!note) return;
    const blob = new Blob([note.detailedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'silentclass-note'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!note) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(note.title, 40, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${note.category || 'General'}`, 40, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('Short Summary', 40, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(note.shortSummary, 515), 40, 118);

    const detailedStart = 180;
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Summary', 40, detailedStart);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(note.detailedSummary, 515), 40, detailedStart + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Keywords', 40, 740);
    doc.setFont('helvetica', 'normal');
    doc.text((note.keywords || []).join(', '), 40, 758);

    doc.save(`${note.title || 'silentclass-summary'}.pdf`);
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">AI Summary Output</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadPdf} className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">
            <FileText className="mr-1 inline" size={14} /> Export PDF
          </button>
          <button onClick={downloadText} className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">
            <Download className="mr-1 inline" size={14} /> Download TXT
          </button>
          <button className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">
            <Share2 className="mr-1 inline" size={14} /> Share
          </button>
        </div>
      </div>
      {note ? (
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{note.title}</h3>
            <button
              onClick={() => onToggleFavorite(note)}
              className={`rounded-full border p-2 ${note.favorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200'}`}
            >
              <Heart size={16} fill={note.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              defaultValue={note.category || 'General'}
              onBlur={(e) => onMetaUpdate(note, { category: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              type="datetime-local"
              value={note.revisionReminderAt ? new Date(note.revisionReminderAt).toISOString().slice(0, 16) : ''}
              onBlur={(e) => onMetaUpdate(note, { revisionReminderAt: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">Short Summary</p>
            <p>{note.shortSummary}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">Detailed Summary</p>
            <p className="max-h-56 overflow-y-auto whitespace-pre-wrap">{note.detailedSummary}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {note.keywords.map((item) => (
                <span key={item} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No summary generated yet.</p>
      )}
    </section>
  );
}
