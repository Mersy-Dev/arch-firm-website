import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────
type Category = 'All' | 'Residential' | 'Commercial' | 'Cultural' | 'Public' | 'Heritage';
type ViewMode  = 'grid' | 'list';

interface Project {
  id:        number;
  slug:      string;
  title:     string;
  category:  Exclude<Category, 'All'>;
  year:      number;
  location:  string;
  area:      string;
  status:    'Completed' | 'On Site' | 'In Design';
  featured:  boolean;
  cover:     string;
  alt:       string;
  tags:      string[];
  shortDesc: string;
}

// ─── Project data ────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: 1, slug: 'silhouette-residence',
    title: 'Silhouette Residence', category: 'Residential',
    year: 2024, location: 'Hudson Valley, NY', area: '620 m²',
    status: 'Completed', featured: true,
    cover: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=85&fit=crop',
    alt:   'Silhouette Residence — Hudson Valley',
    tags: ['Passive Design', 'Stone', 'Landscape'],
    shortDesc: 'A house that reads as a single sculptural gesture against the Hudson Valley landscape.',
  },
  {
    id: 2, slug: 'meridian-tower',
    title: 'The Meridian Tower', category: 'Commercial',
    year: 2023, location: 'Manhattan, NY', area: '18,400 m²',
    status: 'Completed', featured: true,
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85&fit=crop',
    alt:   'Meridian Tower — Manhattan',
    tags: ['LEED Gold', 'Mixed-Use', 'High-rise'],
    shortDesc: 'A mixed-use tower that redefines the civic edge at street level.',
  },
  {
    id: 3, slug: 'kaia-cultural-centre',
    title: 'Kaia Cultural Centre', category: 'Cultural',
    year: 2023, location: 'London, UK', area: '4,200 m²',
    status: 'Completed', featured: true,
    cover: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=85&fit=crop',
    alt:   'Kaia Cultural Centre — London',
    tags: ['RIBA Award', 'Community', 'Concrete'],
    shortDesc: 'A gathering place designed from the community inwards — not the architect outwards.',
  },
  {
    id: 4, slug: 'dunes-private-villa',
    title: 'Dunes Private Villa', category: 'Residential',
    year: 2022, location: 'Dubai, UAE', area: '1,100 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85&fit=crop',
    alt:   'Dunes Villa — Dubai',
    tags: ['Desert Climate', 'Luxury', 'Courtyard'],
    shortDesc: 'Desert living distilled to its most elemental — shade, water, stone, and sky.',
  },
  {
    id: 5, slug: 'canopy-pavilion',
    title: 'Canopy Pavilion', category: 'Public',
    year: 2022, location: 'Barcelona, ES', area: '820 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=85&fit=crop',
    alt:   'Canopy Pavilion — Barcelona',
    tags: ['Timber', 'Pavilion', 'Public Space'],
    shortDesc: 'A lightweight timber canopy that turns a forgotten plaza into a destination.',
  },
  {
    id: 6, slug: 'westgate-conversion',
    title: 'Westgate Conversion', category: 'Heritage',
    year: 2022, location: 'Edinburgh, UK', area: '2,800 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&fit=crop',
    alt:   'Westgate Conversion — Edinburgh',
    tags: ['Listed Building', 'Adaptive Reuse', 'Residential'],
    shortDesc: 'A Victorian warehouse reborn as twenty-four homes — all its best bones kept.',
  },
  {
    id: 7, slug: 'grove-headquarters',
    title: 'Grove Headquarters', category: 'Commercial',
    year: 2021, location: 'Austin, TX', area: '6,500 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85&fit=crop',
    alt:   'Grove HQ — Austin',
    tags: ['Biophilic', 'Office', 'Timber'],
    shortDesc: 'A workplace that makes coming to the office feel genuinely worthwhile.',
  },
  {
    id: 8, slug: 'harbour-house',
    title: 'Harbour House', category: 'Residential',
    year: 2021, location: 'Sydney, AU', area: '480 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85&fit=crop',
    alt:   'Harbour House — Sydney',
    tags: ['Coastal', 'Passive House', 'Glass'],
    shortDesc: 'The house dissolves into the harbour view — present but never imposing.',
  },
  {
    id: 9, slug: 'arena-district',
    title: 'Arena District', category: 'Public',
    year: 2024, location: 'Amsterdam, NL', area: '12,000 m²',
    status: 'In Design', featured: true,
    cover: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=85&fit=crop',
    alt:   'Arena District — Amsterdam',
    tags: ['Urban', 'Master Plan', 'Public Realm'],
    shortDesc: 'A new urban quarter built around movement, green corridors, and civic generosity.',
  },
  {
    id: 10, slug: 'foundry-arts',
    title: 'The Foundry Arts Centre', category: 'Cultural',
    year: 2023, location: 'Detroit, MI', area: '3,600 m²',
    status: 'On Site', featured: false,
    cover: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1200&q=85&fit=crop',
    alt:   'Foundry Arts Centre — Detroit',
    tags: ['Industrial Heritage', 'Arts', 'Steel'],
    shortDesc: 'Steel and glass meet raw brick in a former foundry repurposed for the arts.',
  },
  {
    id: 11, slug: 'cedar-house',
    title: 'Cedar House', category: 'Residential',
    year: 2020, location: 'Vermont, US', area: '310 m²',
    status: 'Completed', featured: false,
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&fit=crop',
    alt:   'Cedar House — Vermont',
    tags: ['Timber', 'Rural', 'Minimal'],
    shortDesc: 'Cedar, stone, and simplicity. A house that knows exactly what it is.',
  },
  {
    id: 12, slug: 'parkline-tower',
    title: 'Parkline Tower', category: 'Commercial',
    year: 2024, location: 'Chicago, IL', area: '22,000 m²',
    status: 'In Design', featured: false,
    cover: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1200&q=85&fit=crop',
    alt:   'Parkline Tower — Chicago',
    tags: ['High-rise', 'Mixed-Use', 'Contextual'],
    shortDesc: 'Chicago\'s next skyline addition — contextual, civic, and unmistakably tall.',
  },
];

const CATEGORIES: Category[] = ['All', 'Residential', 'Commercial', 'Cultural', 'Public', 'Heritage'];

// ─── Cursor follower ─────────────────────────────────────────────────────────
function CursorFollower() {
  const [pos,     setPos]     = useState({ x: -200, y: -200 });
  const [label,   setLabel]   = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); };
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
    return () => { document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out); };
  }, []);

  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none hidden lg:flex items-center justify-center"
      animate={{
        x: pos.x - 40, y: pos.y - 40,
        scale: visible ? 1 : 0,
        opacity: visible ? 1 : 0,
      }}
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

// ─── Page hero ───────────────────────────────────────────────────────────────
function Hero({ total }: { total: number }) {
  const [tick, setTick] = useState(0);
  const featured = PROJECTS.filter(p => p.featured);

  // Cycle featured images in background
  useEffect(() => {
    const t = setInterval(() => setTick(n => (n + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

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
              url('${featured[tick].cover}')
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 mb-8"
        >
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
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-5"
            >
              <div style={{ width: 30, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
                Selected Work
              </span>
            </motion.div>

            {/* Headline — word-by-word reveal */}
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
                    fontSize: 'clamp(3rem, 7.5vw, 7rem)',
                    lineHeight: 0.92,
                    color: word === 'intention.' ? 'rgba(255,255,255,0.38)' : 'white',
                    fontStyle: word === 'intention.' ? 'italic' : 'normal',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
                fontSize: 'clamp(0.82rem, 1.15vw, 0.96rem)',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
                maxWidth: '46ch', margin: 0 }}
            >
              {total} projects across four continents — each one shaped by its place,
              its people, and its purpose.
            </motion.p>
          </div>

          {/* Right: featured slide indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-row lg:flex-col items-center lg:items-end gap-4 shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={tick}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.45)', margin: 0, textAlign: 'right' }}
              >
                {featured[tick].title} · {featured[tick].location}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-2">
              {featured.map((_, i) => (
                <button key={i} onClick={() => setTick(i)}
                  aria-label={`Show ${featured[i].title}`}
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
              const active = cat === category;
              return (
                <button key={cat} onClick={() => onCategory(cat)} style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'rgba(26,26,26,0.42)',
                  background: active ? 'var(--color-brand)' : 'transparent',
                  border: `1px solid ${active ? 'var(--color-brand)' : 'rgba(26,26,26,0.1)'}`,
                  padding: '4px 13px', cursor: 'pointer', transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget; el.style.color = 'var(--color-brand)'; el.style.borderColor = 'var(--color-brand)'; }}}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget; el.style.color = 'rgba(26,26,26,0.42)'; el.style.borderColor = 'rgba(26,26,26,0.1)'; }}}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search */}
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

            {/* Count */}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              letterSpacing: '0.1em', color: 'rgba(26,26,26,0.3)', whiteSpace: 'nowrap' }}>
              {count} {count === 1 ? 'project' : 'projects'}
            </span>

            {/* View toggle */}
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

// ─── Editorial grid card ──────────────────────────────────────────────────────
// Layout pattern per group of 6:
//  [0] wide hero (8 col, 16:9)   [1] tall right (4 col, 3:4)
//  [2] square (4 col, 1:1)       [3] square (4 col, 1:1)   [4] square (4 col, 1:1)
//  [5] wide hero (8 col, 16:9)   ...then repeats mirrored
function getLayout(i: number): { col: string; aspect: string; textSize: 'lg' | 'sm' } {
  const pos = i % 6;
  if (pos === 0) return { col: 'col-span-12 md:col-span-8', aspect: '16/9', textSize: 'lg' };
  if (pos === 1) return { col: 'col-span-12 md:col-span-4', aspect: '3/4',  textSize: 'sm' };
  if (pos === 2) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 3) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 4) return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
  if (pos === 5) return { col: 'col-span-12 md:col-span-8', aspect: '16/9', textSize: 'lg' };
  return { col: 'col-span-12 sm:col-span-6 md:col-span-4', aspect: '4/3', textSize: 'sm' };
}

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

  const statusColor = project.status === 'On Site'    ? 'var(--color-gold)'
                    : project.status === 'In Design'  ? 'rgba(255,255,255,0.6)'
                    : null;

  return (
    <motion.div
      ref={ref}
      className={col}
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
        {/* Image container */}
        <div className="relative overflow-hidden"
          style={{ aspectRatio: aspect, background: 'rgba(26,60,94,0.05)' }}>
          <img
            src={project.cover} alt={project.alt} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transition: 'transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />

          {/* Gradient — always present, intensifies on hover */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,18,28,0.72) 0%, rgba(10,18,28,0.18) 45%, transparent 100%)',
            transition: 'opacity 0.45s ease',
            opacity: hovered ? 1 : 0.75,
          }} />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {statusColor && (
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                color: statusColor, background: 'rgba(10,18,28,0.65)',
                backdropFilter: 'blur(6px)', padding: '3px 9px',
              }}>
                ● {project.status}
              </span>
            )}
            {project.featured && (
              <span className="ml-auto" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.54rem',
                letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
                color: 'var(--color-ink)', background: 'var(--color-gold)',
                padding: '3px 9px',
              }}>Featured</span>
            )}
          </div>

          {/* Category tag — slides up on hover */}
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
              {project.category}
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
                  fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.04em',
                }}>
                  {project.location} · {project.year}
                </p>
              </div>
              {/* Arrow that appears on hover */}
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

        {/* Below-image meta (lg cards only) */}
        {textSize === 'lg' && (
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.3 }}
            className="pt-3 flex items-center gap-4"
          >
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.45)',
                borderBottom: '1px solid rgba(26,26,26,0.15)', paddingBottom: 1,
              }}>
                {tag}
              </span>
            ))}
            <span className="ml-auto" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              color: 'rgba(26,26,26,0.3)',
            }}>
              {project.area}
            </span>
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
        {/* Index */}
        <span className="hidden sm:block w-12 shrink-0 py-5 pl-1" style={{
          fontFamily: 'var(--font-body)', fontSize: '0.58rem',
          letterSpacing: '0.15em', color: 'rgba(26,26,26,0.22)',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Thumbnail */}
        <div className="relative overflow-hidden shrink-0 mr-4" style={{ width: 72, height: 56 }}>
          <img src={project.cover} alt={project.alt} loading="lazy"
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
          />
        </div>

        {/* Title + location */}
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

        {/* Meta — desktop */}
        <div className="hidden md:flex items-center gap-8 px-6 shrink-0">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(26,26,26,0.38)', width: 90 }}>
            {project.category}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(26,26,26,0.38)', width: 70 }}>
            {project.area}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(26,26,26,0.38)', width: 36 }}>
            {project.year}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.56rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
            color: project.status === 'On Site'   ? '#7a5c10'
                 : project.status === 'In Design' ? 'rgba(26,26,26,0.45)'
                 : 'var(--color-brand)',
            background: project.status === 'On Site'   ? 'rgba(201,168,76,0.12)'
                      : project.status === 'In Design' ? 'rgba(26,26,26,0.06)'
                      : 'rgba(26,60,94,0.08)',
            padding: '3px 9px', width: 80, textAlign: 'center',
          }}>
            {project.status}
          </span>
        </div>

        {/* Arrow */}
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 py-28 flex flex-col items-center gap-5 text-center"
    >
      <div style={{ width: 56, height: 56, border: '1px solid rgba(26,26,26,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
          stroke="rgba(26,26,26,0.2)" strokeWidth="1">
          <rect x="1" y="1" width="20" height="20"/>
          <line x1="7" y1="11" x2="15" y2="11"/>
        </svg>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.6rem',
          color: 'rgba(26,26,26,0.3)', margin: '0 0 0.4rem' }}>
          No projects found
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem',
          color: 'rgba(26,26,26,0.28)', margin: 0 }}>
          Try adjusting your filter or search term
        </p>
      </div>
      <button onClick={onReset} style={{
        fontFamily: 'var(--font-body)', fontSize: '0.64rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
        color: 'var(--color-brand)', border: '1px solid rgba(26,60,94,0.25)',
        background: 'transparent', padding: '8px 22px', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--color-brand)'; el.style.color = 'white'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--color-brand)'; }}
      >
        Clear filters
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [category,  setCategory]  = useState<Category>('All');
  const [view,      setView]      = useState<ViewMode>('grid');
  const [search,    setSearch]    = useState('');
  const [visible,   setVisible]   = useState(9);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filtered = PROJECTS.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const shown  = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => { setVisible(9); }, [category, search]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(v => v + 6); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible]);

  const reset = useCallback(() => { setCategory('All'); setSearch(''); }, []);

  return (
    <>
      {/* Custom cursor */}
      <CursorFollower />

      {/* Hero */}
      <Hero total={PROJECTS.length} />

      {/* Filter bar */}
      <FilterBar
        category={category} onCategory={setCategory}
        view={view} onView={setView}
        count={filtered.length}
        search={search} onSearch={setSearch}
      />

      {/* Projects */}
      <div style={{ background: 'var(--color-bg)' }}>
        <div className="container-main py-12 md:py-16">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-12 gap-4 md:gap-5"
              >
                {shown.length > 0
                  ? shown.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)
                  : <EmptyState onReset={reset} />
                }
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                    {['Category', 'Area', 'Year', 'Status'].map(h => (
                      <span key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                        letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: 'rgba(26,26,26,0.3)', fontWeight: 500,
                        width: h === 'Category' ? 90 : h === 'Area' ? 70 : h === 'Year' ? 36 : 80 }}>
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="w-[52px]" />
                </div>

                {shown.length > 0
                  ? shown.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)
                  : (
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
                  )
                }
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
          {!hasMore && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-5 mt-14"
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.07)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.28)' }}>
                {filtered.length} {filtered.length === 1 ? 'Project' : 'Projects'} · End
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.07)' }} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}   