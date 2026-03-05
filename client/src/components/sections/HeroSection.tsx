import { useEffect, useRef, useState } from 'react';

// ── Animated stat counter ──────────────────────────────────────────────────
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let current = 0;
        const step = Math.ceil(end / 60);
        const timer = setInterval(() => {
          current += step;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(current);
        }, 24);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Decorative SVG grid overlay ────────────────────────────────────────────
function GridOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[240, 480, 720, 960, 1200].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="900" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {[225, 450, 675].map((y) => (
        <line key={y} x1="0" y1={y} x2="1440" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <line x1="0" y1="900" x2="900" y2="0" stroke="rgba(201,168,76,0.1)" strokeWidth="1.5" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HeroSection() {
  const bgRef    = useRef<HTMLDivElement>(null);
  const headRef  = useRef<HTMLHeadingElement>(null);
  const subRef   = useRef<HTMLDivElement>(null);
  const eyeRef   = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Trigger animate-in on mount (above-fold — no intersection needed)
  useEffect(() => {
    const els = [eyeRef.current, headRef.current, subRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add('animate-in'), 300 + i * 200);
    });
    // Stats sidebar uses intersection via the data-animate system
    const statsEl = statsRef.current;
    if (!statsEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { statsEl.classList.add('animate-in'); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(statsEl);
    return () => obs.disconnect();
  }, []);

  // Parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--color-brand)]"
      style={{ height: '100svh', minHeight: '680px' }}
      aria-label="Hero"
    >
      {/* ── Background + parallax ── */}
      <div
        ref={bgRef}
        className="absolute inset-[-10%] bg-center bg-cover will-change-transform"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(26,60,94,0.3) 0%, rgba(26,60,94,0.65) 55%, rgba(26,60,94,0.96) 100%),
            url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1800&q=85&fit=crop')
          `,
          transform: `translateY(${scrollY * 0.22}px)`,
        }}
      />

      {/* ── Subtle geometric lines ── */}
      <GridOverlay />

      {/* ── Side stat strip (desktop) ── */}
      <aside
        ref={statsRef}
        data-animate
        className="hidden lg:flex absolute right-16 xl:right-24 top-1/2 -translate-y-1/2 z-10 flex-col gap-8"
        aria-label="Studio statistics"
      >
        {[
          { value: 24, suffix: '+', label: 'Years Practice' },
          { value: 180, suffix: '',  label: 'Projects Built' },
          { value: 31,  suffix: '',  label: 'Awards Won'     },
        ].map(({ value, suffix, label }, i) => (
          <div key={label} className="text-right">
            {i > 0 && <div className="w-full h-px bg-[var(--color-gold)]/25 mb-8" />}
            <span
              className="block text-white leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
              }}
            >
              <Counter end={value} suffix={suffix} />
            </span>
            <span
              className="block text-[var(--color-gold)] text-[0.6rem] tracking-[0.22em] uppercase mt-1"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </aside>

      {/* ── Main content (bottom-left) ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 md:px-16 lg:px-24 pb-16 md:pb-20 lg:pb-24">

        {/* Eyebrow */}
        <div
          ref={eyeRef}
          data-animate
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-9 h-px bg-[var(--color-gold)] shrink-0" />
          <span
            className="text-[var(--color-gold)] text-[0.65rem] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Architecture &amp; Interior Design
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headRef}
          data-animate
          data-delay="1"
          className="text-white mb-8 max-w-[13ch]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(3rem, 8vw, 8.5rem)',
            lineHeight: '0.93',
            letterSpacing: '-0.01em',
          }}
        >
          Space is the{' '}
          <em className="text-white/60" style={{ fontStyle: 'italic' }}>silent</em>
          {' '}language
        </h1>

        {/* Description + CTAs */}
        <div
          ref={subRef}
          data-animate
          data-delay="2"
          className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12"
        >
          <p
            className="text-white/55 leading-relaxed max-w-[34ch] m-0 shrink-0"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            }}
          >
            We craft buildings and interiors that balance precision with poetry —
            spaces that endure, inspire, and feel unmistakably alive.
          </p>

          <div className="flex items-center gap-4 shrink-0">
            {/* Primary CTA */}
            <a
              href="/projects"
              className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] text-[0.68rem] tracking-[0.2em] uppercase px-7 py-3.5 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              View Projects
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>

            {/* Ghost CTA */}
            <a
              href="/studio"
              className="inline-flex items-center text-white text-[0.68rem] tracking-[0.2em] uppercase px-7 py-3.5 border border-white/30 hover:border-white/70 hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Our Studio
            </a>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span
          className="text-white/40 text-[0.58rem] tracking-[0.28em] uppercase"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[var(--color-gold)] to-transparent animate-pulse" />
      </div>
    </section>
  );
}