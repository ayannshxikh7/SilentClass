import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import FormInput from '../components/FormInput';
import { validateAuthFields } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateAuthFields(form, true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register(form);
      toast.success('Account created successfully. You can login now.');
      navigate('/login');
    } catch {
      toast.error('Unable to create account.');
    }
  };

  return (
    <AuthShell
      title="Create your SilentClass account"
      subtitle="Start turning lengthy content into organized study-ready notes."
      sideContent={<h2 className="text-3xl font-bold leading-tight">Join students who study smarter with AI.</h2>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Full Name"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <FormInput
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Sign Up</button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Login here
        </Link>
      </p>
    </AuthShell>
  );
}
