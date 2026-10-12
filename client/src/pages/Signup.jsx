import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import MagneticButton from '../components/motion/MagneticButton';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signup, loading } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    const res = await signup(email, password, name);
    if (res.success) {
      setSuccessMessage(res.message || 'Account provisioned. Please check email for verification.');
    } else {
      setLocalError(res.error || 'Failed to initialize account');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] px-6 py-12 text-slate-100 selection:bg-cyan-500/30">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-white">SaaS Pro</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">Deploy New Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Initialize isolated tenant infrastructure.</p>
        </div>

        {/* Card Container */}
        <div className="bento-card">
          {localError && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {localError}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2" htmlFor="name">
                Operator Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-400 focus:bg-white/[0.05]"
                />
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2" htmlFor="email">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-400 focus:bg-white/[0.05]"
                />
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2" htmlFor="password">
                Passkey (Min 8 chars, 1 uppercase, 1 number)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-400 focus:bg-white/[0.05]"
                />
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <MagneticButton strength={0.2} className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Provisioning...' : 'Initialize Workspace'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </MagneticButton>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an active cluster?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
