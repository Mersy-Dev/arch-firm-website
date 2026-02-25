import { useEffect, useRef, useState } from 'react';

// ─── Data ──────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    number: '01',
    title: 'Architectural Design',
    tagline: 'From concept to construction',
    description:
      'Full-cycle architectural services — site analysis, schematic design, design development, and construction documentation. We translate your vision into buildings that stand the test of time.',
    features: ['Concept & Schematic Design', 'Design Development', 'Construction Documents', 'Permit Coordination'],
    image: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800&q=80&fit=crop',
  },
  {
    number: '02',
    title: 'Interior Architecture',
    tagline: 'Spaces that breathe',
    description:
      'Interior environments crafted with the same rigour as our buildings. From material palette to bespoke joinery, every detail is resolved with purpose and aesthetic intent.',
    features: ['Space Planning', 'Material & Finish Curation', 'Bespoke Furniture Design', 'Lighting Strategy'],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fit=crop',
  },
  {
    number: '03',
    title: 'Urban & Master Planning',
    tagline: 'Shaping communities',
    description:
      'Large-scale planning that balances density, movement, green space, and identity. We design districts and neighbourhoods that become beloved parts of the city fabric.',
    features: ['Urban Design Strategy', 'Feasibility Studies', 'Mixed-Use Planning', 'Public Realm Design'],
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&fit=crop',
  },
  {
    number: '04',
    title: 'Sustainability Consulting',
    tagline: 'Responsible by design',
    description:
      'Integrating passive design, low-carbon materials, and energy modelling from day one. Our buildings achieve ambitious sustainability targets without sacrificing beauty.',
    features: ['Passive Design Strategies', 'Energy & Carbon Modelling', 'LEED / BREEAM Advisory', 'Lifecycle Assessment'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&fit=crop',
  },
  {
    number: '05',
    title: 'Heritage & Adaptive Reuse',
    tagline: 'Old bones, new life',
    description:
      'Sensitive interventions that honour history while unlocking new potential. We navigate listed buildings, planning constraints, and conservation requirements with expertise.',
    features: ['Conservation Assessment', 'Adaptive Reuse Strategy', 'Heritage Impact Analysis', 'Planning Liaison'],
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80&fit=crop',
  },
];

// ─── Hook: trigger animate-in on scroll ───────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('animate-in'); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Single service row ────────────────────────────────────────────────────
function ServiceRow({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  // Reveal ref lives on a neutral wrapper — NOT the hover element.
  // This prevents data-animate's opacity:0 from conflicting with the
  // background-color transition on the interactive row.
  const revealRef = useReveal(0.1);
  const isEven    = index % 2 === 1;
  const delay     = `${index * 0.08}s`;

  return (
    // ── Reveal wrapper: only owns the scroll-triggered opacity/translate ──
    <div ref={revealRef} data-animate style={{ transitionDelay: delay }}>

      {/* ── Interactive row: only owns background-color transition ── */}
      <div
        className={`
          group relative grid grid-cols-1 lg:grid-cols-2
          border-b border-[var(--color-ink)]/10
          transition-colors duration-500
          ${hovered ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-bg)]'}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Content side ── */}
        <div
          className={`
            relative flex flex-col justify-between
            px-8 md:px-14 py-12 md:py-16
            ${isEven ? 'lg:order-2' : 'lg:order-1'}
          `}
        >
          {/* Top row: number + tagline */}
          <div className="flex items-start justify-between mb-8">
            <span
              className="text-[4rem] leading-none select-none transition-colors duration-500"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                color: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(26,26,26,0.06)',
              }}
            >
              {service.number}
            </span>
            <span
              className="text-[0.6rem] tracking-[0.28em] uppercase mt-2 text-[var(--color-gold)]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              {service.tagline}
            </span>
          </div>

          {/* Title */}
          <h3
            className="leading-tight mb-5 transition-colors duration-500"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              color: hovered ? '#ffffff' : 'var(--color-ink)',
            }}
          >
            {service.title}
          </h3>

          {/* Description */}
          <p
            className="leading-relaxed mb-8 max-w-[42ch] transition-colors duration-500"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '0.9rem',
              color: hovered ? 'rgba(255,255,255,0.65)' : 'rgba(26,26,26,0.55)',
            }}
          >
            {service.description}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {service.features.map((f) => (
              <span
                key={f}
                className="px-3.5 py-1.5 text-[0.6rem] tracking-[0.15em] uppercase border transition-colors duration-300"
                style={{
                  fontFamily: 'var(--font-body)',
                  borderColor: hovered ? 'rgba(255,255,255,0.2)'  : 'rgba(26,26,26,0.12)',
                  color:       hovered ? 'rgba(255,255,255,0.7)'  : 'rgba(26,26,26,0.5)',
                  background:  hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA link */}
          <a
            href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="inline-flex items-center gap-2 self-start text-[0.65rem] tracking-[0.22em] uppercase border-b pb-px no-underline transition-colors duration-300"
            style={{
              fontFamily:  'var(--font-body)',
              fontWeight:  500,
              color:       hovered ? 'var(--color-gold)'  : 'var(--color-brand)',
              borderColor: hovered ? 'rgba(201,168,76,0.5)' : 'rgba(26,60,94,0.35)',
            }}
          >
            Learn More
            <svg
              width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>

        {/* ── Image side ── */}
        <div
          className={`
            relative overflow-hidden
            ${isEven ? 'lg:order-1' : 'lg:order-2'}
            min-h-[280px] lg:min-h-0
          `}
          style={{ aspectRatio: '4/3' }}
        >
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay — transition-colors only, never transition-all */}
          <div
            className="absolute inset-0 transition-colors duration-500"
            style={{ background: hovered ? 'rgba(26,60,94,0.2)' : 'rgba(0,0,0,0.15)' }}
          />
          {/* Corner bracket */}
          <div
            className={`
              absolute top-6 w-8 h-8 transition-opacity duration-300
              ${isEven ? 'right-6' : 'left-6'}
              ${hovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              {isEven
                ? <><path d="M32 0 L32 14"/><path d="M32 0 L18 0"/></>
                : <><path d="M0 0 L0 14"/><path d="M0 0 L14 0"/></>
              }
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main ServicesList ─────────────────────────────────────────────────────
export default function ServicesList() {
  const headerRef = useReveal(0.2);

  return (
    <section className="bg-[var(--color-bg)]" aria-labelledby="services-heading">

      {/* ── Section Header ── */}
      <div className="container-main">
        <div
          ref={headerRef}
          data-animate
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pt-[clamp(3rem,8vw,7rem)] pb-16 border-b border-[var(--color-ink)]/10"
        >
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[var(--color-gold)] shrink-0" />
              <span
                className="text-[var(--color-gold)] text-[0.65rem] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                What We Do
              </span>
            </div>
            <h2
              id="services-heading"
              className="text-[var(--color-ink)] leading-[1.05] m-0"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              }}
            >
              End-to-end{' '}
              <em className="text-[var(--color-ink)]/40" style={{ fontStyle: 'italic' }}>
                expertise
              </em>
            </h2>
          </div>

          {/* Right */}
          <p
            className="text-[var(--color-ink)]/50 leading-relaxed m-0 max-w-[38ch] md:text-right"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.88rem' }}
          >
            From a single room to an entire city block, our practice covers
            every scale of the built environment — with the same commitment
            to craft at every level.
          </p>
        </div>
      </div>

      {/* ── Service Rows (full-bleed) ── */}
      <div className="w-full border-t border-[var(--color-ink)]/10">
        {SERVICES.map((service, i) => (
          <ServiceRow key={service.number} service={service} index={i} />
        ))}
      </div>

      {/* ── Bottom CTA strip ── */}
      <div className="container-main">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-14 border-t border-[var(--color-ink)]/10">
          <p
            className="text-[var(--color-ink)]/50 m-0 text-sm"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            Not sure which service fits your project?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2.5 bg-[var(--color-brand)] text-white text-[0.68rem] tracking-[0.2em] uppercase px-8 py-4 hover:bg-[var(--color-brand)]/85 hover:-translate-y-0.5 transition-all duration-200 no-underline shrink-0"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            Book a Consultation
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>

    </section>
  );
}