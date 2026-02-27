import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProjectsQuery } from '@/services/projectsApi';
import type { Project, ProjectType } from '@/types/project.types';

// ─── Types ───────────────────────────────────────────────────────────────────
type Category = 'All' | 'residential' | 'commercial' | 'hospitality' | 'mixed' | 'renovation';
type ViewMode  = 'grid' | 'list';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All',         value: 'All' },
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial',  value: 'commercial' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Mixed Use',   value: 'mixed' },
  { label: 'Renovation',  value: 'renovation' },
];

// ─── Cursor follower ──────────────────────────────────────────────────────────
function CursorFollower() {
  const [pos,     setPos]     = useState({ x: -200, y: -200 });
  const [label,   setLabel]   = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-cursor]') as HTMLElement | null;
      if (t) { setLabel(t.dataset.cursor ?? ''); setVisible(true); }
    };
    const out = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-cursor]');
      if (!t) setVisible(false);
    };
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none hidden lg:flex items-center justify-center"
      animate={{ x: pos.x - 40, y: pos.y - 40, scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.5 }}
      style={{ width: 80, height: 80, borderRadius: '50%', top: 0, left: 0 }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--color-brand)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 2,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
          <path d="M3 13L13 3M13 3H6M13 3v7" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '0.48rem',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)', fontWeight: 500,
        }}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Hero skeleton ────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden flex flex-col justify-end animate-pulse"
      style={{ minHeight: 'clamp(400px, 52vw, 620px)', background: 'var(--color-brand)' }}>
      <div className="container-main relative z-10 pb-14 md:pb-18">
        <div style={{ width: 80, height: 8, background: 'rgba(255,255,255,0.1)', marginBottom: 32 }} />
        <div style={{ width: '45%', height: 80, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
        <div style={{ width: '35%', height: 14, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}

// ─── Page hero ────────────────────────────────────────────────────────────────
function Hero({ total, featuredProjects }: { total: number; featuredProjects: Project[] }) {
  const [tick, setTick] = useState(0);

  // ✅ Reset tick whenever the featured list changes to avoid out-of-bounds access
  useEffect(() => {
    setTick(0);
  }, [featuredProjects.length]);

  useEffect(() => {
    if (featuredProjects.length === 0) return;
    const t = setInterval(() => setTick(n => (n + 1) % featuredProjects.length), 5000);
    return () => clearInterval(t);
  }, [featuredProjects.length]);

  // ✅ Safe access — fallback to index 0, then null-check
  const current = featuredProjects[tick] ?? featuredProjects[0];

  if (!current) {
    return (
      <div className="relative overflow-hidden flex flex-col justify-end"
        style={{ minHeight: 'clamp(400px, 52vw, 620px)', background: 'var(--color-brand)' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 1440 620" preserveAspectRatio="none" aria-hidden="true">
          <line x1="480" y1="0" x2="480" y2="620" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          <line x1="960" y1="0" x2="960" y2="620" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          <line x1="0" y1="620" x2="1440" y2="0" stroke="rgba(201,168,76,0.08)" strokeWidth="1.5"/>
        </svg>
        <div className="container-main relative z-10 pb-14 md:pb-18">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="no-underline" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
            >Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>／</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
              Portfolio
            </span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 30, height: 1, background: 'var(--color-gold)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
              Selected Work
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(3rem, 7.5vw, 7rem)', lineHeight: 0.92, color: 'white', margin: '0 0 1rem' }}>
            Built with intention.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: 'clamp(0.82rem, 1.15vw, 0.96rem)',
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '46ch', margin: 0 }}>
            {total} projects — each one shaped by its place, its people, and its purpose.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden flex flex-col justify-end"
      style={{ minHeight: 'clamp(400px, 52vw, 620px)', background: 'var(--color-brand)' }}>

      {/* Cycling background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={tick}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            backgroundImage: `
              linear-gradient(105deg, rgba(26,60,94,0.96) 0%, rgba(26,60,94,0.72) 45%, rgba(26,60,94,0.30) 100%),
              url('${current.coverImage.url}')
            `,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* Geometric overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 1440 620" preserveAspectRatio="none" aria-hidden="true">
        <line x1="480" y1="0" x2="480" y2="620" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        <line x1="960" y1="0" x2="960" y2="620" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        <line x1="0" y1="620" x2="1440" y2="0" stroke="rgba(201,168,76,0.08)" strokeWidth="1.5"/>
      </svg>

      <div className="container-main relative z-10 pb-14 md:pb-18">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-2 mb-8">
          <Link to="/" className="no-underline" style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
          >Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>／</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
            Portfolio
          </span>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-3 mb-5">
              <div style={{ width: 30, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
                Selected Work
              </span>
            </motion.div>

            <div className="overflow-hidden mb-5">
              {['Built', 'with', 'intention.'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block', marginRight: word === 'intention.' ? 0 : '0.3em',
                    fontFamily: 'var(--font-display)', fontWeight: 300,
                    fontSize: 'clamp(3rem, 7.5vw, 7rem)', lineHeight: 0.92,
                    color: word === 'intention.' ? 'rgba(255,255,255,0.38)' : 'white',
                    fontStyle: word === 'intention.' ? 'italic' : 'normal',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
                fontSize: 'clamp(0.82rem, 1.15vw, 0.96rem)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
                maxWidth: '46ch', margin: 0 }}>
              {total} projects across four continents — each one shaped by its place,
              its people, and its purpose.
            </motion.p>
          </div>

          {/* Featured slide indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-row lg:flex-col items-center lg:items-end gap-4 shrink-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={tick}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.45)', margin: 0, textAlign: 'right' }}>
                {current.title} · {current.location}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-2">
              {featuredProjects.map((_, i) => (
                <button key={i} onClick={() => setTick(i)}
                  aria-label={`Show ${featuredProjects[i].title}`}
                  style={{
                    width: i === tick ? 32 : 8, height: 2, padding: 0,
                    background: i === tick ? 'var(--color-gold)' : 'rgba(255,255,255,0.22)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.4s ease',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Sticky filter bar ────────────────────────────────────────────────────────
function FilterBar({
  category, onCategory, view, onView, count, search, onSearch,
}: {
  category: Category; onCategory: (c: Category) => void;
  view: ViewMode; onView: (v: ViewMode) => void;
  count: number; search: string; onSearch: (s: string) => void;
}) {
  return (
    <div style={{
      position: 'sticky', top: 'var(--nav-height)', zIndex: 40,
      background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(26,26,26,0.07)',
    }}>
      <div className="container-main py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {CATEGORIES.map(cat => {
              const active = cat.value === category;
              return (
                <button key={cat.value} onClick={() => onCategory(cat.value)} style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'rgba(26,26,26,0.42)',
                  background: active ? 'var(--color-brand)' : 'transparent',
                  border: `1px solid ${active ? 'var(--color-brand)' : 'rgba(26,26,26,0.1)'}`,
                  padding: '4px 13px', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget; el.style.color = 'var(--color-brand)'; el.style.borderColor = 'var(--color-brand)'; }}}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget; el.style.color = 'rgba(26,26,26,0.42)'; el.style.borderColor = 'rgba(26,26,26,0.1)'; }}}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="11" height="11" viewBox="0 0 16 16" fill="none"
                stroke="rgba(26,26,26,0.32)" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
              </svg>
              <input
                value={search} onChange={e => onSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-ink)',
                  background: 'rgba(26,26,26,0.04)', border: '1px solid rgba(26,26,26,0.1)',
                  padding: '5px 10px 5px 26px', outline: 'none',
                  width: 130, transition: 'border-color 0.2s, width 0.3s ease',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.width = '175px'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.1)'; e.currentTarget.style.width = '130px'; }}
              />
            </div>

            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              letterSpacing: '0.1em', color: 'rgba(26,26,26,0.3)', whiteSpace: 'nowrap' }}>
              {count} {count === 1 ? 'project' : 'projects'}
            </span>

            <div className="flex" style={{ border: '1px solid rgba(26,26,26,0.1)' }}>
              {(['grid', 'list'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => onView(v)} aria-label={`${v} view`}
                  style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                    background: view === v ? 'var(--color-brand)' : 'transparent',
                    color: view === v ? 'white' : 'rgba(26,26,26,0.32)',
                  }}>
                  {v === 'grid'
                    ? <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><rect width="4.5" height="4.5"/><rect x="6.5" width="4.5" height="4.5"/><rect y="6.5" width="4.5" height="4.5"/><rect x="6.5" y="6.5" width="4.5" height="4.5"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><line x1="0" y1="2" x2="11" y2="2"/><line x1="0" y1="5.5" x2="11" y2="5.5"/><line x1="0" y1="9" x2="11" y2="9"/></svg>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout helper ────────────────────────────────────────────────────────────
function getLayout(i: number): { col: string; aspect: string; textSize: 'lg' | 'sm' } {
  const pos = i % 6;
  if (pos === 0) return { col: 'col-span-12 md:col-span-8', aspect: '16/9',  textSize: 'lg' };
  if (pos === 1) return { col: 'col-span-12 md:col-span-4', aspect: '3/4',   textSize: 'sm' };
  if (pos === 2) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 3) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 4) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 5) return { col: 'col-span-12 md:col-span-8', aspect: '16/9',  textSize: 'lg' };
  return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
}

// ─── Grid card skeleton ───────────────────────────────────────────────────────
function CardSkeleton({ index }: { index: number }) {
  const { col, aspect } = getLayout(index);
  return (
    <div className={`${col} animate-pulse`}>
      <div style={{ aspectRatio: aspect, background: 'rgba(26,26,26,0.07)' }} />
    </div>
  );
}

// ─── Project grid card ────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis,     setVis]     = useState(false);
  const [hovered, setHovered] = useState(false);
  const { col, aspect, textSize } = getLayout(index);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const year = new Date(project.completedAt).getFullYear();

  return (
    <motion.div
      ref={ref} className={col}
      initial={{ opacity: 0, y: 36 }}
      animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/portfolio/${project.slug}`}
        className="block no-underline cursor-none"
        data-cursor="View"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden"
          style={{ aspectRatio: aspect, background: 'rgba(26,60,94,0.05)' }}>
          <img
            src={project.coverImage.url} alt={project.title} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transition: 'transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />

          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,18,28,0.72) 0%, rgba(10,18,28,0.18) 45%, transparent 100%)',
            transition: 'opacity 0.45s ease', opacity: hovered ? 1 : 0.75,
          }} />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {project.featured && (
              <span className="ml-auto" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.54rem',
                letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
                color: 'var(--color-ink)', background: 'var(--color-gold)', padding: '3px 9px',
              }}>Featured</span>
            )}
          </div>

          {/* Category tag */}
          <motion.div
            className="absolute left-4"
            animate={{ bottom: hovered ? 'calc(100% - 3.5rem)' : '3.8rem' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.56rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
              color: 'var(--color-gold)', background: 'rgba(10,18,28,0.5)',
              backdropFilter: 'blur(6px)', padding: '3px 9px',
            }}>
              {project.type}
            </span>
          </motion.div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 leading-tight" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 400,
                  fontSize: textSize === 'lg' ? 'clamp(1.15rem, 2.2vw, 1.65rem)' : 'clamp(1rem, 1.4vw, 1.2rem)',
                  color: 'white', transition: 'color 0.2s',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {project.title}
                </p>
                <p className="m-0 mt-0.5" style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300,
                  fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em',
                }}>
                  {project.location} · {year}
                </p>
              </div>
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
                transition={{ duration: 0.25 }}
                className="shrink-0"
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
                    stroke="var(--color-ink)" strokeWidth="2">
                    <path d="M3 13L13 3M13 3H6M13 3v7"/>
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {textSize === 'lg' && (
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.3 }}
            className="pt-3 flex items-center gap-4"
          >
            {project.services.slice(0, 3).map(service => (
              <span key={service} style={{
                fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.45)',
                borderBottom: '1px solid rgba(26,26,26,0.15)', paddingBottom: 1,
              }}>
                {service}
              </span>
            ))}
            {project.area && (
              <span className="ml-auto" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: 'rgba(26,26,26,0.3)',
              }}>
                {project.area} m²
              </span>
            )}
          </motion.div>
        )}
      </Link>
    </motion.div>
  );
}

// ─── List view row ────────────────────────────────────────────────────────────
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis,     setVis]     = useState(false);
  const [hovered, setHovered] = useState(false);
  const year = new Date(project.completedAt).getFullYear();

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={vis ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/portfolio/${project.slug}`}
        className="no-underline group flex items-center"
        style={{ borderBottom: '1px solid rgba(26,26,26,0.07)', transition: 'background 0.18s' }}
        onMouseEnter={e => { setHovered(true); (e.currentTarget as HTMLElement).style.background = 'rgba(26,60,94,0.025)'; }}
        onMouseLeave={e => { setHovered(false); (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span className="hidden sm:block w-12 shrink-0 py-5 pl-1" style={{
          fontFamily: 'var(--font-body)', fontSize: '0.58rem',
          letterSpacing: '0.15em', color: 'rgba(26,26,26,0.22)',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="relative overflow-hidden shrink-0 mr-4" style={{ width: 72, height: 56 }}>
          <img src={project.coverImage.url} alt={project.title} loading="lazy"
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
          />
        </div>

        <div className="flex-1 min-w-0 py-4">
          <p className="m-0 leading-snug" style={{
            fontFamily: 'var(--font-display)', fontWeight: 400,
            fontSize: 'clamp(0.92rem, 1.5vw, 1.1rem)',
            color: hovered ? 'var(--color-brand)' : 'var(--color-ink)',
            transition: 'color 0.2s',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {project.title}
          </p>
          <p className="m-0 mt-0.5" style={{
            fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            color: 'rgba(26,26,26,0.38)', fontWeight: 300,
          }}>
            {project.location}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-8 px-6 shrink-0">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            color: 'rgba(26,26,26,0.38)', width: 90, textTransform: 'capitalize' }}>
            {project.type}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            color: 'rgba(26,26,26,0.38)', width: 70 }}>
            {project.area ? `${project.area} m²` : '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            color: 'rgba(26,26,26,0.38)', width: 36 }}>
            {year}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.56rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
            color: project.published ? 'var(--color-brand)' : 'rgba(26,26,26,0.45)',
            background: project.published ? 'rgba(26,60,94,0.08)' : 'rgba(26,26,26,0.06)',
            padding: '3px 9px', width: 80, textAlign: 'center',
          }}>
            {project.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <motion.div
          animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0.2 }}
          transition={{ duration: 0.22 }}
          className="px-4"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
            stroke={hovered ? 'var(--color-brand)' : 'rgba(26,26,26,0.25)'} strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-12 py-28 flex flex-col items-center gap-5 text-center">
      <div style={{ width: 56, height: 56, border: '1px solid rgba(26,26,26,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
          stroke="rgba(26,26,26,0.2)" strokeWidth="1">
          <rect x="1" y="1" width="20" height="20"/><line x1="7" y1="11" x2="15" y2="11"/>
        </svg>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.6rem',
          color: 'rgba(26,26,26,0.3)', margin: '0 0 0.4rem' }}>No projects found</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem',
          color: 'rgba(26,26,26,0.28)', margin: 0 }}>Try adjusting your filter or search term</p>
      </div>
      <button onClick={onReset} style={{
        fontFamily: 'var(--font-body)', fontSize: '0.64rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
        color: 'var(--color-brand)', border: '1px solid rgba(26,60,94,0.25)',
        background: 'transparent', padding: '8px 22px', cursor: 'pointer', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--color-brand)'; el.style.color = 'white'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--color-brand)'; }}
      >
        Clear filters
      </button>
    </motion.div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-12 py-28 flex flex-col items-center gap-5 text-center">
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.4rem',
        color: 'rgba(26,26,26,0.3)', margin: '0 0 0.4rem' }}>
        Failed to load projects
      </p>
      <button onClick={onRetry} style={{
        fontFamily: 'var(--font-body)', fontSize: '0.64rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
        color: 'var(--color-brand)', border: '1px solid rgba(26,60,94,0.25)',
        background: 'transparent', padding: '8px 22px', cursor: 'pointer',
      }}>
        Retry
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [category, setCategory] = useState<Category>('All');
  const [view,     setView]     = useState<ViewMode>('grid');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const queryParams = {
    page,
    limit: 12,
    published: true,
    ...(category !== 'All' && { type: category as ProjectType }),
    ...(search && { search }),
  };

  const { data, isLoading, isError, refetch } = useGetProjectsQuery(queryParams);

  const projects   = data?.data.projects  ?? [];
  const pagination = data?.data.pagination;
  const hasMore    = pagination ? page < pagination.totalPages : false;
  const total      = pagination?.total ?? 0;

  // Accumulated projects for infinite scroll
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Reset on filter/search change
  useEffect(() => {
    setAllProjects([]);
    setPage(1);
  }, [category, search]);

  // Append incoming page
  useEffect(() => {
    if (projects.length > 0) {
      setAllProjects(prev => page === 1 ? projects : [...prev, ...projects]);
    }
  }, [projects, page]);

  // Featured derived from accumulated list
  const featuredProjects = allProjects.filter(p => p.featured);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !hasMore || isLoading) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPage(p => p + 1); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, isLoading]);

  const reset = useCallback(() => { setCategory('All'); setSearch(''); }, []);

  return (
    <>
      <CursorFollower />

      {/* Hero — skeleton only on very first load before any data arrives */}
      {isLoading && page === 1 && allProjects.length === 0
        ? <HeroSkeleton />
        : <Hero total={total} featuredProjects={featuredProjects} />
      }

      {/* Filter bar */}
      <FilterBar
        category={category} onCategory={setCategory}
        view={view} onView={setView}
        count={total}
        search={search} onSearch={setSearch}
      />

      {/* Projects */}
      <div style={{ background: 'var(--color-bg)' }}>
        <div className="container-main py-12 md:py-16">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-12 gap-4 md:gap-5"
              >
                {/* Skeletons */}
                {isLoading && page === 1 &&
                  Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} index={i} />)
                }

                {/* Error */}
                {isError && <ErrorState onRetry={refetch} />}

                {/* Projects */}
                {!isError && allProjects.length > 0 &&
                  allProjects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)
                }

                {/* Empty */}
                {!isLoading && !isError && allProjects.length === 0 && (
                  <EmptyState onReset={reset} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ border: '1px solid rgba(26,26,26,0.07)' }}
              >
                {/* List header */}
                <div className="hidden md:flex items-center px-4 py-2.5"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)', background: 'rgba(26,26,26,0.02)' }}>
                  <div className="w-12 shrink-0" />
                  <div className="w-[72px] mr-4 shrink-0" />
                  <span className="flex-1" style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                    letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.3)', fontWeight: 500 }}>
                    Project
                  </span>
                  <div className="flex items-center gap-8 px-6 shrink-0">
                    {['Type', 'Area', 'Year', 'Status'].map(h => (
                      <span key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                        letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: 'rgba(26,26,26,0.3)', fontWeight: 500,
                        width: h === 'Type' ? 90 : h === 'Area' ? 70 : h === 'Year' ? 36 : 80 }}>
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="w-[52px]" />
                </div>

                {/* List skeletons */}
                {isLoading && page === 1 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse"
                      style={{ borderBottom: '1px solid rgba(26,26,26,0.05)' }}>
                      <div style={{ width: 72, height: 56, background: 'rgba(26,26,26,0.07)', flexShrink: 0 }} />
                      <div className="flex-1">
                        <div style={{ width: '40%', height: 12, background: 'rgba(26,26,26,0.07)', marginBottom: 6 }} />
                        <div style={{ width: '25%', height: 10, background: 'rgba(26,26,26,0.05)' }} />
                      </div>
                    </div>
                  ))
                }

                {/* Error */}
                {isError && (
                  <div className="py-20 flex justify-center">
                    <button onClick={refetch} style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--color-brand)', background: 'none', border: 'none',
                      cursor: 'pointer', textDecoration: 'underline' }}>
                      Retry
                    </button>
                  </div>
                )}

                {/* Projects */}
                {!isError && allProjects.map((p, i) => (
                  <ProjectRow key={p._id} project={p} index={i} />
                ))}

                {/* Empty */}
                {!isLoading && !isError && allProjects.length === 0 && (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(26,26,26,0.3)', fontSize: '0.85rem' }}>
                      No projects match.
                    </p>
                    <button onClick={reset} style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--color-brand)', background: 'none', border: 'none',
                      cursor: 'pointer', textDecoration: 'underline' }}>
                      Reset filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center items-center gap-4 pt-14">
              <motion.div
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-3"
              >
                <div style={{ width: 40, height: 1, background: 'rgba(26,26,26,0.15)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.28)' }}>
                  Loading
                </span>
                <div style={{ width: 40, height: 1, background: 'rgba(26,26,26,0.15)' }} />
              </motion.div>
            </div>
          )}

          {/* End marker */}
          {!hasMore && allProjects.length > 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-5 mt-14">
              <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.07)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.28)' }}>
                {total} {total === 1 ? 'Project' : 'Projects'} · End
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.07)' }} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}