import { Link, useNavigate } from 'react-router-dom';
import { BookOpenText } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import FormInput from '../components/FormInput';
import { validateAuthFields } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateAuthFields(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await login(form, form.rememberMe);
      toast.success('Welcome back to SilentClass.');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <AuthShell
      title="Login to your SilentClass workspace"
      subtitle="Convert lectures, PDFs, and videos into polished AI notes in seconds."
      sideContent={
        <>
          <div>
            <BookOpenText className="mb-4" size={40} />
            <h2 className="text-3xl font-bold leading-tight">Smarter notes for high-performance students.</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>• AI-generated short and detailed lecture summaries</li>
            <li>• Upload PDFs, transcripts, and videos</li>
            <li>• Organize and export notes professionally</li>
          </ul>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="you@university.edu"
        />
        <FormInput
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="••••••••"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New to SilentClass?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
