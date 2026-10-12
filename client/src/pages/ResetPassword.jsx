import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import MagneticButton from '../components/motion/MagneticButton';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Missing or invalid reset token in URL parameters.');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      setMessage(res.data.message || 'Passkey updated successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] px-6 py-12 text-slate-100 selection:bg-cyan-500/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-white">SaaS Pro</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">Configure New Passkey</h1>
          <p className="text-sm text-slate-400 mt-1">Set a fresh cryptographic credential for your account.</p>
        </div>

        <div className="bento-card">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2" htmlFor="password">
                New Passkey (Min 8 chars, 1 uppercase, 1 number)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-400 focus:bg-white/[0.05]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <MagneticButton strength={0.2} className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating Key...' : 'Save New Passkey'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </MagneticButton>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Return to Authentication
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
