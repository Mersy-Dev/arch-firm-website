import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ─── Props ─────────────────────────────────────────────────────────────────
interface CTABannerProps {
  headline?: string;
  ctaLink?: string;
}

// ─── Magnetic button (follows cursor) ─────────────────────────────────────
function MagneticCTA({ href }: { href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="
        group relative inline-flex items-center justify-center gap-3
        w-44 h-44 rounded-full
        bg-[var(--color-gold)] text-[var(--color-ink)]
        cursor-pointer no-underline
        shadow-[0_0_0_1px_var(--color-gold)]
        hover:shadow-[0_0_0_8px_rgba(201,168,76,0.15)]
        transition-shadow duration-300
        shrink-0
      "
      aria-label="Start your project"
    >
      {/* Rotating ring */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin-slow"
        viewBox="0 0 176 176"
        fill="none"
        aria-hidden="true"
        style={{ animation: 'ctaSpin 18s linear infinite' }}
      >
        <circle cx="88" cy="88" r="82" stroke="rgba(26,60,94,0.15)" strokeWidth="1" strokeDasharray="4 8" />
      </svg>

      {/* Label */}
      <span className="flex flex-col items-center gap-1 z-10">
        <span
          className="text-[0.62rem] tracking-[0.22em] uppercase leading-tight text-center"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Start Your
        </span>
        <span
          className="text-[0.62rem] tracking-[0.22em] uppercase leading-tight text-center"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Project
        </span>
        {/* Arrow */}
        <svg
          width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="mt-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <path d="M3 13L13 3M13 3H6M13 3v7" />
        </svg>
      </span>
    </motion.a>
  );
}

// ─── Cursor follower (desktop only) ───────────────────────────────────────
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 80, damping: 18 });
  const sy = useSpring(y, { stiffness: 80, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-64 h-64 rounded-full pointer-events-none z-0 hidden lg:block"
      style={{
        x: useTransform(sx, (v) => v - 128),
        y: useTransform(sy, (v) => v - 128),
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  );
}

// ─── Animated marquee strip ────────────────────────────────────────────────
function Marquee() {
  const items = ['Architecture', '·', 'Interiors', '·', 'Master Planning', '·', 'Sustainability', '·', 'Heritage', '·'];
  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/10 py-4" aria-hidden="true">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className={`
              shrink-0 text-[0.65rem] tracking-[0.28em] uppercase
              ${item === '·' ? 'text-[var(--color-gold)]' : 'text-white/30'}
            `}
            style={{ fontFamily: 'var(--font-body)', fontWeight: item === '·' ? 700 : 400 }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Floating stats ────────────────────────────────────────────────────────
const STATS = [
  { value: '180+', label: 'Projects' },
  { value: '24',   label: 'Years'    },
  { value: '31',   label: 'Awards'   },
  { value: '4',    label: 'Continents' },
];

// ─── Main CTABanner ────────────────────────────────────────────────────────
export default function CTABanner({
  headline = 'Have a project in mind?',
  ctaLink  = '/contact',
}: CTABannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Split headline into words for staggered reveal
  const words = headline.split(' ');

  return (
    <>
      <style>{`
        @keyframes ctaSpin { to { transform: rotate(360deg); } }
      `}</style>

      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-[var(--color-ink)]"
        aria-labelledby="cta-heading"
      >
        <CursorGlow />

        {/* ── Background: large architectural image, very dark ── */}
        <div
          className="absolute inset-0 bg-center bg-cover opacity-[0.07]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=60&fit=crop')`,
          }}
          aria-hidden="true"
        />

        {/* ── Grid pattern overlay ── */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>

        {/* ── Diagonal gold accent line ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1="600" x2="1440" y2="0" stroke="rgba(201,168,76,0.06)" strokeWidth="2" />
          <line x1="0" y1="480" x2="960" y2="0" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
        </svg>

        {/* ── Marquee ── */}
        <Marquee />

        {/* ── Main content ── */}
        <div className="container-main relative z-10 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-16 lg:gap-12">

            {/* ── Left: headline + sub ── */}
            <div className="flex-1 max-w-2xl">

              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-px bg-[var(--color-gold)] shrink-0" />
                <span
                  className="text-[var(--color-gold)] text-[0.65rem] tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  Let's Build Together
                </span>
              </motion.div>

              {/* Headline — word by word */}
              <h2
                id="cta-heading"
                className="m-0 mb-8 leading-[1.0]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 300,
                  fontSize: 'clamp(2.8rem, 6.5vw, 7rem)',
                }}
                aria-label={headline}
              >
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    animate={visible ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.75,
                      delay: 0.1 + i * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`
                      inline-block mr-[0.25em]
                      ${i === words.length - 1
                        ? 'text-[var(--color-gold)] italic'
                        : 'text-white'
                      }
                    `}
                    style={{ fontStyle: i === words.length - 1 ? 'italic' : 'normal' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-white/45 leading-relaxed m-0 mb-12 max-w-[44ch]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.95rem' }}
              >
                Whether it's a private residence, a mixed-use development, or a cultural institution —
                every great project begins with a single conversation. Tell us about yours.
              </motion.p>

              {/* Contact details */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-6 sm:gap-10"
              >
                <a
                  href="mailto:studio@forma.com"
                  className="group flex items-center gap-3 no-underline"
                >
                  <div className="w-9 h-9 flex items-center justify-center border border-white/15 group-hover:border-[var(--color-gold)]/50 transition-colors duration-200">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                      <rect x="1" y="3" width="14" height="10" rx="1" />
                      <path d="M1 4l7 5 7-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/30 text-[0.58rem] tracking-[0.18em] uppercase m-0 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>Email</p>
                    <p className="text-white text-sm m-0 group-hover:text-[var(--color-gold)] transition-colors duration-200" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>studio@forma.com</p>
                  </div>
                </a>

                <div className="w-px bg-white/10 hidden sm:block" />

                <a
                  href="tel:+12125550100"
                  className="group flex items-center gap-3 no-underline"
                >
                  <div className="w-9 h-9 flex items-center justify-center border border-white/15 group-hover:border-[var(--color-gold)]/50 transition-colors duration-200">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                      <path d="M2 2h4l1.5 3.5-2 1.5a9 9 0 0 0 3.5 3.5l1.5-2L14 10v4a1 1 0 0 1-1 1C5.5 15 1 9 1 3a1 1 0 0 1 1-1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/30 text-[0.58rem] tracking-[0.18em] uppercase m-0 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>Phone</p>
                    <p className="text-white text-sm m-0 group-hover:text-[var(--color-gold)] transition-colors duration-200" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>+1 (212) 555-0100</p>
                  </div>
                </a>
              </motion.div>
            </div>

            {/* ── Right: magnetic CTA + stats ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={visible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-end gap-12 shrink-0"
            >
              {/* Magnetic circle CTA */}
              <MagneticCTA href={ctaLink} />

              {/* Stats row */}
              <div className="flex items-center gap-8">
                {STATS.map(({ value, label }, i) => (
                  <div key={label} className="flex items-center gap-8">
                    {i > 0 && <div className="w-px h-8 bg-white/10" />}
                    <div className="text-center">
                      <span
                        className="block text-white leading-none"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 300,
                          fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                        }}
                      >
                        {value}
                      </span>
                      <span
                        className="block text-white/35 text-[0.58rem] tracking-[0.2em] uppercase mt-1"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}