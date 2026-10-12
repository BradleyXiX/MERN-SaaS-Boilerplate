import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  Activity,
  Layers,
  Database,
  Terminal,
  CheckCircle2,
  Server,
  Zap,
} from 'lucide-react';
import HeroWebGLCanvas from '../components/webgl/HeroWebGLCanvas';
import MagneticButton from '../components/motion/MagneticButton';
import { initSmoothScroll } from '../lib/smooth-scroll';

gsap.registerPlugin(ScrollTrigger);

export function Landing() {
  const containerRef = useRef(null);
  const narrativeRef = useRef(null);

  // Initialize unified Lenis smooth scroll ticker
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      lenis?.destroy();
    };
  }, []);

  // Scoped GSAP narrative sequence with scrub: 1 and section pinning
  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.narrative-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: narrativeRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) return;

        tl.fromTo(
          card,
          { yPercent: 120, opacity: 0, scale: 0.92 },
          { yPercent: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
          `step-${index}`
        );

        if (cards[index - 1]) {
          tl.to(
            cards[index - 1],
            { scale: 0.94, opacity: 0.35, filter: 'blur(6px)', duration: 0.8 },
            `step-${index}`
          );
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#090B10] text-slate-100 selection:bg-cyan-500/30">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.06] bg-[#090B10]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-white">SaaS Pro</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">Enterprise Core</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <MagneticButton strength={0.25}>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Deploy Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
          </nav>
        </div>
      </header>

      {/* Hero Section with React Three Fiber WebGL */}
      <section className="relative flex min-h-screen flex-col items-center justify-center pt-28 pb-20 px-6 text-center overflow-hidden">
        <HeroWebGLCanvas />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
              Zero-Trust Architecture & Telemetry
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.08] mb-8">
            High-Velocity <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Cloud Infrastructure
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 font-normal leading-relaxed mb-10">
            Engineered for mission-critical SaaS workloads with cryptographic HttpOnly cookie sessions, 
            runtime Zod contract verification, and sub-millisecond edge telemetry.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.3}>
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-semibold text-slate-950 shadow-xl shadow-cyan-500/25 hover:bg-cyan-300 transition-colors"
              >
                Initialize Free Cluster
                <ArrowRight className="h-5 w-5" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.3}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-8 py-4 font-medium text-slate-200 backdrop-blur-lg hover:border-white/20 hover:bg-white/[0.08] transition-all"
              >
                <Terminal className="h-4 w-4 text-cyan-400" />
                Live Telemetry Demo
              </Link>
            </MagneticButton>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl border-t border-white/[0.08] pt-8">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white">99.99%</div>
              <div className="text-xs text-slate-400 mt-1">Edge Availability</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-cyan-400">&lt; 1.8ms</div>
              <div className="text-xs text-slate-400 mt-1">P99 Gateway Latency</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white">RFC 7807</div>
              <div className="text-xs text-slate-400 mt-1">Problem Details</div>
            </div>
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">Strict</div>
              <div className="text-xs text-slate-400 mt-1">SameSite Cookie Auth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Bento Architecture Grid */}
      <section className="relative py-28 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">System Architecture</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-3">
              Precision Engineering. Zero Compromises.
            </h2>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Every layer adheres strictly to production defense standards, typed contracts, and measurable budgets.
            </p>
          </div>

          {/* 12-Column Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Primary Hero Card: 8 Columns */}
            <article className="bento-card md:col-span-8 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">Cryptographic Session Defense</h3>
                      <p className="text-xs text-slate-400">HttpOnly / Secure / SameSite=Strict cookies</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-mono text-xs text-emerald-400">
                    XSS Immune
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">
                  Tokens are never exposed to browser storage or JavaScript context. Automatic rotation routines 
                  safeguard against replay attacks with server-side hash indexing.
                </p>
              </div>

              {/* Terminal Code Mockup */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2">session-handshake.ts</span>
                </div>
                <div className="text-cyan-400">res.cookie('saas_auth_session', accessToken, {'{'}</div>
                <div className="pl-4 text-slate-400">httpOnly: true, secure: true, sameSite: 'strict'</div>
                <div className="text-cyan-400">{'}'});</div>
              </div>
            </article>

            {/* Secondary Snapshot: 4 Columns */}
            <article className="bento-card md:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Live Stream Telemetry</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Continuous edge health checks and connection pooling monitoring in real time.
                </p>
              </div>

              <div className="border-t border-white/[0.08] pt-4">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-400">Throughput</span>
                  <span className="text-cyan-400">42,800 req/s</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[78%]" />
                </div>
              </div>
            </article>

            {/* Tertiary Bento: 4 Columns */}
            <article className="bento-card md:col-span-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Runtime Zod Contracts</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every query parameter, mutation body, and webhook header is parsed and validated before reaching route handlers.
              </p>
            </article>

            {/* Bento Anchor: 8 Columns */}
            <article className="bento-card md:col-span-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Database Sanitization & NoSQL Guards</h3>
                    <p className="text-xs text-slate-400">Sanitized queries against operator injections</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Zero arbitrary string concatenations. Strict query parameterization with MongoDB sanitization protects multi-tenant boundaries.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Pinned Scroll-Scrubbed Narrative Sequence */}
      <section ref={narrativeRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden border-t border-white/[0.06] bg-[#090B10]">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">Sequential Lifecycle</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">
            The Request Journey
          </h2>
        </div>

        <div className="relative h-[380px] w-full max-w-2xl px-6">
          {/* Card 1 */}
          <div className="narrative-card absolute inset-0 rounded-2xl border border-white/10 bg-[#0F131C] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-cyan-400">PHASE 01</span>
                <Server className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Ingress & Rate Limiting</h3>
              <p className="text-slate-400 leading-relaxed">
                Requests encounter the express sliding-window rate limiter, mitigating brute-force attacks across IP clusters.
              </p>
            </div>
            <div className="font-mono text-xs text-slate-500 border-t border-white/[0.08] pt-4">
              Window: 15min / Max: 5 failed attempts
            </div>
          </div>

          {/* Card 2 */}
          <div className="narrative-card absolute inset-0 rounded-2xl border border-white/10 bg-[#0F131C] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-amber-400">PHASE 02</span>
                <Layers className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Contract Validation (Zod)</h3>
              <p className="text-slate-400 leading-relaxed">
                Incoming payloads are validated strictly against runtime schemas, returning RFC 7807 problem details on violation.
              </p>
            </div>
            <div className="font-mono text-xs text-slate-500 border-t border-white/[0.08] pt-4">
              Header: application/problem+json
            </div>
          </div>

          {/* Card 3 */}
          <div className="narrative-card absolute inset-0 rounded-2xl border border-white/10 bg-[#0F131C] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-emerald-400">PHASE 03</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Cookie Session Handshake</h3>
              <p className="text-slate-400 leading-relaxed">
                Upon verification, cryptographically signed cookies are dispatched with HttpOnly and SameSite=Strict flags.
              </p>
            </div>
            <div className="font-mono text-xs text-slate-500 border-t border-white/[0.08] pt-4">
              Cookie: saas_auth_session (Encrypted)
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6 text-center text-sm text-slate-500 bg-[#090B10]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-display font-semibold text-white">SaaS Pro Architecture</span>
          </div>
          <p>© 2026 SaaS Pro Enterprise. Adhering to .agents orchestrator specifications.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
