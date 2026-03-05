import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/types/project.types';

// ─── Props ─────────────────────────────────────────────────────────────────
interface ProjectGridProps {
  projects:     Project[];
  isLoading?:   boolean;
  showFilters?: boolean;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonCard({ layout = 'normal' }: { layout?: 'wide' | 'tall' | 'normal' }) {
  const spanClass =
    layout === 'wide' ? 'col-span-12 md:col-span-8' :
    layout === 'tall' ? 'col-span-12 sm:col-span-6 md:col-span-4' :
                        'col-span-12 sm:col-span-6 md:col-span-4';
  const aspect =
    layout === 'wide' ? '16/9' :
    layout === 'tall' ? '3/4'  : '4/3';

  return (
    <div className={spanClass}>
      <div className="animate-pulse">
        <div className="w-full bg-[var(--color-brand)]/10" style={{ aspectRatio: aspect }} />
        <div className="mt-3 h-3 w-1/3 bg-[var(--color-brand)]/10" />
        <div className="mt-2 h-5 w-2/3 bg-[var(--color-brand)]/10" />
      </div>
    </div>
  );
}

// ─── Layout map ────────────────────────────────────────────────────────────
//
//  Pattern repeats every 10 items:
//
//  Row A  [0=wide 8col] [1=tall 4col] [2=normal] [3=normal] [4=normal]
//  Row B  [5=normal] [6=normal] [7=wide 8col] [8=tall 4col] [9=normal]
//
//  On desktop this gives two visually varied rows that tile cleanly for
//  any number of cards (5, 9, 10, 12, …)

type Layout = 'wide' | 'tall' | 'normal';

function getLayout(i: number): Layout {
  const pos = i % 10;
  if (pos === 0) return 'wide';
  if (pos === 1) return 'tall';
  if (pos === 7) return 'wide';
  if (pos === 8) return 'tall';
  return 'normal';
}

// ─── Project card ──────────────────────────────────────────────────────────
function ProjectCard({ project, index, layout }: { project: Project; index: number; layout: Layout }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('animate-in'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const spanClass =
    layout === 'wide' ? 'col-span-12 md:col-span-8' :
    layout === 'tall' ? 'col-span-12 sm:col-span-6 md:col-span-4' :
                        'col-span-12 sm:col-span-6 md:col-span-4';

  const aspectStyle =
    layout === 'wide' ? { aspectRatio: '16/9' } :
    layout === 'tall' ? { aspectRatio: '3/4'  } :
                        { aspectRatio: '4/3'  };

  const year  = new Date(project.completedAt).getFullYear();
  const delay = `${(index % 5) * 0.08}s`;

  return (
    <a
      ref={ref}
      href={`/portfolio/${project.slug ?? project._id}`}
      data-animate
      className={`${spanClass} group block no-underline text-[var(--color-ink)]`}
      style={{ transitionDelay: delay }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--color-brand)]/8" style={aspectStyle}>
        <img
          src={project.coverImage.url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient — deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-all duration-500 group-hover:from-black/70 group-hover:via-black/25" />

        {/* Overlay meta: always visible on wide/tall, revealed on hover for normal */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between transition-opacity duration-300 ${
            layout === 'normal' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}
        >
          <div>
            <span
              className="block text-[var(--color-gold)] text-[0.55rem] tracking-[0.28em] uppercase mb-1"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              {project.type}
            </span>
            <span
              className="block text-white/90 leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: layout === 'wide' ? 'clamp(1.1rem, 2vw, 1.6rem)' : '1rem',
              }}
            >
              {project.title}
            </span>
          </div>
          <span
            className="text-white/40 text-[0.6rem] tracking-[0.1em] self-end pb-0.5 shrink-0 ml-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {year}
          </span>
        </div>

        {/* Centre "View" pill on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="inline-flex items-center gap-2 text-white text-[0.62rem] tracking-[0.2em] uppercase px-5 py-2.5 border border-white/50 bg-black/30 backdrop-blur-sm transition-all duration-250 group-hover:bg-[var(--color-gold)] group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            View Project
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>

      {/* Below-image text — normal cards only */}
      {layout === 'normal' && (
        <div className="pt-3.5">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[var(--color-gold)] text-[0.6rem] tracking-[0.22em] uppercase"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              {project.type}
            </span>
            <span
              className="text-[var(--color-ink)]/40 text-[0.6rem] tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {year}
            </span>
          </div>
          <h3
            className="text-[var(--color-ink)] leading-snug mb-1.5 group-hover:text-[var(--color-brand)] transition-colors duration-200 m-0"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1rem, 1.5vw, 1.3rem)' }}
          >
            {project.title}
          </h3>
          {project.location && (
            <span
              className="inline-flex items-center gap-1.5 text-[var(--color-ink)]/40 text-[0.62rem] tracking-[0.08em]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
              </svg>
              {project.location}
            </span>
          )}
        </div>
      )}

      {/* Location below wide/tall cards */}
      {layout !== 'normal' && project.location && (
        <div className="pt-2.5">
          <span
            className="inline-flex items-center gap-1.5 text-[var(--color-ink)]/38 text-[0.6rem] tracking-[0.08em]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
            {project.location}
          </span>
        </div>
      )}
    </a>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function ProjectGrid({ projects, isLoading = false, showFilters = false }: ProjectGridProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('animate-in'); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.type)))];
  const filtered   = activeFilter === 'All' ? projects : projects.filter(p => p.type === activeFilter);

  return (
    <section className="section-pad bg-[var(--color-bg)]" aria-labelledby="pg-heading">
      <div className="container-main">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          ref={headerRef}
          data-animate
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[var(--color-gold)] shrink-0" />
              <span
                className="text-[var(--color-gold)] text-[0.65rem] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Selected Work
              </span>
            </div>
            <h2
              id="pg-heading"
              className="text-[var(--color-ink)] leading-[1.05] m-0"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
            >
              Built with{' '}
              <em className="text-[var(--color-ink)]/45" style={{ fontStyle: 'italic' }}>intention</em>
            </h2>
          </div>

          <div className="flex flex-col md:items-end gap-4 max-w-xs">
            <p
              className="text-[var(--color-ink)]/55 leading-relaxed m-0 md:text-right"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.88rem' }}
            >
              A curated selection spanning residential, commercial, cultural,
              and public commissions across four continents.
            </p>
            <a
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-[var(--color-brand)] text-[0.65rem] tracking-[0.2em] uppercase border-b border-[var(--color-brand)]/35 pb-px hover:border-[var(--color-brand)] transition-all duration-200 no-underline"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              All Projects
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by type">
            {categories.map(cat => {
              const count = cat === 'All' ? projects.length : projects.filter(p => p.type === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`
                    inline-flex items-center gap-2 px-5 py-2 text-[0.65rem] tracking-[0.18em] uppercase border transition-all duration-200 cursor-pointer
                    ${activeFilter === cat
                      ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                      : 'bg-transparent border-[var(--color-ink)]/15 text-[var(--color-ink)]/55 hover:border-[var(--color-brand)]/40 hover:text-[var(--color-ink)]'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}
                >
                  {cat}
                  <span style={{
                    fontSize: '0.56rem', letterSpacing: '0.1em',
                    opacity: 0.55, border: '1px solid currentColor',
                    padding: '1px 5px', lineHeight: 1.4,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5 md:gap-6">
          {isLoading ? (
            <>
              <SkeletonCard layout="wide"   />
              <SkeletonCard layout="tall"   />
              <SkeletonCard layout="normal" />
              <SkeletonCard layout="normal" />
              <SkeletonCard layout="normal" />
            </>
          ) : filtered.length === 0 ? (
            <div
              className="col-span-12 py-24 text-center"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(26,26,26,0.32)' }}
            >
              No projects to display.
            </div>
          ) : (
            filtered.map((project, i) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={i}
                layout={getLayout(i)}
              />
            ))
          )}
        </div>

        {/* ── Footer CTA ─────────────────────────────────────────────── */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex justify-center mt-14">
            <a
              href="/portfolio"
              className="inline-flex items-center gap-3 no-underline group"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.4)',
                borderBottom: '1px solid rgba(26,26,26,0.12)',
                paddingBottom: 3,
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--color-brand)';
                el.style.borderColor = 'rgba(26,60,94,0.35)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'rgba(26,26,26,0.4)';
                el.style.borderColor = 'rgba(26,26,26,0.12)';
              }}
            >
              <span style={{ width: 24, height: 1, background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
              Explore the full portfolio
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}