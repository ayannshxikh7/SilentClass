import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, Heart, LayoutGrid, NotepadText, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import NoteComposer from '../components/NoteComposer';
import SummaryPanel from '../components/SummaryPanel';
import { useAuth } from '../contexts/AuthContext';
import { notesApi } from '../services/api';

const categoryOptions = ['All', 'General', 'Math', 'Science', 'History', 'Programming'];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState({ recentNotes: [], analytics: {}, categoryBreakdown: [] });
  const [latestNote, setLatestNote] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const params = {
        q: search || undefined,
        category: category !== 'All' ? category : undefined,
        favorite: favoritesOnly ? 'true' : undefined
      };
      const data = await notesApi.getDashboard(token, params);
      setDashboard(data);
    } catch {
      toast.error('Failed to load dashboard data.');
    }
  }, [search, category, favoritesOnly, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDashboard();
    }, 240);

    return () => clearTimeout(timeout);
  }, [loadDashboard]);

  const cards = useMemo(
    () => [
      { label: 'Total Notes', icon: NotepadText, value: dashboard.analytics?.totalNotes || 0 },
      { label: 'Favorites', icon: Heart, value: dashboard.analytics?.totalFavorites || 0 },
      { label: 'Categories', icon: LayoutGrid, value: dashboard.analytics?.categoriesTracked || 0 },
      { label: 'Reminders Due', icon: BellRing, value: dashboard.analytics?.remindersDue || 0 }
    ],
    [dashboard.analytics]
  );

  const handleFavorite = async (note) => {
    try {
      const updated = await notesApi.toggleFavorite(token, note._id);
      setLatestNote(updated);
      loadDashboard();
    } catch {
      toast.error('Could not update favorite status.');
    }
  };

  const handleMeta = async (note, payload) => {
    try {
      const updated = await notesApi.updateMeta(token, note._id, payload);
      setLatestNote(updated);
      loadDashboard();
    } catch {
      toast.error('Could not update note metadata.');
    }
  };

  return (
    <DashboardLayout
      user={user}
      darkMode={darkMode}
      search={search}
      setSearch={setSearch}
      onToggleTheme={() => setDarkMode((prev) => !prev)}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-card dark:bg-slate-900">
        <SlidersHorizontal size={16} className="text-brand-600" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {categoryOptions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          onClick={() => setFavoritesOnly((prev) => !prev)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${favoritesOnly ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}
        >
          Favorites only
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl bg-white p-4 shadow-card dark:bg-slate-900"
          >
            <card.icon size={18} className="mb-2 text-brand-600" />
            <p className="text-sm text-slate-500 dark:text-slate-300">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <NoteComposer token={token} onResult={setLatestNote} />
        <SummaryPanel note={latestNote} onToggleFavorite={handleFavorite} onMetaUpdate={handleMeta} />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Recent Notes</h2>
          {dashboard.recentNotes?.length ? (
            <ul className="space-y-3 text-sm">
              {dashboard.recentNotes.map((item) => (
                <li key={item._id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{item.category || 'General'}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-300">{item.shortSummary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No notes found for current filters.</p>
          )}
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Revision Reminders & Categories</h2>
          <div className="space-y-3 text-sm">
            <p className="rounded-xl bg-amber-50 p-3 text-amber-700">
              You have <strong>{dashboard.analytics?.remindersDue || 0}</strong> reminders due for revision.
            </p>
            <ul className="space-y-2">
              {dashboard.categoryBreakdown?.map((item) => (
                <li key={item._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-2 dark:border-slate-700">
                  <span>{item._id || 'General'}</span>
                  <span className="font-semibold">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
