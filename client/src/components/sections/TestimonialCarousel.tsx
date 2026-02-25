import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Data ──────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    quote:'FORMA didnt just design our home — they reimagined how we live in it. Every room has a quality of light and space that we didnt know we were missing until we moved in.',
    author: 'Margaret & Tom Ellison',
    role: 'Private Residential Client',
    location: 'Hudson Valley, NY',
    project: 'Silhouette Residence',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80&fit=crop&face',
    projectImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=75&fit=crop',
  },
  {
    id: 2,
    quote:
      'The Meridian Tower has become the centrepiece of our portfolio. FORMA navigated an incredibly complex brief — commercial, cultural, and civic ambitions all at once — with clarity and intelligence.',
    author: 'James Ashworth',
    role: 'CEO, Meridian Development Group',
    location: 'Manhattan, NY',
    project: 'The Meridian Tower',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&fit=crop&face',
    projectImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=75&fit=crop',
  },
  {
    id: 3,
    quote:
      'Working with FORMA on the Kaia Cultural Centre was a genuine collaboration. They listened deeply, pushed our thinking, and delivered a building that the community has made entirely their own.',
    author: 'Dr. Amara Osei',
    role: 'Director, Kaia Cultural Foundation',
    location: 'London, UK',
    project: 'Kaia Cultural Centre',
    avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=120&q=80&fit=crop&face',
    projectImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=75&fit=crop',
  },
  {
    id: 4,
    quote:
      'We had a site, a budget, and a dream. FORMA gave us something we never expected: a home that feels timeless. Five years on, it still feels like it was built for the future.',
    author: 'Khalid Al-Rashid',
    role: 'Private Residential Client',
    location: 'Dubai, UAE',
    project: 'Dunes Private Villa',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&face',
    projectImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=75&fit=crop',
  },
];

// ─── Quote mark SVG ────────────────────────────────────────────────────────
function QuoteMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 36V22.5C0 10.5 6.5 3.5 19.5 0L22 4.5C15 6.5 11.5 10.5 11 17H20V36H0ZM28 36V22.5C28 10.5 34.5 3.5 47.5 0L50 4.5C43 6.5 39.5 10.5 39 17H48V36H28Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Star rating ───────────────────────────────────────────────────────────
function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="var(--color-gold)">
          <path d="M6 0l1.5 4.5H12L8.25 7.5l1.5 4.5L6 9 2.25 12l1.5-4.5L0 4.5h4.5z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Slide counter dots ────────────────────────────────────────────────────
function Dots({
  total,
  active,
  onSelect,
}: {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to testimonial ${i + 1}`}
          className="relative flex items-center justify-center w-5 h-5 focus:outline-none group"
        >
          <span
            className={`
              block rounded-full transition-all duration-400
              ${i === active
                ? 'w-5 h-1.5 bg-[var(--color-gold)]'
                : 'w-1.5 h-1.5 bg-[var(--color-ink)]/25 group-hover:bg-[var(--color-ink)]/45'
              }
            `}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main carousel ─────────────────────────────────────────────────────────
export default function TestimonialCarousel() {
  const [active, setActive]     = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [paused, setPaused]     = useState(false);
  const intervalRef             = useRef<ReturnType<typeof setInterval>>();
  const sectionRef              = useRef<HTMLElement>(null);
  const [visible, setVisible]   = useState(false);

  // Reveal section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [paused, active]);

  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };
  const prev = () => { setDirection(-1); setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); };
  const next = () => { setDirection(1);  setActive((p) => (p + 1) % TESTIMONIALS.length); };

  // Framer Motion variants
  const variants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  const t = TESTIMONIALS[active];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[var(--color-brand)] section-pad"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background texture: large ghost number ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/[0.03] leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18rem, 35vw, 32rem)',
              fontWeight: 300,
            }}
          >
            {String(active + 1).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Decorative top-right corner lines ── */}
      <svg
        className="absolute top-0 right-0 w-48 h-48 text-white/5 pointer-events-none"
        viewBox="0 0 192 192"
        fill="none"
        aria-hidden="true"
      >
        <line x1="192" y1="0" x2="0" y2="192" stroke="currentColor" strokeWidth="1" />
        <line x1="192" y1="48" x2="48" y2="192" stroke="currentColor" strokeWidth="1" />
        <line x1="192" y1="96" x2="96" y2="192" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="container-main relative z-10">

        {/* ── Header row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[var(--color-gold)] shrink-0" />
              <span
                className="text-[var(--color-gold)] text-[0.65rem] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Client Stories
              </span>
            </div>
            <h2
              id="testimonials-heading"
              className="text-white leading-[1.05] m-0"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
              }}
            >
              Trusted by those{' '}
              <em className="text-white/45" style={{ fontStyle: 'italic' }}>
                who build
              </em>
            </h2>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-12 h-12 flex items-center justify-center border border-white/20 text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8H3M7 4l-4 4 4 4" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-12 h-12 flex items-center justify-center border border-white/20 text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* ── Main content: quote + image ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* ── Quote block ── */}
          <div className="lg:col-span-7 xl:col-span-7">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Stars + quote mark */}
                <div className="flex items-center justify-between mb-8">
                  <Stars />
                  <QuoteMark className="w-8 text-[var(--color-gold)]/30" />
                </div>

                {/* The quote */}
                <blockquote
                  className="text-white leading-relaxed m-0 mb-10"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.25rem, 2.2vw, 1.85rem)',
                    lineHeight: 1.55,
                  }}
                >
                  "{t.quote}"
                </blockquote>

                {/* Divider */}
                <div className="w-12 h-px bg-[var(--color-gold)]/40 mb-8" />

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <p
                      className="text-white text-sm leading-tight m-0 mb-1"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    >
                      {t.author}
                    </p>
                    <p
                      className="text-white/45 text-[0.72rem] leading-tight m-0 mb-0.5"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
                    >
                      {t.role}
                    </p>
                    <p
                      className="text-[var(--color-gold)] text-[0.62rem] tracking-[0.15em] uppercase m-0"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    >
                      {t.project} · {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Project image panel ── */}
          <div className="lg:col-span-5 xl:col-span-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                variants={{
                  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40, scale: 0.97 }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, scale: 0.97 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Main image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <img
                    src={t.projectImage}
                    alt={t.project}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-[var(--color-brand)]/20" />

                  {/* Project label on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[var(--color-brand)]/80 to-transparent">
                    <span
                      className="text-white/50 text-[0.58rem] tracking-[0.22em] uppercase"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Featured Project
                    </span>
                    <p
                      className="text-white text-sm leading-tight m-0 mt-0.5"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                    >
                      {t.project}
                    </p>
                  </div>
                </div>

                {/* Gold corner accent */}
                <div className="absolute -top-3 -right-3 w-10 h-10" aria-hidden="true">
                  <svg viewBox="0 0 40 40" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <path d="M40 0 L40 18" />
                    <path d="M40 0 L22 0" />
                  </svg>
                </div>
                <div className="absolute -bottom-3 -left-3 w-10 h-10" aria-hidden="true">
                  <svg viewBox="0 0 40 40" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <path d="M0 40 L0 22" />
                    <path d="M0 40 L18 40" />
                  </svg>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Bottom row: dots + progress + count ── */}
        <div className="flex items-center justify-between mt-14 pt-8 border-t border-white/10">
          <Dots total={TESTIMONIALS.length} active={active} onSelect={goTo} />

          {/* Progress bar */}
          <div className="hidden sm:block flex-1 mx-10 h-px bg-white/10 relative overflow-hidden">
            <motion.div
              key={active}
              className="absolute left-0 top-0 h-full bg-[var(--color-gold)]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: paused ? 0 : 6, ease: 'linear' }}
            />
          </div>

          {/* Slide count */}
          <span
            className="text-white/30 text-[0.65rem] tracking-[0.2em] shrink-0"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {String(active + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
          </span>
        </div>

      </div>
    </section>
  );
}