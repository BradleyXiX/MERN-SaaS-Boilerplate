import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Mail } from 'lucide-react';
import api from '../utils/api';
import MagneticButton from '../components/motion/MagneticButton';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a recovery link has been dispatched.');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Request failed');
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
          <h1 className="font-display text-2xl font-bold text-white">Key Recovery</h1>
          <p className="text-sm text-slate-400 mt-1">Request a cryptographic password reset token.</p>
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
              <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2" htmlFor="email">
                Operator Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-400 focus:bg-white/[0.05]"
                />
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <MagneticButton strength={0.2} className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Dispatching...' : 'Dispatch Reset Key'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </MagneticButton>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
