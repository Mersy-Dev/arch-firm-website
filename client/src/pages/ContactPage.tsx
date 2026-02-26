import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// ─── Design tokens (mirrors site globals) ─────────────────────────────────
// var(--color-brand)  = #1a3c5e  deep navy
// var(--color-gold)   = #c9a84c  warm gold
// var(--color-ink)    = #1a1a1a
// var(--color-bg)     = #fafaf8
// var(--font-display) = serif display
// var(--font-body)    = sans body

// ─── Data ─────────────────────────────────────────────────────────────────
const OFFICES = [
  {
    flag: 'NY',
    city: 'New York',
    role: 'Principal Office',
    address: '142 Mercer Street\nSoHo, New York, NY 10012',
    phone: '+1 (212) 555 0100',
    email: 'ny@forma.studio',
    hours: 'Mon–Fri, 9am–6pm EST',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&fit=crop',
  },
  {
    flag: 'LDN',
    city: 'London',
    role: 'European Studio',
    address: '27 Clerkenwell Road\nLondon, EC1M 5RN',
    phone: '+44 20 7946 0320',
    email: 'ldn@forma.studio',
    hours: 'Mon–Fri, 9am–6pm GMT',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900&q=80&fit=crop',
  },
  {
    flag: 'DXB',
    city: 'Dubai',
    role: 'Gulf Region',
    address: 'Gate Village 6, Level 2\nDIFC, Dubai, UAE',
    phone: '+971 4 555 0210',
    email: 'dxb@forma.studio',
    hours: 'Sun–Thu, 9am–6pm GST',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop',
  },
];

const ENQUIRY_TYPES = [
  'New Project',
  'Interior Design',
  'Master Planning',
  'Sustainability',
  'Heritage & Reuse',
  'Press & Media',
  'Careers',
  'Other',
];

const BUDGET_RANGES = [
  'Under £250k',
  '£250k – £1m',
  '£1m – £5m',
  '£5m – £20m',
  '£20m+',
  'Not sure yet',
];

// ─── Hooks ─────────────────────────────────────────────────────────────────
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

// ─── Eyebrow — site-wide pattern ──────────────────────────────────────────
function Eyebrow({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div style={{ width: 26, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '0.6rem',
        letterSpacing: '0.3em', textTransform: 'uppercase',
        color: 'var(--color-gold)', fontWeight: 500,
      }}>{label}</span>
    </div>
  );
}

// ─── ① HERO ────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const imgY  = useTransform(scrollY, [0, 600], [0, 140]);
  const textY = useTransform(scrollY, [0, 600], [0, 50]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'clamp(480px, 68vh, 820px)', background: '#07111a' }}
    >
      {/* Parallax bg */}
      <motion.div
        style={{
          y: imgY, position: 'absolute',
          inset: '-18% 0 -18% 0',
          backgroundImage: `url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&q=85&fit=crop')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0" aria-hidden="true" style={{
        background: 'linear-gradient(to bottom, rgba(7,17,26,0.4) 0%, rgba(7,17,26,0.3) 30%, rgba(7,17,26,0.78) 65%, rgba(7,17,26,0.98) 100%)',
      }} />

      {/* Grid accent lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 820" preserveAspectRatio="none" aria-hidden="true">
        <line x1="480"  y1="0" x2="480"  y2="820" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="960"  y1="0" x2="960"  y2="820" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="0" y1="820" x2="1440" y2="0"    stroke="rgba(201,168,76,0.06)"   strokeWidth="1.5"/>
      </svg>

      <div className="container-main absolute inset-0 flex flex-col justify-between py-10 md:py-14">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Link to="/" className="no-underline" style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.6rem' }}>／</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)',
          }}>Contact</span>
        </motion.nav>

        {/* Title block */}
        <motion.div style={{ y: textY }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            <Eyebrow label="Get in Touch" light />
          </motion.div>

          <h1 aria-label="Start a conversation." style={{ margin: '0 0 1.8rem', lineHeight: 0.95 }}>
            {['Start', 'a', 'conversation.'].map((word, i, arr) => (
              <motion.span key={word}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.72, delay: 0.32 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  marginRight: i < arr.length - 1 ? '0.28em' : 0,
                  fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: 'clamp(3rem, 9vw, 9.5rem)', lineHeight: 0.9,
                  color: i === arr.length - 1 ? 'rgba(255,255,255,0.3)' : 'white',
                  fontStyle: i === arr.length - 1 ? 'italic' : 'normal',
                  overflow: 'hidden',
                }}
              >{word}</motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.72 }}
            style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.2vw, 1.05rem)',
              color: 'rgba(255,255,255,0.44)', lineHeight: 1.82,
              maxWidth: '50ch', margin: 0,
            }}
          >
            Every great project begins with a conversation. Tell us what you are
            thinking — we will tell you how we can make it remarkable.
          </motion.p>
        </motion.div>

      </div>

      {/* Bottom rule — site-wide 1px gold line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(201,168,76,0.25)' }} />
    </div>
  );
}

// ─── ② MAIN CONTENT — form left, office panel right ───────────────────────
// Form: cream bg. Office selector: navy sidebar.
// They sit in a split grid — two halves of the same row.

type FormState = {
  name: string;
  email: string;
  company: string;
  enquiry: string;
  budget: string;
  message: string;
};

function ContactForm() {
  const { ref, vis } = useReveal(0.06);
  const [form, setForm] = useState<FormState>({
    name: '', email: '', company: '', enquiry: '', budget: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fieldStyle = (name: string): React.CSSProperties => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused === name ? 'var(--color-brand)' : 'rgba(26,26,26,0.14)'}`,
    outline: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: '0.92rem',
    color: 'var(--color-ink)',
    padding: '0.75rem 0',
    transition: 'border-color 0.25s',
    borderRadius: 0,
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.58rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(26,26,26,0.38)',
    fontWeight: 500,
    display: 'block',
    marginBottom: '0.25rem',
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start justify-center"
        style={{ minHeight: 480 }}
      >
        {/* Gold check mark */}
        <div style={{
          width: 56, height: 56, border: '1px solid var(--color-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '2.5rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-gold)" strokeWidth="1.5">
            <path d="M4 12l5 5 11-11" />
          </svg>
        </div>

        <Eyebrow label="Message Sent" />
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(2rem, 3.5vw, 3rem)',
          color: 'var(--color-ink)', margin: '0 0 1.25rem', lineHeight: 1.05,
        }}>
          We&apos;ll be in touch{' '}
          <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.3)' }}>shortly.</em>
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: '0.9rem', lineHeight: 1.78,
          color: 'rgba(26,26,26,0.52)', maxWidth: '44ch', margin: '0 0 2.5rem',
        }}>
          Thank you for reaching out. A member of our team will respond within
          two business days.
        </p>
        <Link to="/portfolio" className="inline-flex items-center gap-2.5 no-underline group"
          style={{
            fontFamily: 'var(--font-body)', fontWeight: 500,
            fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            background: 'var(--color-brand)', color: 'white',
            padding: '1rem 2.2rem', transition: 'filter 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
        >
          View Our Work
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            className="transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px">
            <path d="M3 13L13 3M13 3H6M13 3v7" />
          </svg>
        </Link>
      </motion.div>
    );
  }

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65 }} className="mb-10"
      >
        <Eyebrow label="Send a Brief" />
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
          color: 'var(--color-ink)', margin: 0, lineHeight: 1.05,
        }}>
          Tell us about{' '}
          <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.3)' }}>your project</em>
        </h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Row 1: Name + Email */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input type="text" required value={form.name} onChange={set('name')}
              placeholder="Elara Voss"
              style={{ ...fieldStyle('name'), color: 'var(--color-ink)' }}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" required value={form.email} onChange={set('email')}
              placeholder="elara@studio.com"
              style={fieldStyle('email')}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
            />
          </div>
        </motion.div>

        {/* Row 2: Company */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          <label style={labelStyle}>Company / Organisation</label>
          <input type="text" value={form.company} onChange={set('company')}
            placeholder="Optional"
            style={fieldStyle('company')}
            onFocus={() => setFocused('company')} onBlur={() => setFocused(null)}
          />
        </motion.div>

        {/* Row 3: Enquiry type pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Enquiry Type</label>
          <div className="flex flex-wrap gap-2">
            {ENQUIRY_TYPES.map(type => {
              const active = form.enquiry === type;
              return (
                <button
                  key={type} type="button"
                  onClick={() => setForm(f => ({ ...f, enquiry: active ? '' : type }))}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                    letterSpacing: '0.08em', fontWeight: active ? 500 : 400,
                    padding: '0.42rem 1rem',
                    border: `1px solid ${active ? 'var(--color-brand)' : 'rgba(26,26,26,0.14)'}`,
                    background: active ? 'var(--color-brand)' : 'transparent',
                    color: active ? 'white' : 'rgba(26,26,26,0.52)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-brand)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.14)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.52)';
                    }
                  }}
                >{type}</button>
              );
            })}
          </div>
        </motion.div>

        {/* Row 4: Budget pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.25 }}
        >
          <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Approximate Budget</label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map(range => {
              const active = form.budget === range;
              return (
                <button
                  key={range} type="button"
                  onClick={() => setForm(f => ({ ...f, budget: active ? '' : range }))}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                    letterSpacing: '0.08em', fontWeight: active ? 500 : 400,
                    padding: '0.42rem 1rem',
                    border: `1px solid ${active ? 'var(--color-gold)' : 'rgba(26,26,26,0.14)'}`,
                    background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: active ? 'var(--color-brand)' : 'rgba(26,26,26,0.52)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-brand)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.14)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.52)';
                    }
                  }}
                >{range}</button>
              );
            })}
          </div>
        </motion.div>

        {/* Row 5: Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          <label style={labelStyle}>Your Message *</label>
          <textarea
            required rows={5} value={form.message} onChange={set('message')}
            placeholder="Tell us about your project — site, programme, ambitions, timeline..."
            style={{
              ...fieldStyle('message'),
              resize: 'none', lineHeight: 1.7, paddingTop: '0.75rem',
            }}
            onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          className="flex items-center gap-5"
          initial={{ opacity: 0, y: 14 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.38 }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2.5 group"
            style={{
              fontFamily: 'var(--font-body)', fontWeight: 500,
              fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              background: 'var(--color-gold)', color: 'var(--color-ink)',
              padding: '1rem 2.4rem', border: 'none', cursor: 'pointer',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
          >
            Send Message
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px">
              <path d="M3 13L13 3M13 3H6M13 3v7"/>
            </svg>
          </button>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            color: 'rgba(26,26,26,0.32)', lineHeight: 1.5,
          }}>
            We respond within<br />two business days.
          </span>
        </motion.div>

      </form>
    </div>
  );
}

// ─── Office selector sidebar ───────────────────────────────────────────────
function OfficeSidebar() {
  const { ref, vis } = useReveal(0.06);
  const [active, setActive] = useState(0);

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--color-brand)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* SVG accent lines — consistent with every navy section */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 600 900" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="900" x2="600" y2="0" stroke="rgba(201,168,76,0.06)" strokeWidth="1.5"/>
        <line x1="300" y1="0" x2="300" y2="900" stroke="rgba(255,255,255,0.022)" strokeWidth="1"/>
      </svg>

      <div className="relative z-10 p-8 md:p-10 lg:p-12 flex flex-col h-full">

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }} className="mb-10"
        >
          <Eyebrow label="Our Offices" />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)',
            color: 'white', margin: 0, lineHeight: 1.05,
          }}>
            Three <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.36)' }}>cities</em>
          </h2>
        </motion.div>

        {/* Office selector list */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {OFFICES.map((office, i) => {
            const isActive = active === i;
            return (
              <motion.button
                key={office.city}
                onClick={() => setActive(i)}
                initial={{ opacity: 0, x: -16 }} animate={vis ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.08 }}
                className="w-full text-left focus:outline-none"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '1.4rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
                  paddingLeft: isActive ? '1rem' : 0,
                  transition: 'border-color 0.25s, padding-left 0.28s',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.25)',
                      fontWeight: 600, display: 'block', marginBottom: 4,
                      transition: 'color 0.22s',
                    }}>{office.flag} — {office.role}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 300,
                      fontSize: 'clamp(1.4rem, 2vw, 2rem)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.38)',
                      display: 'block', lineHeight: 1.1,
                      transition: 'color 0.22s',
                    }}>{office.city}</span>
                  </div>

                  {/* Expand indicator */}
                  <div style={{
                    width: 20, height: 20, border: '1px solid',
                    borderColor: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 4, transition: 'border-color 0.22s',
                  }}>
                    <motion.svg
                      width="8" height="8" viewBox="0 0 8 8" fill="none"
                      stroke={isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="1.5"
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <path d="M4 0v8M0 4h8"/>
                    </motion.svg>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pt-5 pb-1 flex flex-col gap-3">
                        <p style={{
                          fontFamily: 'var(--font-body)', fontWeight: 300,
                          fontSize: '0.82rem', lineHeight: 1.65,
                          color: 'rgba(255,255,255,0.5)', margin: 0,
                          whiteSpace: 'pre-line',
                        }}>{office.address}</p>

                        <div className="flex flex-col gap-1.5">
                          <a href={`tel:${office.phone.replace(/\s/g, '')}`}
                            className="no-underline flex items-center gap-2 group/link"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                              color: 'rgba(255,255,255,0.42)', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
                            onClick={e => e.stopPropagation()}
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
                              stroke="var(--color-gold)" strokeWidth="1.5">
                              <path d="M2 2h4l1.5 3.5-2 1.5a9 9 0 0 0 3.5 3.5l1.5-2L14 10v4a1 1 0 0 1-1 1C5.5 15 1 9 1 3a1 1 0 0 1 1-1z"/>
                            </svg>
                            {office.phone}
                          </a>
                          <a href={`mailto:${office.email}`}
                            className="no-underline flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                              color: 'var(--color-gold)', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                            onClick={e => e.stopPropagation()}
                          >
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
                              stroke="currentColor" strokeWidth="1.5">
                              <rect x="1" y="3" width="14" height="10" rx="1"/>
                              <path d="M1 4l7 5 7-5"/>
                            </svg>
                            {office.email}
                          </a>
                        </div>

                        <p style={{
                          fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.24)', margin: 0,
                          letterSpacing: '0.08em',
                        }}>{office.hours}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Office image — crossfades on tab change */}
        <motion.div
          className="mt-auto pt-8 hidden lg:block"
          initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={OFFICES[active].image} alt={OFFICES[active].city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(26,60,94,0.7) 0%, transparent 55%)',
              }} aria-hidden="true"/>
              {/* Gold corner bracket */}
              <div className="absolute top-3 right-3" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none"
                  stroke="var(--color-gold)" strokeWidth="1.2">
                  <path d="M26 0 L26 13"/><path d="M26 0 L13 0"/>
                </svg>
              </div>
              <div className="absolute bottom-4 left-5">
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: '1.2rem', color: 'white', margin: 0, lineHeight: 1 }}>
                  {OFFICES[active].city}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}

// ─── ③ SPLIT LAYOUT — form + sidebar ──────────────────────────────────────
function MainContent() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* Left: form — cream */}
          <div className="lg:col-span-7 py-16 md:py-20 lg:pr-16">
            <ContactForm />
          </div>

          {/* Vertical divider — desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div style={{
              width: 1, height: '100%',
              background: 'rgba(26,26,26,0.07)',
              margin: '0 auto',
            }} />
          </div>

          {/* Right: office sidebar — navy */}
          <div className="lg:col-span-4" style={{ marginLeft: '-1px' }}>
            <OfficeSidebar />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── ④ DIRECT CONTACT STRIP ───────────────────────────────────────────────
// Thin dark ink band — email + phone quick-access
function DirectContact() {
  const { ref, vis } = useReveal(0.2);

  const contacts = [
    {
      label: 'New Commissions',
      value: 'hello@forma.studio',
      href: 'mailto:hello@forma.studio',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="var(--color-gold)" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="10" rx="1"/>
          <path d="M1 4l7 5 7-5"/>
        </svg>
      ),
    },
    {
      label: 'Press Enquiries',
      value: 'press@forma.studio',
      href: 'mailto:press@forma.studio',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="var(--color-gold)" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="10" rx="1"/>
          <path d="M1 4l7 5 7-5"/>
        </svg>
      ),
    },
    {
      label: 'Careers',
      value: 'careers@forma.studio',
      href: 'mailto:careers@forma.studio',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="var(--color-gold)" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="10" rx="1"/>
          <path d="M1 4l7 5 7-5"/>
        </svg>
      ),
    },
    {
      label: 'Main Switchboard',
      value: '+1 (212) 555 0100',
      href: 'tel:+12125550100',
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="var(--color-gold)" strokeWidth="1.5">
          <path d="M2 2h4l1.5 3.5-2 1.5a9 9 0 0 0 3.5 3.5l1.5-2L14 10v4a1 1 0 0 1-1 1C5.5 15 1 9 1 3a1 1 0 0 1 1-1z"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--color-ink)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
      }}
    >
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          {contacts.map(({ label, value, href, icon }, i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: 16 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="group flex flex-col gap-3 p-7 no-underline"
              style={{
                background: 'var(--color-ink)',
                transition: 'background 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-ink)'}
            >
              <div style={{
                width: 36, height: 36,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {icon}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)', margin: '0 0 4px', fontWeight: 500,
                }}>{label}</p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.86rem',
                  color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 300,
                  transition: 'color 0.2s',
                }}
                  className="group-hover:text-[var(--color-gold)]"
                >{value}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}



// ─── Page export ───────────────────────────────────────────────────────────
export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <>
      <Helmet>
        <title>Contact — FORMA Architecture Studio</title>
        <meta name="description"
          content="Get in touch with FORMA. New York, London, and Dubai offices. Tell us about your project." />
      </Helmet>

      <Hero />           {/* navy parallax                      */}
      <MainContent />    {/* cream form + navy office sidebar   */}
      <DirectContact />  {/* dark ink — quick contact grid      */}
      {/* <BottomCTA />      navy — portfolio CTA               */}
    </>
  );
}