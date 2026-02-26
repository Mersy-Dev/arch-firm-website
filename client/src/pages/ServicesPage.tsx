import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useGetAllServicesQuery } from "@/services/servicesApi";
import type { Service } from "@/services/servicesApi";

// ─── Stats (still static — these are studio-level figures) ─────────────────
const STATS = [
  { value: "180+", label: "Projects Delivered" },
  { value: "24",   label: "Years of Practice"  },
  { value: "5",    label: "Core Services"       },
  { value: "31",   label: "Awards Won"          },
];

// ─── Hooks ─────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
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

// ─── Page hero ─────────────────────────────────────────────────────────────
function PageHero() {
  return (
    <div
      className="relative overflow-hidden flex flex-col justify-end"
      style={{
        background: "var(--color-brand)",
        minHeight: "clamp(320px, 45vw, 520px)",
        paddingBottom: "clamp(3rem, 6vw, 5rem)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(26,60,94,0.45) 0%, rgba(26,60,94,0.85) 100%),
            url('https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1600&q=70&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
        {[360, 720, 1080].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="520"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <line x1="0" y1="520" x2="1440" y2="0"
          stroke="rgba(201,168,76,0.07)" strokeWidth="1.5" />
      </svg>

      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <Link to="/" className="no-underline transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >Home</Link>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}>›</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--color-gold)" }}>Services</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3 mb-5"
        >
          <div style={{ width: 32, height: 1, background: "var(--color-gold)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem",
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "var(--color-gold)", fontWeight: 500 }}>What We Do</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "var(--font-display)", fontWeight: 300,
            fontSize: "clamp(2.8rem, 7vw, 6.5rem)", lineHeight: 0.95,
            color: "white", margin: "0 0 1.5rem" }}
        >
          End-to-end{" "}
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>expertise</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ fontFamily: "var(--font-body)", fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)", color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7, maxWidth: "48ch", margin: 0 }}
        >
          From a single room to an entire city block — our practice covers every
          scale of the built environment with the same commitment to craft.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute bottom-0 right-0 hidden lg:flex items-stretch"
        style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {STATS.map(({ value, label }, i) => (
          <div key={label}
            className="flex flex-col items-center justify-center px-8 py-5"
            style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 300,
              fontSize: "1.8rem", color: "white", lineHeight: 1 }}>{value}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--color-gold)", marginTop: 4 }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Skeleton tabs ──────────────────────────────────────────────────────────
function SkeletonTabs() {
  return (
    <div className="flex items-stretch gap-0 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 52,
            width: 120,
            background: "rgba(26,26,26,0.05)",
            margin: "0 2px",
          }}
        />
      ))}
    </div>
  );
}

// ─── Service tab nav ────────────────────────────────────────────────────────
function ServiceTabs({
  services, active, onChange,
}: {
  services: Service[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="sticky z-30 overflow-x-auto"
      style={{
        top: "var(--nav-height)",
        background: "var(--color-bg)",
        borderBottom: "1px solid rgba(26,26,26,0.08)",
        scrollbarWidth: "none",
      }}
    >
      <div className="container-main">
        <div className="flex items-stretch gap-0">
          {services.map(({ _id, number, title }) => {
            const isActive = active === _id;
            return (
              <button
                key={_id}
                onClick={() => onChange(_id)}
                className="group flex items-center gap-2.5 py-4 px-4 shrink-0 focus:outline-none"
                style={{
                  fontFamily: "var(--font-body)", fontSize: "0.68rem",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--color-brand)" : "rgba(26,26,26,0.4)",
                  background: "none", border: "none", cursor: "pointer",
                  transition: "color 0.2s",
                  borderBottom: isActive ? "2px solid var(--color-gold)" : "2px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-brand)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(26,26,26,0.4)"; }}
              >
                <span style={{ fontSize: "0.56rem", color: "var(--color-gold)", fontWeight: 600 }}>{number}</span>
                <span className="hidden sm:block">{title}</span>
                <span className="sm:hidden">{title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton detail panel ──────────────────────────────────────────────────
function SkeletonDetail() {
  return (
    <div style={{ background: "var(--color-ink)" }}>
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 animate-pulse">
          <div className="lg:col-span-5">
            <div style={{ aspectRatio: "4/5", background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center gap-4">
            <div style={{ width: "40%", height: 10, background: "rgba(255,255,255,0.07)" }} />
            <div style={{ width: "70%", height: 48, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ width: "90%", height: 12, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ width: "80%", height: 12, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ width: "60%", height: 12, background: "rgba(255,255,255,0.05)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Service detail panel ───────────────────────────────────────────────────
function ServiceDetail({ service }: { service: Service }) {
  return (
    <div style={{ background: "var(--color-ink)" }}>
      <div className="container-main py-16 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={service._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

              {/* ── Left: image ── */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                  <img
                    src={service.image} alt={service.title}
                    className="w-full h-full object-cover"
                    style={{ transition: "transform 0.8s ease" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
                    loading="lazy"
                  />
                  {/* Number overlay */}
                  <div className="absolute top-6 left-6">
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 300,
                      fontSize: "5rem", lineHeight: 1,
                      color: "rgba(255,255,255,0.12)", display: "block" }}>
                      {service.number}
                    </span>
                  </div>
                  {/* Gold corner */}
                  <div className="absolute bottom-6 right-6">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
                      stroke="var(--color-gold)" strokeWidth="1.2">
                      <path d="M36 0 L36 18" /><path d="M36 0 L18 0" />
                    </svg>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mt-6 p-6"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem",
                    letterSpacing: "0.25em", textTransform: "uppercase",
                    color: "var(--color-gold)", fontWeight: 500, margin: "0 0 1rem" }}>
                    Key Deliverables
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.deliverables.map(d => (
                      <span key={d} style={{
                        fontFamily: "var(--font-body)", fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.55)", fontWeight: 400,
                        padding: "4px 12px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right: content ── */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 28, height: 1, background: "var(--color-gold)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem",
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    color: "var(--color-gold)", fontWeight: 500 }}>
                    {service.tagline}
                  </span>
                </div>

                {/* Title */}
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300,
                  fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05,
                  color: "white", margin: "0 0 1.5rem" }}>
                  {service.title}
                </h2>

                {/* Description */}
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 300,
                  fontSize: "clamp(0.88rem, 1.1vw, 1rem)", lineHeight: 1.8,
                  color: "rgba(255,255,255,0.5)", margin: "0 0 2.5rem", maxWidth: "52ch" }}>
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-10">
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem",
                    letterSpacing: "0.25em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)", fontWeight: 500, margin: "0 0 1rem" }}>
                    What&apos;s Included
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {service.features.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <div style={{ width: 4, height: 4, borderRadius: "50%",
                          background: "var(--color-gold)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem",
                          fontWeight: 400, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 no-underline group"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500,
                      fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      background: "var(--color-gold)", color: "var(--color-ink)",
                      padding: "0.9rem 2rem", transition: "filter 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = "brightness(1)"}
                  >
                    Discuss This Service
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                      stroke="currentColor" strokeWidth="1.5"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <path d="M3 13L13 3M13 3H6M13 3v7" />
                    </svg>
                  </Link>
                  <Link
                    to="/portfolio"
                    className="no-underline"
                    style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem",
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.36)",
                      borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2,
                      transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.36)"}
                  >
                    See Related Projects
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────
function ServiceError({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ background: "var(--color-ink)" }}>
      <div className="container-main py-20 text-center">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem",
          color: "rgba(255,255,255,0.35)", marginBottom: "1.25rem" }}>
          Could not load services.
        </p>
        <button
          onClick={onRetry}
          style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.55)", padding: "0.7rem 1.5rem",
            cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-gold)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-gold)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─── Process teaser strip ───────────────────────────────────────────────────
function ProcessTeaser() {
  const { ref, vis } = useReveal(0.2);
  const STEPS = [
    { n: "01", label: "Discovery",   desc: "Site visits, brief refinement, budget alignment" },
    { n: "02", label: "Concept",     desc: "Sketches, models, spatial ideas explored"        },
    { n: "03", label: "Development", desc: "Resolved design, planning submissions"           },
    { n: "04", label: "Delivery",    desc: "On-site coordination, handover"                  },
  ];

  return (
    <div ref={ref}
      style={{ background: "var(--color-bg)", borderTop: "1px solid rgba(26,26,26,0.07)" }}
      className="section-pad"
    >
      <div className="container-main">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 28, height: 1, background: "var(--color-gold)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--color-gold)", fontWeight: 500 }}>How We Work</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3.8rem)", lineHeight: 1.05,
              color: "var(--color-ink)", margin: 0 }}>
              A clear{" "}
              <em style={{ fontStyle: "italic", color: "rgba(26,26,26,0.28)" }}>process</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Link to="/process"
              className="inline-flex items-center gap-2 no-underline group"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--color-brand)",
                borderBottom: "1px solid rgba(26,60,94,0.25)", paddingBottom: 2,
                transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-gold)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-gold)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-brand)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(26,60,94,0.25)";
              }}
            >
              Full Process Detail
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "rgba(26,26,26,0.07)" }}>
          {STEPS.map(({ n, label, desc }, i) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 16 }} animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              className="flex flex-col p-8"
              style={{ background: "var(--color-bg)", transition: "background 0.25s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(26,60,94,0.03)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--color-bg)"}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 300,
                fontSize: "2.5rem", lineHeight: 1, color: "rgba(26,60,94,0.08)",
                display: "block", marginBottom: "1rem" }}>{n}</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%",
                background: "var(--color-gold)", marginBottom: "0.85rem" }} />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--color-ink)", marginBottom: "0.5rem" }}>{label}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 300,
                fontSize: "0.78rem", lineHeight: 1.6,
                color: "rgba(26,26,26,0.42)" }}>{desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { data, isLoading, isError, refetch } = useGetAllServicesQuery();

  const services = data?.data ?? [];

  const [activeId, setActiveId] = useState<string | null>(null);

  // Once services load, default to the first one
  useEffect(() => {
    if (services.length > 0 && !activeId) {
      setActiveId(services[0]._id);
    }
  }, [services, activeId]);

  const activeService = services.find(s => s._id === activeId) ?? services[0] ?? null;

  return (
    <>
      <Helmet>
        <title>Services — FORMA Architecture Studio</title>
        <meta name="description"
          content="End-to-end architectural services including design, interiors, master planning, sustainability consulting, and heritage work." />
      </Helmet>

      <PageHero />

      {/* Tab nav — show skeleton while loading */}
      {isLoading ? (
        <div
          className="sticky z-30 overflow-x-auto"
          style={{
            top: "var(--nav-height)",
            background: "var(--color-bg)",
            borderBottom: "1px solid rgba(26,26,26,0.08)",
          }}
        >
          <div className="container-main py-2">
            <SkeletonTabs />
          </div>
        </div>
      ) : !isError && services.length > 0 && activeId ? (
        <ServiceTabs
          services={services}
          active={activeId}
          onChange={setActiveId}
        />
      ) : null}

      {/* Detail panel */}
      {isLoading ? (
        <SkeletonDetail />
      ) : isError ? (
        <ServiceError onRetry={refetch} />
      ) : activeService ? (
        <ServiceDetail service={activeService} />
      ) : null}

      <ProcessTeaser />
    </>
  );
}