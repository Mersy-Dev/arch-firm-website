import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ─── Data ──────────────────────────────────────────────────────────────────
const NAV_COLS = [
  {
    heading: 'Practice',
    links: [
      { label: 'Projects',    href: '/portfolio' },
      { label: 'Services',    href: '/services'  },
      { label: 'Process',     href: '/process'   },
      { label: 'Studio',      href: '/about'     },
      { label: 'Careers',     href: '/careers'   },
    ],
  },
  {
    heading: 'Expertise',
    links: [
      { label: 'Architectural Design',    href: '/services#architectural-design'    },
      { label: 'Interior Architecture',   href: '/services#interior-architecture'   },
      { label: 'Urban & Master Planning', href: '/services#urban-master-planning'   },
      { label: 'Sustainability',          href: '/services#sustainability-consulting'},
      { label: 'Heritage & Reuse',        href: '/services#heritage-adaptive-reuse' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'Journal',    href: '/blog'    },
      { label: 'FAQ',        href: '/faq'     },
      { label: 'Contact',    href: '/contact' },
      { label: 'Instagram',  href: '#'        },
      { label: 'LinkedIn',   href: '#'        },
    ],
  },
];

const OFFICES = [
  { city: 'New York',  address: '142 Mercer St, SoHo, NY 10012' },
  { city: 'London',    address: '27 Clerkenwell Rd, EC1M 5RN'   },
  { city: 'Dubai',     address: 'DIFC, Gate Village 6, Level 2'  },
];

// ─── Animated reveal hook ──────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Newsletter form ───────────────────────────────────────────────────────
function NewsletterForm() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-gold)' }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--color-ink)" strokeWidth="2">
            <path d="M2 6l3 3 5-5" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
          You're on the list. We'll be in touch.
        </span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div
        className="flex items-center transition-all duration-300"
        style={{
          borderBottom: `1px solid ${focused ? 'var(--color-gold)' : 'rgba(255,255,255,0.2)'}`,
          paddingBottom: 10,
        }}
      >
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Your email address"
          required
          className="flex-1 bg-transparent outline-none placeholder-white/25 text-white text-sm"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
        />
        <button
          type="submit"
          className="shrink-0 transition-colors duration-200"
          aria-label="Subscribe"
          style={{ color: focused ? 'var(--color-gold)' : 'rgba(255,255,255,0.35)' }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
        letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
        Studio updates, projects & perspectives. No spam.
      </span>
    </form>
  );
}

// ─── Big wordmark with hover line animation ────────────────────────────────
function BigWordmark() {
  const { ref, visible } = useReveal(0.2);

  return (
    <div ref={ref} className="relative overflow-hidden border-t border-b py-6 md:py-8"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Sliding reveal line */}
      <motion.div
        className="absolute inset-0 origin-left"
        initial={{ scaleX: 0 }}
        animate={visible ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ backgroundColor: 'rgba(201,168,76,0.04)' }}
      />
      <motion.h2
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative text-center leading-none select-none m-0"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 'clamp(5rem, 18vw, 18rem)',
          color: 'rgba(255,255,255,0.04)',
          letterSpacing: '0.06em',
        }}
        aria-hidden="true"
      >
        TEDEX
      </motion.h2>
    </div>
  );
}

// ─── Main Footer ───────────────────────────────────────────────────────────
export default function Footer() {
  const { ref: topRef, visible: topVisible } = useReveal(0.1);
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ backgroundColor: 'var(--color-ink)' }}
      aria-label="Site footer"
    >
      {/* ── Top CTA band ── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        {/* Subtle diagonal lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 200"
          preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="200" x2="1440" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="140" x2="1000" y2="0" stroke="rgba(201,168,76,0.06)" strokeWidth="1" />
        </svg>

        <div className="container-main relative z-10 py-14 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p
              className="m-0 mb-1"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                fontWeight: 500,
              }}
            >
              Start a Conversation
            </p>
            <h3
              className="m-0"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
                color: 'white',
                lineHeight: 1.1,
              }}
            >
              Have a project in mind?
            </h3>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 no-underline shrink-0 transition-all duration-250 group"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              backgroundColor: 'var(--color-gold)',
              padding: '1rem 2rem',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
          >
            Get in Touch
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <path d="M3 13L13 3M13 3H6M13 3v7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div
        ref={topRef}
        className="container-main py-16 md:py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* ── Brand column ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={topVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            {/* Logo */}
            <Link to="/" className="no-underline inline-flex items-center gap-2.5 mb-6" aria-label="FORMA home">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="0.5" y="0.5" width="21" height="21" stroke="var(--color-gold)" strokeWidth="1" />
                <rect x="4.5" y="4.5" width="13" height="13" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="11" x2="22" y2="11" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.4" />
                <line x1="11" y1="0" x2="11" y2="22" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.4" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: '1.05rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'white',
              }}>
                FORMA<span style={{ color: 'var(--color-gold)' }}>.</span>
              </span>
            </Link>

            {/* Tagline */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '0.88rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '2rem',
              maxWidth: '30ch',
            }}>
              Architecture and interior design studio crafting spaces that
              balance precision with poetry.
            </p>

            {/* Offices */}
            <div className="flex flex-col gap-5">
              {OFFICES.map(({ city, address }) => (
                <div key={city}>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    fontWeight: 500,
                    margin: '0 0 2px',
                  }}>
                    {city}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 300,
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {address}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Nav columns ── */}
          <div className="md:col-span-5 grid grid-cols-3 gap-6">
            {NAV_COLS.map(({ heading, links }, colIdx) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, y: 24 }}
                animate={topVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 + colIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'white',
                  fontWeight: 500,
                  margin: '0 0 1.25rem',
                }}>
                  {heading}
                </p>
                <ul className="list-none m-0 p-0 flex flex-col gap-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="no-underline transition-colors duration-200"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8rem',
                          fontWeight: 300,
                          color: 'rgba(255,255,255,0.38)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* ── Newsletter column ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={topVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-3"
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'white',
              fontWeight: 500,
              margin: '0 0 1.25rem',
            }}>
              Newsletter
            </p>
            <NewsletterForm />

            {/* Awards / recognition */}
            <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.58rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                margin: '0 0 1rem',
              }}>
                Recognition
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'AIA Excellence Award 2024',
                  'Dezeen Award — Residential',
                  'RIBA National Award 2023',
                ].map(award => (
                  <div key={award} className="flex items-center gap-2">
                    <span style={{
                      width: 4, height: 4,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-gold)',
                      opacity: 0.6,
                      flexShrink: 0,
                      display: 'block',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.28)',
                      fontWeight: 300,
                    }}>
                      {award}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Giant wordmark ── */}
      <BigWordmark />

      {/* ── Bottom bar ── */}
      <div className="container-main py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Left: copyright */}
        <div className="flex items-center gap-4">
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.18)',
          }}>
            © {year} FORMA Architecture Studio
          </span>
          <span style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.12)', display: 'block' }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.18)',
          }}>
            All rights reserved
          </span>
        </div>

        {/* Right: legal + socials */}
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms'].map(item => (
            <Link
              key={item}
              to={`/${item.toLowerCase().replace(' ', '-')}`}
              className="no-underline transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
            >
              {item}
            </Link>
          ))}

          <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href="#" aria-label="Instagram"
              className="transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn"
              className="transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <path d="M7 10v7M7 7v.01M12 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4M12 10v7" />
              </svg>
            </a>
            {/* Pinterest */}
            <a href="#" aria-label="Pinterest"
              className="transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.37 3.09-5.18 0-2.14-1.44-3.74-4.04-3.74-2.94 0-4.77 2.2-4.77 4.65 0 .84.24 1.43.62 1.89.17.2.19.28.13.51-.06.22-.19.77-.25 1-.08.32-.32.43-.59.31-1.66-.68-2.43-2.52-2.43-4.58 0-3.38 2.84-7.4 8.49-7.4 4.53 0 7.5 3.27 7.5 6.79 0 4.63-2.57 8.08-6.33 8.08-1.26 0-2.45-.68-2.86-1.45l-.83 3.25c-.24.94-.71 1.88-1.13 2.61.85.26 1.75.4 2.69.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}