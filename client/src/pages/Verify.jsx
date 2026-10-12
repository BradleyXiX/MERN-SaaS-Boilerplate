import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import MagneticButton from '../components/motion/MagneticButton';

export function Verify() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying cryptographic token...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
        setTimeout(() => navigate('/login'), 2500);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || err.response?.data?.message || 'Verification token is invalid or expired.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Missing verification token.');
    }
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] px-6 py-12 text-slate-100 selection:bg-cyan-500/30">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-white">SaaS Pro</span>
        </Link>

        <div className="bento-card">
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            )}
            {status === 'success' && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            )}
            {status === 'error' && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2">
            {status === 'verifying' && 'Verification in Progress'}
            {status === 'success' && 'Account Verified'}
            {status === 'error' && 'Verification Unsuccessful'}
          </h1>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>

          <MagneticButton strength={0.2} className="w-full">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              Proceed to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

export default Verify;
