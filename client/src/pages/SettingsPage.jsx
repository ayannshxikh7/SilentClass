import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    theme: user?.preferences?.theme || 'system',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
    reminderFrequency: user?.preferences?.reminderFrequency || 'weekly'
  });

  const onSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: form.name,
        preferences: {
          theme: form.theme,
          notificationsEnabled: form.notificationsEnabled,
          reminderFrequency: form.reminderFrequency
        }
      });
      toast.success('Profile settings updated.');
    } catch {
      toast.error('Unable to update profile settings.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-card md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile & Preferences</h1>
          <Link to="/dashboard" className="text-sm font-semibold text-brand-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        <form className="space-y-5" onSubmit={onSave}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Full Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Theme</span>
            <select
              value={form.theme}
              onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.notificationsEnabled}
              onChange={(e) => setForm((prev) => ({ ...prev, notificationsEnabled: e.target.checked }))}
            />
            Enable revision reminders
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Reminder Frequency</span>
            <select
              value={form.reminderFrequency}
              onChange={(e) => setForm((prev) => ({ ...prev, reminderFrequency: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
