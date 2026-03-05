import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  useGetAllPostsQuery,
  useGetBlogCategoriesQuery,
  useGetFeaturedPostsQuery,
} from '@/services/blogApi';
import type { BlogPostSummary } from '@/services/blogApi';

// ─── Default category set (shown even before API loads) ───────────────────────
const DEFAULT_CATEGORIES = [
  { label: 'All',            value: 'All'           },
  { label: 'Architecture',   value: 'Architecture'  },
  { label: 'Interiors',      value: 'Interiors'     },
  { label: 'Urbanism',       value: 'Urbanism'      },
  { label: 'Sustainability', value: 'Sustainability' },
  { label: 'Materials',      value: 'Materials'     },
  { label: 'Technology',     value: 'Technology'    },
  { label: 'Culture',        value: 'Culture'       },
  { label: 'Process',        value: 'Process'       },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatDate(iso: string | null, short = false) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', short
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'long', year: 'numeric' }
  );
}

// ─── Page Hero ────────────────────────────────────────────────────────────────
function PageHero() {
  return (
    <div
      className="relative overflow-hidden flex flex-col justify-end"
      style={{
        background: 'var(--color-brand)',
        minHeight: 'clamp(360px, 48vw, 560px)',
        paddingBottom: 'clamp(3rem, 6vw, 5.5rem)',
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(105deg, rgba(26,60,94,0.97) 0%, rgba(26,60,94,0.75) 50%, rgba(26,60,94,0.35) 100%),
            url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=70&fit=crop')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      {/* Geometric lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 560" preserveAspectRatio="none" aria-hidden="true">
        {[360, 720, 1080].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="560"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <line x1="0" y1="560" x2="1440" y2="0"
          stroke="rgba(201,168,76,0.08)" strokeWidth="1.5" />
        <line x1="0" y1="280" x2="600" y2="280"
          stroke="rgba(201,168,76,0.05)" strokeWidth="1" />
      </svg>

      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">

          {/* Left column — main copy */}
          <div className="lg:col-span-7">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 mb-7"
            >
              <Link to="/" className="no-underline"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.38)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
              >Home</Link>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>／</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Journal
              </span>
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-5"
            >
              <div style={{ width: 30, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.32em', textTransform: 'uppercase',
                color: 'var(--color-gold)', fontWeight: 500 }}>Ideas & Thinking</span>
            </motion.div>

            {/* Title — word-by-word reveal */}
            <div className="overflow-hidden mb-5">
              {['The', 'studio', 'journal.'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block', marginRight: '0.3em',
                    fontFamily: 'var(--font-display)', fontWeight: 300,
                    fontSize: 'clamp(2.8rem, 6.5vw, 6rem)', lineHeight: 0.96,
                    color: word === 'journal.' ? 'rgba(255,255,255,0.38)' : 'white',
                    fontStyle: word === 'journal.' ? 'italic' : 'normal',
                  }}
                >{word}</motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
                fontSize: 'clamp(0.85rem, 1.1vw, 0.98rem)', color: 'rgba(255,255,255,0.48)',
                lineHeight: 1.75, maxWidth: '44ch', margin: 0 }}
            >
              Essays on architecture, cities, and the practice of building. 
              Notes from the drawing board, the site, and everything in between.
            </motion.p>
          </div>

          {/* Right column — stats strip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="lg:col-span-5 hidden lg:flex flex-col gap-0"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { n: '8', label: 'Categories'      },
              { n: '40+', label: 'Articles'       },
              { n: '12k', label: 'Monthly Readers' },
            ].map(({ n, label }, i) => (
              <div key={label}
                className="flex items-center justify-between px-8 py-5"
                style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: '2.2rem', color: 'white', lineHeight: 1 }}>{n}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'var(--color-gold)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({
  categories,
  active,
  onCategory,
  count,
  search,
  onSearch,
}: {
  categories: string[];
  active: string;
  onCategory: (c: string) => void;
  count: number;
  search: string;
  onSearch: (s: string) => void;
}) {
  // Merge API categories with defaults, keeping order
  const pills = [
    'All',
    ...DEFAULT_CATEGORIES.slice(1).map(d => d.value),
    ...categories.filter(c => !DEFAULT_CATEGORIES.find(d => d.value === c)),
  ];

  return (
    <div style={{
      position: 'sticky', top: 'var(--nav-height)', zIndex: 40,
      background: 'rgba(250,250,248,0.95)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(26,26,26,0.07)',
    }}>
      <div className="container-main py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

          {/* Pills */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}>
            {pills.map(cat => {
              const isActive = cat === active;
              return (
                <button key={cat} onClick={() => onCategory(cat)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : 'rgba(26,26,26,0.45)',
                    background: isActive ? 'var(--color-brand)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--color-brand)' : 'rgba(26,26,26,0.1)'}`,
                    padding: '4px 12px', cursor: 'pointer', transition: 'all 0.18s',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-brand)';
                      e.currentTarget.style.borderColor = 'var(--color-brand)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(26,26,26,0.45)';
                      e.currentTarget.style.borderColor = 'rgba(26,26,26,0.1)';
                    }
                  }}
                >{cat}</button>
              );
            })}
          </div>

          {/* Search + count */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="11" height="11" viewBox="0 0 16 16" fill="none"
                stroke="rgba(26,26,26,0.32)" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
              </svg>
              <input value={search} onChange={e => onSearch(e.target.value)}
                placeholder="Search articles…"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                  color: 'var(--color-ink)', background: 'rgba(26,26,26,0.04)',
                  border: '1px solid rgba(26,26,26,0.1)', padding: '5px 10px 5px 26px',
                  outline: 'none', width: 140, transition: 'border-color 0.2s, width 0.3s ease' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.width = '185px'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.1)'; e.currentTarget.style.width = '140px'; }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              letterSpacing: '0.1em', color: 'rgba(26,26,26,0.3)', whiteSpace: 'nowrap' }}>
              {count} {count === 1 ? 'article' : 'articles'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Trending strip ───────────────────────────────────────────────────────────
function TrendingStrip({ posts }: { posts: BlogPostSummary[] }) {
  const { ref, vis } = useReveal(0.2);
  if (posts.length === 0) return null;

  return (
    <div ref={ref}
      style={{ background: 'var(--color-ink)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container-main py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, x: -12 }} animate={vis ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 shrink-0 md:pt-1"
          >
            <div style={{ width: 3, height: 40, background: 'var(--color-gold)', flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'var(--color-gold)', fontWeight: 600, margin: '0 0 2px' }}>Trending</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                Most read this week
              </p>
            </div>
          </motion.div>

          {/* Post list */}
          <div className="flex flex-col sm:flex-row gap-0 flex-1"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            {posts.slice(0, 4).map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }} animate={vis ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.07 }}
                className="flex-1"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <Link to={`/blog/${post.slug}`}
                  className="no-underline flex items-start gap-3 px-5 py-3 group"
                  style={{ transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Rank number */}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
                    fontSize: '1.4rem', lineHeight: 1, color: 'rgba(255,255,255,0.1)',
                    flexShrink: 0, minWidth: 24 }}>{String(i + 1).padStart(2, '0')}</span>

                  <div className="min-w-0">
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                      letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500,
                      background: 'var(--color-gold)', color: 'var(--color-ink)',
                      padding: '2px 7px', display: 'inline-block', marginBottom: '0.4rem' }}>
                      {post.category}
                    </span>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.8rem',
                      lineHeight: 1.4, color: 'rgba(255,255,255,0.65)', margin: '0 0 0.35rem',
                      transition: 'color 0.2s',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'}
                    >
                      {post.title}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                      {post.views.toLocaleString()} views · {post.readTime} min
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="animate-pulse">
      <div style={{ aspectRatio: tall ? '3/4' : '16/10', background: 'rgba(26,26,26,0.07)', marginBottom: '1rem' }} />
      <div style={{ width: '28%', height: 7, background: 'rgba(26,26,26,0.06)', marginBottom: '0.65rem' }} />
      <div style={{ width: '85%', height: 14, background: 'rgba(26,26,26,0.08)', marginBottom: '0.4rem' }} />
      <div style={{ width: '60%', height: 14, background: 'rgba(26,26,26,0.06)', marginBottom: '0.85rem' }} />
      <div style={{ width: '92%', height: 9, background: 'rgba(26,26,26,0.05)', marginBottom: '0.35rem' }} />
      <div style={{ width: '78%', height: 9, background: 'rgba(26,26,26,0.05)' }} />
    </div>
  );
}

// ─── Standard blog card ───────────────────────────────────────────────────────
function BlogCard({ post, variant = 'default' }: {
  post: BlogPostSummary;
  variant?: 'default' | 'tall' | 'wide' | 'minimal';
}) {
  const [hovered, setHovered] = useState(false);
  const isTall    = variant === 'tall';
  const isWide    = variant === 'wide';
  const isMinimal = variant === 'minimal';

  return (
    <Link to={`/blog/${post.slug}`} className="no-underline block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isMinimal ? (
        /* ── Minimal: horizontal image + text ── */
        <div className="flex gap-4 items-start"
          style={{ padding: '1rem 0', borderBottom: '1px solid rgba(26,26,26,0.07)',
            transition: 'background 0.2s' }}>
          <div className="relative overflow-hidden shrink-0" style={{ width: 72, height: 56 }}>
            <img src={post.coverImage} alt={post.title} loading="lazy"
              className="w-full h-full object-cover"
              style={{ transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
          </div>
          <div className="min-w-0">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              background: 'var(--color-gold)', color: 'var(--color-ink)',
              padding: '2px 7px', display: 'inline-block', marginBottom: '0.35rem' }}>
              {post.category}
            </span>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.8rem',
              lineHeight: 1.4, color: hovered ? 'var(--color-brand)' : 'var(--color-ink)',
              margin: '0 0 0.25rem', transition: 'color 0.2s',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {post.title}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              color: 'rgba(26,26,26,0.32)', margin: 0 }}>
              {formatDate(post.publishedAt, true)} · {post.readTime} min
            </p>
          </div>
        </div>
      ) : (
        /* ── Image-led card (default / tall / wide) ── */
        <div>
          <div className="relative overflow-hidden"
            style={{ aspectRatio: isTall ? '3/4' : isWide ? '16/8' : '16/10', marginBottom: '1rem' }}>
            <img src={post.coverImage} alt={post.title}
              className="w-full h-full object-cover" loading="lazy"
              style={{ transition: 'transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94)',
                transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />

            {/* Dark overlay on hover */}
            <div className="absolute inset-0"
              style={{ background: 'rgba(26,26,26,0.25)', opacity: hovered ? 1 : 0,
                transition: 'opacity 0.4s' }} />

            {/* Category */}
            <div className="absolute top-4 left-4">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
                background: 'var(--color-gold)', color: 'var(--color-ink)', padding: '3px 10px' }}>
                {post.category}
              </span>
            </div>

            {/* Featured star */}
            {post.isFeatured && (
              <div className="absolute top-4 right-4"
                style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>★</span>
              </div>
            )}

            {/* Gold corner */}
            <div className="absolute bottom-4 right-4"
              style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s, transform 0.3s',
                transform: hovered ? 'scale(1)' : 'scale(0.7)' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"
                stroke="var(--color-gold)" strokeWidth="1.4">
                <path d="M26 0 L26 13" /><path d="M26 0 L13 0" />
              </svg>
            </div>

            {/* Read time badge on tall cards */}
            {isTall && (
              <div className="absolute bottom-4 left-4">
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                  letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)',
                  background: 'rgba(26,26,26,0.55)', backdropFilter: 'blur(6px)',
                  padding: '3px 10px' }}>{post.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            {post.author.avatar
              ? <img src={post.author.avatar} alt={post.author.name}
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
              : (
                <div style={{ width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-brand)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: '0.55rem', fontFamily: 'var(--font-body)' }}>
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )
            }
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              color: 'rgba(26,26,26,0.4)', letterSpacing: '0.05em' }}>
              {post.author.name}
            </span>
            <span style={{ color: 'rgba(26,26,26,0.18)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              color: 'rgba(26,26,26,0.35)' }}>{formatDate(post.publishedAt, true)}</span>
            {!isTall && (
              <>
                <span style={{ color: 'rgba(26,26,26,0.18)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  color: 'rgba(26,26,26,0.35)' }}>{post.readTime} min</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: isWide ? 'clamp(1.3rem, 2vw, 1.9rem)'
              : isTall ? 'clamp(1.1rem, 1.6vw, 1.55rem)'
              : 'clamp(1rem, 1.5vw, 1.3rem)',
            lineHeight: 1.15, color: hovered ? 'var(--color-brand)' : 'var(--color-ink)',
            margin: '0 0 0.6rem', transition: 'color 0.2s' }}>
            {post.title}
          </h3>

          {/* Excerpt — only on default + wide */}
          {!isTall && (
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: '0.83rem', lineHeight: 1.7, color: 'rgba(26,26,26,0.48)',
              margin: '0 0 0.85rem',
              display: '-webkit-box', WebkitLineClamp: isWide ? 2 : 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.excerpt}
            </p>
          )}

          {/* Read more link */}
          <div className="flex items-center gap-2"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              color: hovered ? 'var(--color-brand)' : 'rgba(26,26,26,0.3)',
              transition: 'color 0.2s' }}>
            Read Article
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              style={{ transition: 'transform 0.25s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </div>
        </div>
      )}
    </Link>
  );
}

// ─── Hero post (first post, full-bleed) ───────────────────────────────────────
function HeroPost({ post }: { post: BlogPostSummary }) {
  const { ref, vis } = useReveal(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16 pb-16"
      style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
    >
      <div className="flex items-center gap-3 mb-7">
        <div style={{ width: 28, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'var(--color-gold)', fontWeight: 600 }}>Editor's Pick</span>
      </div>

      <Link to={`/blog/${post.slug}`} className="no-underline grid grid-cols-1 lg:grid-cols-12 gap-0 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image — 7 cols */}
        <div className="lg:col-span-7 relative overflow-hidden"
          style={{ aspectRatio: '16/10' }}>
          <img src={post.coverImage} alt={post.title}
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent 60%, rgba(250,250,248,0.15) 100%)' }} />
          {/* Category */}
          <div className="absolute top-5 left-5">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
              letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
              background: 'var(--color-gold)', color: 'var(--color-ink)', padding: '4px 12px' }}>
              {post.category}
            </span>
          </div>
        </div>

        {/* Content — 5 cols */}
        <div className="lg:col-span-5 flex flex-col justify-center px-0 lg:pl-12 pt-8 lg:pt-0">
          {/* Author + date */}
          <div className="flex items-center gap-2.5 mb-5">
            {post.author.avatar
              ? <img src={post.author.avatar} alt={post.author.name}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              : (
                <div style={{ width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-brand)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: '0.65rem', fontFamily: 'var(--font-body)' }}>
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )
            }
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              fontWeight: 500, color: 'var(--color-ink)' }}>{post.author.name}</span>
            <span style={{ color: 'rgba(26,26,26,0.2)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              color: 'rgba(26,26,26,0.38)' }}>{formatDate(post.publishedAt)}</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', lineHeight: 1.08,
            color: hovered ? 'var(--color-brand)' : 'var(--color-ink)',
            margin: '0 0 1.25rem', transition: 'color 0.25s' }}>
            {post.title}
          </h2>

          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: 'clamp(0.85rem, 1.05vw, 0.96rem)', lineHeight: 1.8,
            color: 'rgba(26,26,26,0.5)', margin: '0 0 2rem', maxWidth: '46ch' }}>
            {post.excerpt}
          </p>

          {/* Meta strip */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
                stroke="rgba(26,26,26,0.3)" strokeWidth="1.5">
                <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                color: 'rgba(26,26,26,0.38)' }}>{post.views.toLocaleString()} views</span>
            </div>
            <span style={{ color: 'rgba(26,26,26,0.18)' }}>·</span>
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
                stroke="rgba(26,26,26,0.3)" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                color: 'rgba(26,26,26,0.38)' }}>{post.readTime} min read</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              {post.tags.slice(0, 4).map(tag => (
                <span key={tag} style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  color: 'rgba(26,26,26,0.45)', padding: '4px 10px',
                  border: '1px solid rgba(26,26,26,0.1)' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
              color: 'var(--color-brand)', transition: 'color 0.2s',
              borderBottom: '1px solid rgba(26,60,94,0.2)', paddingBottom: 3, alignSelf: 'flex-start' }}>
            Read Full Article
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              style={{ transition: 'transform 0.25s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function BlogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-24 text-center">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem',
        color: 'rgba(26,26,26,0.38)', marginBottom: '1.25rem' }}>
        Could not load articles.
      </p>
      <button onClick={onRetry}
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
          background: 'transparent', border: '1px solid rgba(26,26,26,0.18)',
          color: 'rgba(26,26,26,0.5)', padding: '0.7rem 1.6rem', cursor: 'pointer',
          transition: 'all 0.2s' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.18)';
          (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.5)';
        }}
      >Try Again</button>
    </div>
  );
}

// ─── Newsletter CTA ───────────────────────────────────────────────────────────
function NewsletterCTA() {
  const { ref, vis } = useReveal(0.2);
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  }

  return (
    <div ref={ref}
      style={{ background: 'var(--color-ink)', margin: '5rem 0 0' }}>
      <div className="container-main py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 28, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'var(--color-gold)', fontWeight: 500 }}>Stay Informed</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', lineHeight: 1.05,
              color: 'white', margin: '0 0 1rem' }}>
              Dispatches from{' '}
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)' }}>the studio</em>
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.42)',
              margin: 0, maxWidth: '40ch' }}>
              Monthly notes on architecture, projects in progress, and ideas worth thinking about.
              No noise — just substance.
            </p>
          </div>

          <div>
            {sent ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 32, height: 32, background: 'rgba(201,168,76,0.15)',
                    border: '1px solid var(--color-gold)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                      stroke="var(--color-gold)" strokeWidth="1.8">
                      <path d="M2 8l4 4 8-8"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500,
                    fontSize: '0.85rem', color: 'white' }}>You're subscribed</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  Look out for our next dispatch in your inbox.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)', fontWeight: 500, margin: '0 0 0.85rem' }}>
                  Your email address
                </p>
                <div className="flex gap-0">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com" required
                    style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                      color: 'white', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none',
                      padding: '0.75rem 1rem', outline: 'none',
                      transition: 'border-color 0.2s' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                  />
                  <button type="submit"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                      background: 'var(--color-gold)', color: 'var(--color-ink)',
                      border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                      transition: 'filter 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
                  >Subscribe</button>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  color: 'rgba(255,255,255,0.22)', margin: '0.6rem 0 0' }}>
                  Monthly cadence. Unsubscribe any time.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchRaw, setSearchRaw]           = useState('');
  const [page, setPage]                     = useState(1);

  const search = useDebounce(searchRaw, 350);

  const params = {
    page, limit: 9,
    ...(activeCategory !== 'All' && { category: activeCategory }),
    ...(search && { search }),
  };

  const { data, isLoading, isError, refetch } = useGetAllPostsQuery(params);
  const { data: catData }                     = useGetBlogCategoriesQuery();
  // Trending = most viewed (server returns published posts sorted by views desc)
  const { data: featuredData }               = useGetFeaturedPostsQuery();

  const posts      = data?.data?.posts ?? [];
  const pagination = data?.data?.pagination;
  const categories = catData?.data ?? [];
  const trending   = featuredData?.data ?? [];
  const total      = pagination?.total ?? 0;

  // Split: first post → hero, next 2 → tall cards, rest → standard grid
  const [heroPost, second, third, ...gridPosts] = posts;

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  }, []);

  const handleSearch = useCallback((s: string) => {
    setSearchRaw(s);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveCategory('All');
    setSearchRaw('');
    setPage(1);
  }, []);

  const isFiltered = activeCategory !== 'All' || search !== '';

  return (
    <>
      <Helmet>
        <title>Journal — FORMA Architecture Studio</title>
        <meta name="description"
          content="Essays on architecture, cities, and the practice of building. Notes from the drawing board." />
      </Helmet>

      <PageHero />

      {/* Trending strip — shown only when not filtering */}
      {!isFiltered && trending.length > 0 && (
        <TrendingStrip posts={trending} />
      )}

      {/* Sticky filter bar */}
      <FilterBar
        categories={categories}
        active={activeCategory}
        onCategory={handleCategoryChange}
        count={total}
        search={searchRaw}
        onSearch={handleSearch}
      />

      {/* ── Main content ── */}
      <div className="section-pad" style={{ background: 'var(--color-bg)' }}>
        <div className="container-main">

          {isError && <BlogError onRetry={refetch} />}

          {/* Loading skeletons */}
          {isLoading && (
            <div>
              {/* Hero skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 pb-16 animate-pulse"
                style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
                <div className="lg:col-span-7">
                  <div style={{ aspectRatio: '16/10', background: 'rgba(26,26,26,0.07)' }} />
                </div>
                <div className="lg:col-span-5 flex flex-col justify-center gap-4">
                  <div style={{ width: '20%', height: 8, background: 'rgba(26,26,26,0.06)' }} />
                  <div style={{ width: '80%', height: 36, background: 'rgba(26,26,26,0.09)' }} />
                  <div style={{ width: '95%', height: 10, background: 'rgba(26,26,26,0.05)' }} />
                  <div style={{ width: '85%', height: 10, background: 'rgba(26,26,26,0.05)' }} />
                </div>
              </div>
              {/* Grid skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4"><SkeletonCard tall /></div>
                <div className="md:col-span-4"><SkeletonCard tall /></div>
                <div className="md:col-span-4 flex flex-col gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div style={{ width: 72, height: 56, background: 'rgba(26,26,26,0.07)', flexShrink: 0 }} />
                      <div className="flex-1">
                        <div style={{ width: '60%', height: 9, background: 'rgba(26,26,26,0.07)', marginBottom: 6 }} />
                        <div style={{ width: '90%', height: 9, background: 'rgba(26,26,26,0.05)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && posts.length === 0 && (
            <div className="py-24 text-center">
              <div style={{ width: 52, height: 52, border: '1px solid rgba(26,26,26,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none"
                  stroke="rgba(26,26,26,0.22)" strokeWidth="1">
                  <rect x="1" y="1" width="20" height="20"/><line x1="7" y1="11" x2="15" y2="11"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.5rem',
                color: 'rgba(26,26,26,0.28)', margin: '0 0 0.5rem' }}>No articles found</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                color: 'rgba(26,26,26,0.3)', margin: '0 0 1.5rem' }}>
                {isFiltered ? 'Try a different category or search term' : 'Check back soon'}
              </p>
              {isFiltered && (
                <button onClick={clearFilters}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.63rem',
                    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
                    color: 'var(--color-brand)', border: '1px solid rgba(26,60,94,0.22)',
                    background: 'transparent', padding: '8px 22px', cursor: 'pointer',
                    transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-brand)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand)'; }}
                >Clear filters</button>
              )}
            </div>
          )}

          {/* Posts */}
          {!isLoading && !isError && posts.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${search}-${page}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38 }}
              >
                {/* ── Hero post ── */}
                {heroPost && page === 1 && <HeroPost post={heroPost} />}

                {/* ── Tall + sidebar layout ── */}
                {(second || third || gridPosts.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">

                    {/* Tall card 1 */}
                    {second && (
                      <motion.div className="md:col-span-4"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.05 }}>
                        <BlogCard post={second} variant="tall" />
                      </motion.div>
                    )}

                    {/* Tall card 2 */}
                    {third && (
                      <motion.div className="md:col-span-4"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}>
                        <BlogCard post={third} variant="tall" />
                      </motion.div>
                    )}

                    {/* Minimal list sidebar */}
                    {gridPosts.slice(0, 4).length > 0 && (
                      <motion.div className="md:col-span-4"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.15 }}
                      >
                        <div className="flex items-center gap-2.5 mb-4 pb-4"
                          style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
                          <div style={{ width: 3, height: 14, background: 'var(--color-gold)' }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                            letterSpacing: '0.26em', textTransform: 'uppercase',
                            color: 'rgba(26,26,26,0.4)', fontWeight: 500 }}>More Articles</span>
                        </div>
                        {gridPosts.slice(0, 4).map((post, i) => (
                          <motion.div key={post._id}
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.18 + i * 0.06 }}>
                            <BlogCard post={post} variant="minimal" />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Remaining posts — standard 3-col grid ── */}
                {gridPosts.slice(4).length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-10"
                      style={{ borderTop: '1px solid rgba(26,26,26,0.07)', paddingTop: '3rem' }}>
                      <div style={{ width: 28, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                        letterSpacing: '0.28em', textTransform: 'uppercase',
                        color: 'var(--color-gold)', fontWeight: 500 }}>All Articles</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.06)' }} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                      {gridPosts.slice(4).map((post, i) => (
                        <motion.div key={post._id}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.06 }}>
                          <BlogCard post={post} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ width: 36, height: 36, background: 'transparent',
                        border: '1px solid rgba(26,26,26,0.12)', cursor: page === 1 ? 'not-allowed' : 'pointer',
                        color: page === 1 ? 'rgba(26,26,26,0.2)' : 'rgba(26,26,26,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                        stroke="currentColor" strokeWidth="1.8">
                        <path d="M10 4l-4 4 4 4"/>
                      </svg>
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ width: 36, height: 36,
                          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                          fontWeight: p === page ? 600 : 400,
                          background: p === page ? 'var(--color-brand)' : 'transparent',
                          color: p === page ? 'white' : 'rgba(26,26,26,0.42)',
                          border: p === page ? 'none' : '1px solid rgba(26,26,26,0.12)',
                          cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { if (p !== page) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)'; }}
                        onMouseLeave={e => { if (p !== page) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.12)'; }}
                      >{p}</button>
                    ))}

                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      style={{ width: 36, height: 36, background: 'transparent',
                        border: '1px solid rgba(26,26,26,0.12)',
                        cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                        color: page === pagination.pages ? 'rgba(26,26,26,0.2)' : 'rgba(26,26,26,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                        stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 4l4 4-4 4"/>
                      </svg>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Newsletter CTA */}
      <NewsletterCTA />
    </>
  );
}