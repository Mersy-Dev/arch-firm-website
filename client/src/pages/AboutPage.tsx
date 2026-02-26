import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const STATS = [
  { value: 180, suffix: '+', label: 'Projects Completed' },
  { value: 24,  suffix: '',  label: 'Years in Practice'  },
  { value: 42,  suffix: '',  label: 'Studio Members'     },
  { value: 31,  suffix: '',  label: 'Awards Won'         },
];

const MANIFESTO_WORDS = [
  'Silence.', 'Patience.', 'Restraint.', 'Honesty.',
  'Material.', 'Site.', 'Light.', 'Time.',
];

const TEAM = [
  {
    name:   'Elara Voss',
    title:  'Founding Principal',
    bio:    'Studied under Zumthor in Haldenstein. Twenty-four years of practice across four continents. Believes every material has a right to be what it is.',
    edu:    'Royal Academy, Copenhagen · ETH Zurich',
    image:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80&fit=crop&crop=faces',
    size:   'large', // controls portrait height in stagger grid
  },
  {
    name:   'Marcus Obi',
    title:  'Principal, Urban Design',
    bio:    'Former advisor to the Mayor of London on housing density. Believes cities are the greatest design project in human history.',
    edu:    'Bartlett School, UCL',
    image:  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=80&fit=crop&crop=faces',
    size:   'small',
  },
  {
    name:   'Soo-Jin Park',
    title:  'Principal, Interiors',
    bio:    'Trained as a materials scientist before architecture. Approaches every interior as a question of how surfaces age, not how they photograph.',
    edu:    'KAIST Seoul · Harvard GSD',
    image:  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=700&q=80&fit=crop&crop=faces',
    size:   'small',
  },
  {
    name:   'Tomás Herrera',
    title:  'Director, Sustainability',
    bio:    'Has never designed a building that required active cooling. Thinks this should be the baseline, not the exception.',
    edu:    'ETSAM Madrid · Passive House Institut',
    image:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80&fit=crop&crop=faces',
    size:   'large',
  },
  {
    name:   'Ama Darko',
    title:  'Associate, Heritage',
    bio:    'Specialises in the collision between old fabric and new life. Trained as a conservator before practising as an architect.',
    edu:    'AA London · Accademia di Belle Arti, Florence',
    image:  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&q=80&fit=crop&crop=faces',
    size:   'small',
  },
  {
    name:   'Jin Wei',
    title:  'Associate, Technology',
    bio:    'Writes the parametric tools the studio depends on. Argues computation is just another craft — like masonry, but harder to undo.',
    edu:    'Tsinghua University · SCI-Arc',
    image:  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=700&q=80&fit=crop&crop=faces',
    size:   'small',
  },
];

const VALUES = [
  { n: '01', h: 'Silence is a material',         b: 'The greatest luxury in architecture today is quiet. We design for the pause, the threshold, the breath before a view reveals itself.' },
  { n: '02', h: 'Materials over methods',         b: 'We specify stone, timber, and concrete because they improve with age. We do not specify materials we would be ashamed of in twenty years.' },
  { n: '03', h: 'The site knows more than we do', b: 'We spend more time on site analysis than schematic design. The ground, the light, the neighbours — they all have opinions worth listening to.' },
  { n: '04', h: 'Restraint is generosity',        b: 'Every element that is not there is a gift to those that remain. We remove until nothing more can go without losing something essential.' },
];

const TIMELINE = [
  { year: '2001', event: 'Founded by Elara Voss in Zurich. Three staff, one drafting table, one conviction.' },
  { year: '2004', event: 'First public commission — a bathhouse in rural Switzerland. Won the Swiss Architectural Award.' },
  { year: '2007', event: 'New York studio opened in SoHo. First Hudson Valley residential project completed.' },
  { year: '2011', event: 'Marcus Obi joins as Principal. Urban Design practice established.' },
  { year: '2014', event: 'Kaia Cultural Centre wins RIBA National Award. Studio reaches 30 people.' },
  { year: '2017', event: 'London studio opens on Clerkenwell Road. Soo-Jin Park joins as Principal.' },
  { year: '2019', event: 'Dubai office established. First Gulf region project: Dunes Private Villa.' },
  { year: '2022', event: 'Tomás Herrera appointed Director of Sustainability. First net-zero project delivered.' },
  { year: '2024', event: '180+ completed projects. 42 members. 4 continents. Still one drafting table.' },
];

const OFFICES = [
  {
    flag: 'NY', city: 'New York', role: 'Principal Office',
    address: '142 Mercer Street, SoHo\nNew York, NY 10012',
    phone: '+1 (212) 555 0100', email: 'ny@forma.studio',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&fit=crop',
  },
  {
    flag: 'LDN', city: 'London', role: 'European Studio',
    address: '27 Clerkenwell Road\nLondon, EC1M 5RN',
    phone: '+44 20 7946 0320', email: 'ldn@forma.studio',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900&q=80&fit=crop',
  },
  {
    flag: 'DXB', city: 'Dubai', role: 'Gulf Region Office',
    address: 'Gate Village 6, Level 2\nDIFC, Dubai, UAE',
    phone: '+971 4 555 0210', email: 'dxb@forma.studio',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// Shared: gold line + uppercase eyebrow label
function Eyebrow({ label }: { label: string }) {
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

// Stat counter — safe at component level (no hook-in-loop)
function StatCard({ value, suffix, label, index, active }: {
  value: number; suffix: string; label: string; index: number; active: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 55));
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setCount(value); clearInterval(t); }
      else setCount(cur);
    }, 20);
    return () => clearInterval(t);
  }, [active, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col items-start py-10 px-8"
      style={{ background: 'var(--color-brand)' }}
    >
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 300,
        fontSize: 'clamp(2.6rem, 5vw, 4rem)', color: 'white', lineHeight: 1,
      }}>
        {count}{suffix}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '0.57rem',
        letterSpacing: '0.26em', textTransform: 'uppercase',
        color: 'var(--color-gold)', marginTop: 9, fontWeight: 500,
      }}>
        {label}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ① HERO — parallax + word-by-word title (consistent pattern)
// ═══════════════════════════════════════════════════════════════════════════════
function Hero() {
  const { scrollY } = useScroll();
  const imgY  = useTransform(scrollY, [0, 700], [0, 170]);
  const textY = useTransform(scrollY, [0, 700], [0, 58]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'clamp(560px, 82vh, 960px)', background: '#07111a' }}
    >
      {/* Parallax image */}
      <motion.div
        style={{
          y: imgY, position: 'absolute',
          inset: '-18% 0 -18% 0',
          backgroundImage: `url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&q=85&fit=crop')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      {/* Layered gradient — dark bottom for type legibility */}
      <div className="absolute inset-0" aria-hidden="true" style={{
        background: 'linear-gradient(to bottom, rgba(7,17,26,0.35) 0%, rgba(7,17,26,0.28) 25%, rgba(7,17,26,0.72) 60%, rgba(7,17,26,0.98) 100%)',
      }} />

      {/* Geometric grid accent */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 960" preserveAspectRatio="none" aria-hidden="true">
        <line x1="480"  y1="0" x2="480"  y2="960" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="960"  y1="0" x2="960"  y2="960" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="0" y1="960" x2="1440" y2="0"    stroke="rgba(201,168,76,0.07)"   strokeWidth="1.5"/>
      </svg>

      <div className="container-main absolute inset-0 flex flex-col justify-between py-10 md:py-14">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2" aria-label="Breadcrumb"
        >
          <Link to="/" className="no-underline" style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
            onMouseLeave={e  => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>／</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)',
          }}>Studio</span>
        </motion.nav>

        {/* Title block with parallax */}
        <motion.div style={{ y: textY }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="flex items-center gap-3 mb-6"
          >
            <div style={{ width: 28, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.62rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'var(--color-gold)', fontWeight: 500,
            }}>Est. 2001 · New York, London, Dubai</span>
          </motion.div>

          {/* Word-by-word reveal — mirrors Portfolio, ProjectDetail */}
          <h1 aria-label="We build with care." style={{ margin: '0 0 1.8rem', lineHeight: 1 }}>
            {['We', 'build', 'with', 'care.'].map((word, i, arr) => (
              <motion.span key={word}
                initial={{ y: '108%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.72, delay: 0.32 + i * 0.11, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  marginRight: i < arr.length - 1 ? '0.28em' : 0,
                  fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: 'clamp(2.8rem, 8.5vw, 9rem)', lineHeight: 0.9,
                  color: i === arr.length - 1 ? 'rgba(255,255,255,0.34)' : 'white',
                  fontStyle: i === arr.length - 1 ? 'italic' : 'normal',
                  overflow: 'hidden',
                }}>{word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.82 }}
            style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.2vw, 1.06rem)',
              color: 'rgba(255,255,255,0.44)', lineHeight: 1.82,
              maxWidth: '52ch', margin: 0,
            }}
          >
            FORMA is an architecture practice built around one conviction:
            that buildings should be made with the same patience and honesty
            as the finest craft objects. Nothing more. Nothing less.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② STATS BAR
// ═══════════════════════════════════════════════════════════════════════════════
function StatsBar() {
  const { ref, vis } = useReveal(0.25);
  return (
    <div ref={ref} style={{ background: 'var(--color-brand)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          {STATS.map(({ value, suffix, label }, i) => (
            <StatCard key={label} value={value} suffix={suffix} label={label} index={i} active={vis} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ MANIFESTO MARQUEE — scrolling words strip (innovation moment)
// ═══════════════════════════════════════════════════════════════════════════════
function ManifettoStrip() {
  // Infinite marquee: duplicate array for seamless loop
  const words = [...MANIFESTO_WORDS, ...MANIFESTO_WORDS];
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid rgba(26,26,26,0.07)',
        borderBottom: '1px solid rgba(26,26,26,0.07)',
        overflow: 'hidden',
        padding: '1.5rem 0',
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        className="flex items-center gap-0 whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {words.map((word, i) => (
          <span key={i} className="flex items-center">
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
              color: i % 2 === 0 ? 'var(--color-ink)' : 'rgba(26,26,26,0.2)',
              letterSpacing: '-0.01em',
              padding: '0 2.5rem',
            }}>{word}</span>
            {/* Gold dot divider */}
            <span style={{
              display: 'inline-block', width: 4, height: 4, borderRadius: '50%',
              background: 'var(--color-gold)', flexShrink: 0,
            }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ MANIFESTO — split image / narrative text
// ═══════════════════════════════════════════════════════════════════════════════
function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref, vis } = useReveal(0.1);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section
      ref={sectionRef}
      style={{ background: 'var(--color-bg)', padding: 'clamp(5rem, 11vw, 10rem) 0', overflow: 'hidden' }}
    >
      <div ref={ref} className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — layered image composition */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={vis ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Shadow block offset — depth illusion */}
            <div className="absolute" aria-hidden="true" style={{
              inset: 0, transform: 'translate(20px, 20px)',
              background: 'rgba(26,60,94,0.07)', zIndex: 0,
            }} />

            {/* Main image with inner parallax */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', zIndex: 1 }}>
              <motion.div style={{ y: imageY, position: 'absolute', inset: '-10% 0' }}>
                <img
                  src="https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=900&q=80&fit=crop"
                  alt="FORMA studio at work" loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </motion.div>

              {/* Subtle dark vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(135deg, transparent 60%, rgba(26,60,94,0.15) 100%)',
              }} aria-hidden="true" />

              {/* Gold corner bracket — bottom right */}
              <div className="absolute bottom-5 right-5 pointer-events-none" aria-hidden="true">
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="var(--color-gold)" strokeWidth="1.2">
                  <path d="M38 0 L38 19" /><path d="M38 0 L19 0" />
                </svg>
              </div>
            </div>

            {/* Ghost "24" watermark behind image */}
            <div className="absolute pointer-events-none select-none" aria-hidden="true"
              style={{ bottom: -24, left: -14, zIndex: 0 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 300,
                fontSize: 'clamp(7rem, 14vw, 12rem)', lineHeight: 1,
                color: 'rgba(26,60,94,0.048)',
              }}>24</span>
            </div>
          </motion.div>

          {/* Right — narrative copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={vis ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow label="Who We Are" />

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(2rem, 4vw, 3.6rem)',
              color: 'var(--color-ink)', margin: '0 0 1.5rem', lineHeight: 1.05,
            }}>
              A practice built on{' '}
              <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.32)' }}>patience</em>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {[
                'FORMA was founded in 2001 by Elara Voss with a single conviction: that architecture which endures is architecture that listens. Listens to its site. To the people who will inhabit it. To the materials that compose it.',
                'Twenty-four years later, that conviction has shaped over 180 projects across four continents — from a one-room bathhouse in rural Switzerland to a 34-storey mixed-use tower in Manhattan.',
                'We are not a large practice. We are forty-two people who care intensely about the same things. That is not a weakness. It is the reason our buildings look the way they do.',
              ].map((para, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300,
                  fontSize: 'clamp(0.88rem, 1.1vw, 1rem)', lineHeight: 1.87,
                  color: 'rgba(26,26,26,0.6)', margin: 0,
                }}>{para}</p>
              ))}
            </div>

            {/* Gold-border pull-quote — consistent with ProjectDetailPage */}
            <blockquote style={{ margin: '2.75rem 0 0', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-gold)' }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(1.05rem, 1.8vw, 1.45rem)',
                color: 'var(--color-ink)', lineHeight: 1.45, margin: 0,
                letterSpacing: '-0.01em',
              }}>
                "Architecture is not about space. It is about time — the time it takes to make something properly."
              </p>
              <footer style={{
                fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.38)', marginTop: 14, fontWeight: 500,
              }}>
                — Elara Voss, Founding Principal
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ VALUES — dark navy 2×2 grid with hover glow
// ═══════════════════════════════════════════════════════════════════════════════
function Values() {
  const { ref, vis } = useReveal(0.08);

  return (
    <section style={{
      background: 'var(--color-brand)',
      padding: 'clamp(5rem, 11vw, 10rem) 0',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 720" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="720" x2="1440" y2="0"  stroke="rgba(201,168,76,0.06)" strokeWidth="1.5"/>
        <line x1="720" y1="0" x2="720" y2="720" stroke="rgba(255,255,255,0.022)" strokeWidth="1"/>
      </svg>

      <div ref={ref} className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }} className="mb-14"
        >
          <Eyebrow label="What We Believe" />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            color: 'white', margin: 0, lineHeight: 1.05,
          }}>
            Four <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.36)' }}>principles</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px"
          style={{ background: 'rgba(255,255,255,0.055)' }}>
          {VALUES.map(({ n, h, b }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 28 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.09 }}
              className="relative p-10 md:p-12 group"
              style={{ background: 'var(--color-brand)', transition: 'background 0.35s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.038)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-brand)'}
            >
              {/* Ghost number */}
              <span aria-hidden="true" style={{
                position: 'absolute', top: '1.75rem', right: '2.5rem',
                fontFamily: 'var(--font-display)', fontWeight: 300,
                fontSize: '5.5rem', lineHeight: 1,
                color: 'rgba(255,255,255,0.038)',
                userSelect: 'none', pointerEvents: 'none',
              }}>{n}</span>

              {/* Gold dot */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--color-gold)', marginBottom: '1.75rem',
              }} />

              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 300,
                fontSize: 'clamp(1.25rem, 2vw, 1.85rem)',
                color: 'white', margin: '0 0 1rem', lineHeight: 1.15,
              }}>{h}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 300,
                fontSize: '0.9rem', lineHeight: 1.84,
                color: 'rgba(255,255,255,0.44)', margin: 0,
              }}>{b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ TEAM — asymmetric stagger grid (innovative layout moment)
//   Column A: large portrait (3/4) + small portrait (3/4)
//   Column B: offset start with small portrait + large portrait
//   Column C (desktop only): decorative text label
// ═══════════════════════════════════════════════════════════════════════════════
function TeamMember({ member, index, isActive, onEnter, onLeave }: {
  member: typeof TEAM[0];
  index: number;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const isLarge = member.size === 'large';
  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{ aspectRatio: isLarge ? '3/4' : '3/4' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <img
        src={member.image} alt={member.name} loading="lazy"
        className="w-full h-full object-cover"
        style={{
          transition: 'transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94)',
          transform: isActive ? 'scale(1.07)' : 'scale(1)',
        }}
      />

      {/* Default — gradient + name */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(10,18,28,0.88) 0%, rgba(10,18,28,0.15) 45%, transparent 100%)',
        transition: 'opacity 0.35s', opacity: isActive ? 0 : 1, pointerEvents: 'none',
      }} />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5"
        style={{ transition: 'opacity 0.25s', opacity: isActive ? 0 : 1, pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.05rem', color: 'white', margin: 0, lineHeight: 1.2 }}>
          {member.name}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.61rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-gold)', margin: '5px 0 0', fontWeight: 500,
        }}>{member.title}</p>
      </div>

      {/* Hover — navy bio overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            className="absolute inset-0 flex flex-col justify-end p-6"
            style={{ background: 'rgba(26,60,94,0.95)' }}
          >
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.57rem',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--color-gold)', fontWeight: 500, margin: '0 0 0.4rem',
            }}>{member.title}</p>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(1rem, 1.4vw, 1.18rem)', color: 'white',
              margin: '0 0 0.85rem', lineHeight: 1.22,
            }}>{member.name}</p>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: '0.8rem', lineHeight: 1.76,
              color: 'rgba(255,255,255,0.57)', margin: '0 0 1rem',
            }}>{member.bio}</p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.26)', fontStyle: 'italic', margin: 0,
            }}>{member.edu}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Team() {
  const { ref, vis } = useReveal(0.06);
  const [hovered, setHovered] = useState<number | null>(null);

  // Asymmetric layout:
  // Left col: members 0 (large), 1 (small) — standard top alignment
  // Right col: members 2 (small), 3 (large) — nudged down 2rem for stagger
  // Below: members 4,5 in 3-col with decorative label in middle

  return (
    <section style={{ background: 'var(--color-bg)', padding: 'clamp(5rem, 11vw, 10rem) 0' }}>
      <div ref={ref} className="container-main">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65 }}
          >
            <Eyebrow label="The People" />
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(2rem, 4vw, 3.6rem)',
              color: 'var(--color-ink)', margin: 0, lineHeight: 1.05,
            }}>
              Forty-two people,{' '}
              <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.32)' }}>one direction</em>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.86rem',
              color: 'rgba(26,26,26,0.42)', maxWidth: '30ch', margin: 0, lineHeight: 1.7,
            }}
          >
            Hover any portrait to read their story.
          </motion.p>
        </div>

        {/* Top row — asymmetric two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px mb-px"
          style={{ background: 'rgba(26,26,26,0.07)' }}>

          {/* Left col — two portraits stacked */}
          <div className="flex flex-col gap-px" style={{ background: 'rgba(26,26,26,0.07)' }}>
            {[0, 1].map(idx => (
              <motion.div
                key={TEAM[idx].name}
                initial={{ opacity: 0, y: 28 }}
                animate={vis ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: 'var(--color-bg)' }}
              >
                <TeamMember
                  member={TEAM[idx]}
                  index={idx}
                  isActive={hovered === idx}
                  onEnter={() => setHovered(idx)}
                  onLeave={() => setHovered(null)}
                />
              </motion.div>
            ))}
          </div>

          {/* Right col — offset start: decorative spacer, then two portraits */}
          <div className="flex flex-col" style={{ background: 'var(--color-bg)' }}>
            {/* Offset spacer with vertical text label */}
            <div
              className="relative hidden md:flex items-center justify-center overflow-hidden"
              style={{ height: '5rem', background: 'rgba(26,26,26,0.022)' }}
              aria-hidden="true"
            >
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.55rem',
                letterSpacing: '0.35em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.22)', fontWeight: 500,
              }}>
                Principals & Associates
              </span>
              {/* Gold accent line */}
              <div style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 30, height: 1, background: 'var(--color-gold)',
                marginLeft: '1.5rem',
              }} />
            </div>
            <div className="flex flex-col gap-px" style={{ background: 'rgba(26,26,26,0.07)', flex: 1 }}>
              {[2, 3].map((idx, j) => (
                <motion.div
                  key={TEAM[idx].name}
                  initial={{ opacity: 0, y: 28 }}
                  animate={vis ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.65, delay: (idx) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: 'var(--color-bg)' }}
                >
                  <TeamMember
                    member={TEAM[idx]}
                    index={idx}
                    isActive={hovered === idx}
                    onEnter={() => setHovered(idx)}
                    onLeave={() => setHovered(null)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row — remaining 2 members + decorative cell */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px"
          style={{ background: 'rgba(26,26,26,0.07)' }}>
          {[4, 5].map(idx => (
            <motion.div
              key={TEAM[idx].name}
              initial={{ opacity: 0, y: 28 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'var(--color-bg)' }}
            >
              <TeamMember
                member={TEAM[idx]}
                index={idx}
                isActive={hovered === idx}
                onEnter={() => setHovered(idx)}
                onLeave={() => setHovered(null)}
              />
            </motion.div>
          ))}

          {/* Decorative cell — careers CTA */}
          <motion.div
            initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.55 }}
            className="hidden md:flex flex-col items-start justify-end p-8"
            style={{
              background: 'var(--color-brand)', aspectRatio: '3/4',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Diagonal line accent */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="400" x2="300" y2="0" stroke="rgba(201,168,76,0.08)" strokeWidth="1.5"/>
            </svg>

            <div className="relative z-10">
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.26em', textTransform: 'uppercase',
                color: 'var(--color-gold)', margin: '0 0 0.75rem', fontWeight: 500,
              }}>Careers</p>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 300,
                fontSize: 'clamp(1.3rem, 2vw, 1.7rem)',
                color: 'white', margin: '0 0 2rem', lineHeight: 1.2,
              }}>
                We're looking for people who care about the same things.
              </p>
              <Link
                to="/careers"
                className="inline-flex items-center gap-2.5 no-underline group"
                style={{
                  fontFamily: 'var(--font-body)', fontWeight: 500,
                  fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                  background: 'var(--color-gold)', color: 'var(--color-ink)',
                  padding: '0.8rem 1.6rem', transition: 'filter 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
              >
                3 open roles
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M3 13L13 3M13 3H6M13 3v7"/>
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ TIMELINE — horizontal scrub on desktop, vertical list on mobile
// ═══════════════════════════════════════════════════════════════════════════════
function Timeline() {
  const { ref, vis } = useReveal(0.06);

  return (
    <section style={{
      background: 'rgba(26,26,26,0.022)',
      borderTop: '1px solid rgba(26,26,26,0.07)',
      borderBottom: '1px solid rgba(26,26,26,0.07)',
      padding: 'clamp(5rem, 11vw, 10rem) 0',
    }}>
      <div ref={ref} className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }} className="mb-14"
        >
          <Eyebrow label="Our History" />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            color: 'var(--color-ink)', margin: 0, lineHeight: 1.05,
          }}>
            Twenty-four <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.32)' }}>years</em>
          </h2>
        </motion.div>

        {/* Timeline list */}
        <div className="relative">
          {/* Vertical rail — desktop */}
          <div className="absolute hidden md:block" aria-hidden="true"
            style={{ left: '4.5rem', top: 0, bottom: 0, width: 1, background: 'rgba(26,26,26,0.09)' }}
          />

          {TIMELINE.map(({ year, event }, i) => {
            const isLast = i === TIMELINE.length - 1;
            return (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -22 }}
                animate={vis ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.065, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-start"
                style={{ borderBottom: isLast ? 'none' : '1px solid rgba(26,26,26,0.06)', padding: '1.25rem 0' }}
              >
                {/* Year — desktop column */}
                <div className="hidden md:block shrink-0" style={{ width: '4.5rem', paddingTop: 2 }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                    letterSpacing: '0.1em', color: 'rgba(26,26,26,0.3)', fontWeight: 500,
                  }}>{year}</span>
                </div>

                {/* Node dot on rail */}
                <div className="hidden md:flex items-center justify-center shrink-0 mr-8"
                  style={{ width: 20, paddingTop: 5 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: isLast ? 'var(--color-gold)' : 'rgba(26,26,26,0.18)',
                    transition: 'background 0.25s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-gold)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isLast ? 'var(--color-gold)' : 'rgba(26,26,26,0.18)')}
                  />
                </div>

                {/* Year — mobile */}
                <span className="md:hidden shrink-0 mr-5" style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  letterSpacing: '0.1em', color: 'var(--color-gold)', fontWeight: 600, paddingTop: 2,
                }}>{year}</span>

                {/* Event */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300,
                  fontSize: 'clamp(0.88rem, 1.1vw, 0.98rem)',
                  color: isLast ? 'var(--color-ink)' : 'rgba(26,26,26,0.6)',
                  margin: 0, lineHeight: 1.68, flex: 1,
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = isLast ? 'var(--color-ink)' : 'rgba(26,26,26,0.6)')}
                >{event}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑧ OFFICES — tab list + live image swap
// ═══════════════════════════════════════════════════════════════════════════════
function Offices() {
  const { ref, vis } = useReveal(0.08);
  const [active, setActive] = useState(0);

  return (
    <section style={{ background: 'var(--color-bg)', padding: 'clamp(5rem, 11vw, 10rem) 0' }}>
      <div ref={ref} className="container-main">

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }} className="mb-12"
        >
          <Eyebrow label="Where We Work" />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            color: 'var(--color-ink)', margin: 0, lineHeight: 1.05,
          }}>
            Three <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.32)' }}>cities</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-start">

          {/* Left: office selector list */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={vis ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }}>
              {OFFICES.map((office, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={office.city}
                    onClick={() => setActive(i)}
                    className="w-full flex items-start gap-6 text-left focus:outline-none"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid rgba(26,26,26,0.07)',
                      borderLeft: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
                      paddingLeft: isActive ? '1.1rem' : 0,
                      transition: 'border-color 0.25s, padding-left 0.28s',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.57rem',
                      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                      color: isActive ? 'var(--color-gold)' : 'rgba(26,26,26,0.2)',
                      transition: 'color 0.22s', paddingTop: 5, flexShrink: 0, width: 36,
                    }}>{office.flag}</span>

                    <div className="flex-1">
                      <p style={{
                        fontFamily: 'var(--font-display)', fontWeight: 300,
                        fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
                        color: isActive ? 'var(--color-brand)' : 'rgba(26,26,26,0.4)',
                        margin: '0 0 0.2rem', lineHeight: 1.1, transition: 'color 0.22s',
                      }}>{office.city}</p>
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.61rem',
                        letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500,
                        color: isActive ? 'var(--color-gold)' : 'rgba(26,26,26,0.24)',
                        margin: 0, transition: 'color 0.22s',
                      }}>{office.role}</p>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                          className="text-right shrink-0 hidden sm:block"
                        >
                          <p style={{
                            fontFamily: 'var(--font-body)', fontWeight: 300,
                            fontSize: '0.78rem', color: 'rgba(26,26,26,0.52)',
                            margin: '0 0 0.35rem', lineHeight: 1.5, whiteSpace: 'pre-line',
                          }}>{office.address}</p>
                          <a href={`tel:${office.phone.replace(/\s/g, '')}`}
                            className="block no-underline"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(26,26,26,0.38)', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.38)')}
                          >{office.phone}</a>
                          <a href={`mailto:${office.email}`}
                            className="block no-underline"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-gold)', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                          >{office.email}</a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Right: office image — AnimatePresence crossfade */}
          <motion.div
            initial={{ opacity: 0, x: 28 }} animate={vis ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block" style={{ position: 'sticky', top: '7rem' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={OFFICES[active].image} alt={OFFICES[active].city}
                  className="w-full h-full object-cover" loading="lazy"
                />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: 'linear-gradient(to top, rgba(26,60,94,0.68) 0%, transparent 55%)',
                }} />
                <div className="absolute bottom-5 left-6">
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.75rem', color: 'white', margin: 0, lineHeight: 1 }}>
                    {OFFICES[active].city}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.57rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '5px 0 0', fontWeight: 500 }}>
                    {OFFICES[active].role}
                  </p>
                </div>
                {/* Gold corner bracket */}
                <div className="absolute top-4 right-4" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="var(--color-gold)" strokeWidth="1.2">
                    <path d="M30 0 L30 14" /><path d="M30 0 L16 0" />
                  </svg>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <>
      <Hero />
      <StatsBar />
      <ManifettoStrip />
      <Manifesto />
      <Values />
      <Team />
      <Timeline />
      <Offices />
    </>
  );
}