import { Moon, Search, Settings, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardLayout({ children, user, search, setSearch, onToggleTheme, darkMode }) {
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 p-4 md:p-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Welcome back</p>
              <h1 className="text-xl font-bold">{user?.name || 'Student'}</h1>
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto md:gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search notes..."
                />
              </div>
              <Link to="/settings" className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                <Settings size={18} />
              </Link>
              <button
                onClick={onToggleTheme}
                className="rounded-xl border border-slate-200 bg-white p-2 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-800"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
