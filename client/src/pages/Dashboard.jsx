import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Users,
  Server,
  Zap,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Terminal,
  Cpu,
} from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import MagneticButton from '../components/motion/MagneticButton';

export function Dashboard() {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [telemetry, setTelemetry] = useState({
    activeNodes: 142,
    p99Latency: 1.84,
    requestThroughput: 48210,
    systemUptime: 99.994,
    healthStatus: 'HEALTHY',
  });
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated real-time telemetry fluctuations
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        p99Latency: Number((1.75 + Math.random() * 0.25).toFixed(2)),
        requestThroughput: Math.floor(47000 + Math.random() * 3000),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await api.get('/api/health');
      setTelemetry((prev) => ({
        ...prev,
        p99Latency: Number((1.7 + Math.random() * 0.2).toFixed(2)),
      }));
    } catch {
      // Keep existing data
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090B10]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <header className="border-b border-white/[0.06] bg-[#0F131C]/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-base font-bold text-white">SaaS Pro</div>
                <div className="font-mono text-[10px] text-cyan-400">Telemetry Console</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border-r border-white/10 pr-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-slate-400">Cluster: us-east-1a</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-bold text-cyan-400">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] font-mono text-slate-400">{user?.email || 'admin@saaspro.internal'}</div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Console Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Session Verified: HttpOnly Strict Cookie
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Cluster Orchestration & Telemetry
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time monitoring across distributed edge execution workers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton strength={0.2}>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
                Refresh State
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* 4 Telemetry Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bento-card">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-mono uppercase tracking-wider">Edge Latency</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-white">
              {telemetry.p99Latency} <span className="text-sm font-normal text-cyan-400">ms</span>
            </div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> P99 within threshold
            </div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-mono uppercase tracking-wider">Throughput</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-white">
              {telemetry.requestThroughput.toLocaleString()} <span className="text-sm font-normal text-slate-400">req/s</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">Nominal cluster capacity</div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-mono uppercase tracking-wider">Active Workers</span>
              <Server className="h-4 w-4 text-blue-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-white">
              {telemetry.activeNodes} <span className="text-sm font-normal text-slate-400">nodes</span>
            </div>
            <div className="text-xs text-emerald-400 mt-2">Zero partition faults</div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-mono uppercase tracking-wider">System Durability</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-emerald-400">
              {telemetry.systemUptime}%
            </div>
            <div className="text-xs text-slate-400 mt-2">30-day continuous SLO</div>
          </div>
        </div>

        {/* Bento Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Telemetry Stream (8 cols) */}
          <div className="bento-card lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Real-Time Ingress Stream</h2>
                    <p className="text-xs text-slate-400">Continuous sub-second HTTP routing audit</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  LIVE STREAM
                </span>
              </div>

              {/* Real-time streaming log simulation */}
              <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-white/10">
                  <span>TIMESTAMP</span>
                  <span>METHOD / ROUTE</span>
                  <span>STATUS</span>
                  <span>DURATION</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">18:42:01.104</span>
                  <span className="text-cyan-400 font-semibold">GET /api/health</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span className="text-slate-400">1.2ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">18:42:02.348</span>
                  <span className="text-cyan-400 font-semibold">POST /api/auth/refresh-token</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span className="text-slate-400">3.4ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">18:42:03.882</span>
                  <span className="text-cyan-400 font-semibold">GET /api/auth/me</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span className="text-slate-400">2.1ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">18:42:04.219</span>
                  <span className="text-cyan-400 font-semibold">GET /api/v1/telemetry/nodes</span>
                  <span className="text-emerald-400">200 OK</span>
                  <span className="text-slate-400">1.8ms</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs font-mono text-slate-400">
              <span>Zod Schema Validation: ACTIVE</span>
              <span className="text-cyan-400">Protocol: RFC 7807 Standard</span>
            </div>
          </div>

          {/* User Profile & Security Details (4 cols) */}
          <div className="bento-card lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Identity & Access</h2>
                  <p className="text-xs text-slate-400">RBAC security perimeter</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Account Holder</div>
                  <div className="text-sm font-semibold text-white mt-1">{user?.name || 'Administrator'}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Email Address</div>
                  <div className="text-sm font-semibold text-white mt-1">{user?.email || 'admin@saaspro.internal'}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Role Authorization</div>
                  <div className="inline-flex items-center gap-1.5 rounded bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono text-cyan-400 border border-cyan-500/20 mt-1 capitalize">
                    {user?.role || 'admin'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/[0.08] pt-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Transport Security:</span>
                <span className="text-emerald-400">TLS 1.3 / Strict</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
