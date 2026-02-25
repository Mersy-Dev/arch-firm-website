import { useEffect, useRef, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Project {
  id: string | number;
  title: string;
  category?: string;
  year?: string | number;
  location?: string;
  coverImage?: string;
  slug?: string;
}

interface ProjectGridProps {
  projects: Project[];
  isLoading?: boolean;
  showFilters?: boolean;
}

// ─── Fallback demo data (renders if API returns nothing) ───────────────────
const DEMO: Project[] = [
  { id: 1, title: 'Silhouette Residence',   category: 'Residential', year: 2024, location: 'Hudson Valley, NY', slug: 'silhouette-residence',   coverImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&fit=crop' },
  { id: 2, title: 'The Meridian Tower',      category: 'Commercial',  year: 2023, location: 'Manhattan, NY',     slug: 'meridian-tower',          coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&fit=crop' },
  { id: 3, title: 'Kaia Cultural Centre',    category: 'Cultural',    year: 2023, location: 'London, UK',         slug: 'kaia-cultural-centre',    coverImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900&q=80&fit=crop' },
  { id: 4, title: 'Dunes Private Villa',     category: 'Residential', year: 2022, location: 'Dubai, UAE',         slug: 'dunes-villa',             coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop' },
  { id: 5, title: 'Canopy Pavilion',         category: 'Public',      year: 2022, location: 'Barcelona, ES',      slug: 'canopy-pavilion',         coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&fit=crop' },
];

// ─── Shimmer skeleton card ─────────────────────────────────────────────────
function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`${wide ? 'col-span-12 md:col-span-8' : 'col-span-12 md:col-span-4'}`}>
      <div className="animate-pulse">
        <div
          className="w-full bg-[var(--color-brand)]/10 rounded-sm"
          style={{ aspectRatio: wide ? '16/9' : '4/3' }}
        />
        <div className="mt-3 h-3 w-1/3 bg-[var(--color-brand)]/10 rounded-sm" />
        <div className="mt-2 h-5 w-2/3 bg-[var(--color-brand)]/10 rounded-sm" />
      </div>
    </div>
  );
}

// ─── Individual project card ───────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  layout,
}: {
  project: Project;
  index: number;
  layout: 'wide' | 'tall' | 'normal';
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('animate-in'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Grid span class
  const spanClass =
    layout === 'wide'   ? 'col-span-12 md:col-span-8' :
    layout === 'tall'   ? 'col-span-12 sm:col-span-6 md:col-span-4' :
                          'col-span-12 sm:col-span-6 md:col-span-4';

  // Image aspect ratio
  const aspectStyle =
    layout === 'wide' ? { aspectRatio: '16/9' } :
    layout === 'tall' ? { aspectRatio: '3/4'  } :
                        { aspectRatio: '4/3'  };

  const delay = `${index * 0.1}s`;

  return (
    <a
      ref={ref}
      href={`/projects/${project.slug ?? project.id}`}
      data-animate
      className={`${spanClass} group block no-underline text-[var(--color-ink)]`}
      style={{ transitionDelay: delay }}
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden bg-[var(--color-brand)]/10" style={aspectStyle}>
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-all duration-400 group-hover:from-black/65 group-hover:to-black/20" />

        {/* Hover pill */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="inline-flex items-center gap-2 text-white text-[0.65rem] tracking-[0.2em] uppercase px-5 py-2.5 border border-white/60 bg-black/35 backdrop-blur-sm group-hover:bg-[var(--color-gold)] group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-ink)] transition-all duration-250"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            View Project
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="pt-3.5">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[var(--color-gold)] text-[0.6rem] tracking-[0.22em] uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            {project.category ?? 'Architecture'}
          </span>
          <span
            className="text-[var(--color-ink)]/40 text-[0.6rem] tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {project.year}
          </span>
        </div>

        <h3
          className="text-[var(--color-ink)] leading-snug mb-1.5 group-hover:text-[var(--color-brand)] transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)',
          }}
        >
          {project.title}
        </h3>

        {project.location && (
          <span
            className="inline-flex items-center gap-1.5 text-[var(--color-ink)]/45 text-[0.62rem] tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
            {project.location}
          </span>
        )}
      </div>
    </a>
  );
}

// ─── Main ProjectGrid ──────────────────────────────────────────────────────
export default function ProjectGrid({ projects, isLoading = false, showFilters = false }: ProjectGridProps) {
  const display = projects.length > 0 ? projects : DEMO;
  const [activeFilter, setActiveFilter] = useState('All');
  const headerRef = useRef<HTMLDivElement>(null);

  // Animate header on scroll
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('animate-in'); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const categories = ['All', ...Array.from(new Set(display.map((p) => p.category ?? 'Architecture')))];
  const filtered = activeFilter === 'All' ? display : display.filter((p) => (p.category ?? 'Architecture') === activeFilter);

  // Card layout assignment: first card is wide, 4th is tall, rest normal
  const getLayout = (i: number): 'wide' | 'tall' | 'normal' =>
    i === 0 ? 'wide' : i === 3 ? 'tall' : 'normal';

  return (
    <section className="section-pad bg-[var(--color-bg)]" aria-labelledby="pg-heading">
      <div className="container-main">

        {/* ── Section header ── */}
        <div
          ref={headerRef}
          data-animate
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14"
        >
          {/* Left */}
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
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              }}
            >
              Built with{' '}
              <em className="text-[var(--color-ink)]/45" style={{ fontStyle: 'italic' }}>intention</em>
            </h2>
          </div>

          {/* Right */}
          <div className="flex flex-col md:items-end gap-4 max-w-xs">
            <p
              className="text-[var(--color-ink)]/55 leading-relaxed m-0 md:text-right"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.88rem' }}
            >
              A curated selection spanning residential, commercial, cultural,
              and public commissions across four continents.
            </p>
            <a
              href="/projects"
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

        {/* ── Optional filter bar ── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`
                  px-5 py-2 text-[0.65rem] tracking-[0.18em] uppercase border transition-all duration-200 cursor-pointer
                  ${activeFilter === cat
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                    : 'bg-transparent border-[var(--color-ink)]/15 text-[var(--color-ink)]/55 hover:border-[var(--color-brand)]/40 hover:text-[var(--color-ink)]'
                  }
                `}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-12 gap-6">
          {isLoading ? (
            <>
              <SkeletonCard wide />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                layout={getLayout(i)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}