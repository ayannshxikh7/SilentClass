import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import FormInput from '../components/FormInput';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.forgotPassword({ email });
      toast.success('Password reset email sent.');
    } catch {
      toast.error('Unable to process request right now.');
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will email a secure reset link so you can regain access quickly."
      sideContent={<h2 className="text-3xl font-bold leading-tight">Stay on track with your semester notes.</h2>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Registered Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
          Send Reset Link
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">
        Back to Login
      </Link>
    </AuthShell>
  );
}
