import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useGetProjectBySlugQuery,
  useGetProjectsQuery,
} from "@/services/projectsApi";
import type { Project } from "@/types/project.types";

// ─── Utilities ────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ─── Reading progress bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60]"
      style={{ height: 2, background: "rgba(26,60,94,0.06)" }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--color-gold)",
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}

// ─── Hero skeleton ────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div
      className="relative overflow-hidden animate-pulse"
      style={{ height: "clamp(520px, 78vh, 900px)", background: "#0d1a26" }}
    >
      <div className="container-main absolute inset-0 flex flex-col justify-between py-10 md:py-14">
        <div
          style={{
            width: 180,
            height: 10,
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div>
          <div
            style={{
              width: 120,
              height: 10,
              background: "rgba(255,255,255,0.06)",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              width: "55%",
              height: 88,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 20,
            }}
          />
          <div
            style={{
              width: "35%",
              height: 12,
              background: "rgba(255,255,255,0.05)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Parallax hero ────────────────────────────────────────────────────────────
function Hero({ project }: { project: Project }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], [0, 180]);
  const year = new Date(project.completedAt).getFullYear();

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ height: "clamp(520px, 78vh, 900px)", background: "#0d1a26" }}
    >
      {/* Parallax background */}
      <motion.div
        style={{
          y: imgY,
          position: "absolute",
          inset: "-18% 0",
          backgroundImage: `url('${project.coverImage.url}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Layered gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,26,38,0.3) 0%, rgba(13,26,38,0.25) 35%, rgba(13,26,38,0.75) 72%, rgba(13,26,38,0.97) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="480"
          y1="0"
          x2="480"
          y2="900"
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="1"
        />
        <line
          x1="960"
          y1="0"
          x2="960"
          y2="900"
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="900"
          x2="1440"
          y2="0"
          stroke="rgba(201,168,76,0.06)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Content */}
      <div className="container-main absolute inset-0 flex flex-col justify-between py-10 md:py-14">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2"
          aria-label="Breadcrumb"
        >
          {[
            { label: "Home", to: "/" },
            { label: "Portfolio", to: "/portfolio" },
          ].map(({ label, to }) => (
            <span key={to} className="flex items-center gap-2">
              <Link
                to={to}
                className="no-underline transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-gold)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                }
              >
                {label}
              </Link>
              <span
                style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem" }}
              >
                ／
              </span>
            </span>
          ))}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
            }}
          >
            {project.title}
          </span>
        </motion.nav>

        {/* Bottom: title block */}
        <div>
          {/* Category + status */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="flex items-center gap-4 flex-wrap mb-5"
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: 28,
                  height: 1,
                  background: "var(--color-gold)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  fontWeight: 500,
                }}
              >
                {project.type}
              </span>
            </div>
            {!project.published && (
              <>
                <span
                  style={{
                    width: 1,
                    height: 12,
                    background: "rgba(255,255,255,0.2)",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.56rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(10,18,28,0.55)",
                    backdropFilter: "blur(8px)",
                    padding: "3px 10px",
                  }}
                >
                  ● Draft
                </span>
              </>
            )}
          </motion.div>

          {/* Title */}
          <h1 style={{ margin: "0 0 1.5rem" }}>
            {project.title.split(" ").map((word, i, arr) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.72,
                  delay: 0.32 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: "inline-block",
                  marginRight: i < arr.length - 1 ? "0.27em" : 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2.6rem, 7vw, 7rem)",
                  lineHeight: 0.9,
                  color:
                    i === arr.length - 1 ? "rgba(255,255,255,0.38)" : "white",
                  fontStyle: i === arr.length - 1 ? "italic" : "normal",
                  overflow: "hidden",
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {[
              { label: "Location", value: project.location ?? "—" },
              { label: "Year", value: String(year) },
              {
                label: "Area",
                value: project.area ? `${project.area} m²` : "—",
              },
              { label: "Client", value: "Private" },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-2.5">
                {i > 0 && (
                  <span
                    style={{
                      width: 1,
                      height: 14,
                      background: "rgba(255,255,255,0.15)",
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.54rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "rgba(255,255,255,0.72)",
                      fontWeight: 300,
                    }}
                  >
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Tags strip ───────────────────────────────────────────────────────────────
function TagsStrip({ project }: { project: Project }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(26,26,26,0.07)",
        background: "var(--color-bg)",
      }}
    >
      <div className="container-main py-4 flex flex-wrap items-center gap-3">
        {project.services.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 400,
              color: "rgba(26,26,26,0.5)",
              border: "1px solid rgba(26,26,26,0.12)",
              padding: "3px 12px",
            }}
          >
            {tag}
          </span>
        ))}
        {project.materials?.slice(0, 3).map((mat) => (
          <span
            key={mat}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 400,
              color: "rgba(26,26,26,0.38)",
              border: "1px solid rgba(26,26,26,0.07)",
              padding: "3px 12px",
            }}
          >
            {mat}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky side nav ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "challenge", label: "Brief" },
  { id: "approach", label: "Approach" },
  { id: "gallery", label: "Gallery" },
  { id: "specs", label: "Specs" },
];

function SideNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.35, rootMargin: "-8% 0px -58% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <aside
      className="hidden xl:flex flex-col gap-0.5 sticky self-start"
      style={{ top: "calc(var(--nav-height) + 3.5rem)" }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.54rem",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(26,26,26,0.28)",
          margin: "0 0 1rem",
          fontWeight: 500,
        }}
      >
        Contents
      </p>
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() =>
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="flex items-center gap-3 text-left focus:outline-none"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <motion.div
              animate={{
                width: isActive ? 22 : 10,
                background: isActive
                  ? "var(--color-gold)"
                  : "rgba(26,26,26,0.18)",
              }}
              transition={{ duration: 0.28 }}
              style={{ height: 1, flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.61rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: isActive ? "var(--color-ink)" : "rgba(26,26,26,0.32)",
                fontWeight: isActive ? 600 : 400,
                transition: "color 0.2s",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

// ─── Text narrative section ───────────────────────────────────────────────────
function NarrativeSection({
  id,
  eyebrow,
  heading,
  body,
  pullQuote,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  pullQuote?: string;
}) {
  const { ref, vis } = useReveal(0.12);
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 md:py-14"
      style={{ borderTop: "1px solid rgba(26,26,26,0.07)" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          style={{
            width: 22,
            height: 1,
            background: "var(--color-gold)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            fontWeight: 500,
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-4">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.65rem, 3vw, 2.8rem)",
              color: "var(--color-ink)",
              margin: 0,
              lineHeight: 1.08,
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="md:col-span-8">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "clamp(0.9rem, 1.1vw, 1.02rem)",
              lineHeight: 1.88,
              color: "rgba(26,26,26,0.62)",
              margin: 0,
            }}
          >
            {body}
          </p>
          {pullQuote && (
            <motion.blockquote
              initial={{ opacity: 0, x: -12 }}
              animate={vis ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.25 }}
              style={{
                margin: "2.5rem 0 0",
                paddingLeft: "1.5rem",
                borderLeft: "2px solid var(--color-gold)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
                  color: "var(--color-ink)",
                  lineHeight: 1.4,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                "{pullQuote}"
              </p>
            </motion.blockquote>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Full-bleed image break ───────────────────────────────────────────────────
function ImageBreak({ src, caption }: { src: string; caption?: string }) {
  const { ref, vis } = useReveal(0.06);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        aspectRatio: "21/8",
        margin: "0 calc(-1 * var(--container-px, 1.5rem))",
        background: "rgba(26,60,94,0.06)",
      }}
    >
      <img
        src={src}
        alt={caption ?? ""}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{
          transition: "transform 12s ease",
          transform: vis ? "scale(1.03)" : "scale(1.08)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,18,28,0.45) 0%, transparent 40%)",
        }}
      />
      {caption && (
        <p
          className="absolute bottom-0 right-0"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.66rem",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.5)",
            margin: "0 1.25rem 1rem 0",
          }}
        >
          {caption}
        </p>
      )}
    </motion.div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ images }: { images: Project["images"] }) {
  const { ref, vis } = useReveal(0.06);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox((i) =>
          i !== null ? Math.min(i + 1, images.length - 1) : null,
        );
      if (e.key === "ArrowLeft")
        setLightbox((i) => (i !== null ? Math.max(i - 1, 0) : null));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <section
      ref={ref}
      id="gallery"
      className="py-12 md:py-14"
      style={{ borderTop: "1px solid rgba(26,26,26,0.07)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div
          style={{
            width: 22,
            height: 1,
            background: "var(--color-gold)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            fontWeight: 500,
          }}
        >
          Photography
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            color: "rgba(26,26,26,0.28)",
            marginLeft: 4,
          }}
        >
          {images.length} images
        </span>
      </motion.div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {images.map((img, i) => {
          // Every 6-image cycle: 0→wide(16/9), 1→tall(3/4), 2-4→normal(4/3), 5→wide(16/9)
          const pos = i % 6;
          const isWide = pos === 0 || pos === 5;
          const isTall = pos === 1;
          const colSpan = isWide
            ? "col-span-12 md:col-span-8"
            : isTall
              ? "col-span-12 md:col-span-4"
              : "col-span-12 sm:col-span-6 md:col-span-4";
          const aspect = isWide ? "16/9" : isTall ? "3/4" : "4/3";

          return (
            <motion.div
              key={img.publicId ?? i}
              className={colSpan}
              initial={{ opacity: 0, y: 28 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                className="group w-full text-left focus:outline-none block"
                onClick={() => setLightbox(i)}
                aria-label={`Enlarge image ${i + 1}`}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: aspect,
                    background: "rgba(26,60,94,0.05)",
                  }}
                >
                  <img
                    src={img.url}
                    alt={`Project image ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{
                      transition:
                        "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                  <div
                    className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 60%, rgba(26,60,94,0.55) 100%)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                      >
                        <path d="M5 1H1v4M15 5V1h-4M1 11v4h4M11 15h4v-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{
              background: "rgba(8,14,20,0.97)",
              backdropFilter: "blur(16px)",
            }}
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full mx-4 md:mx-12 max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              style={{ margin: 0 }}
            >
              <img
                src={images[lightbox].url}
                alt={`Image ${lightbox + 1}`}
                className="w-full object-contain"
                style={{ maxHeight: "78vh" }}
              />
              <figcaption className="mt-4 flex items-center justify-end">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.25)",
                    flexShrink: 0,
                  }}
                >
                  {lightbox + 1} / {images.length}
                </span>
              </figcaption>
              {lightbox > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(lightbox - 1);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{
                    left: -52,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.38)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.38)")
                  }
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M11 3L6 8l5 5" />
                  </svg>
                </button>
              )}
              {lightbox < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(lightbox + 1);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{
                    right: -52,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.38)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.38)")
                  }
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M5 3l5 5-5 5" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute focus:outline-none"
                style={{
                  top: -44,
                  right: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Specs & credits ──────────────────────────────────────────────────────────
function Specs({ project }: { project: Project }) {
  const { ref, vis } = useReveal(0.08);
  const year = new Date(project.completedAt).getFullYear();

  const specs = [
    { label: "Type", value: project.type },
    { label: "Location", value: project.location ?? "—" },
    { label: "Area", value: project.area ? `${project.area} m²` : "—" },
    { label: "Year", value: String(year) },
    ...(project.materials ?? []).map((mat, i) => ({
      label: `Material ${i + 1}`,
      value: mat,
    })),
  ];

  return (
    <section
      ref={ref}
      id="specs"
      className="py-12 md:py-14"
      style={{ borderTop: "1px solid rgba(26,26,26,0.07)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-10"
      >
        <div
          style={{
            width: 22,
            height: 1,
            background: "var(--color-gold)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            fontWeight: 500,
          }}
        >
          Project Data
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Specs grid */}
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 18 }}
          animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.06 }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.57rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(26,26,26,0.3)",
              fontWeight: 500,
              margin: "0 0 1rem",
            }}
          >
            Technical
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-px"
            style={{ background: "rgba(26,26,26,0.06)" }}
          >
            {specs.map(({ label, value }) => (
              <div
                key={label}
                className="py-5 px-5"
                style={{ background: "var(--color-bg)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.54rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,26,0.32)",
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.84rem",
                    color: "var(--color-ink)",
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Services sidebar */}
        <motion.div
          className="lg:col-span-4 flex flex-col gap-8"
          initial={{ opacity: 0, y: 18 }}
          animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.14 }}
        >
          {project.services.length > 0 && (
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.57rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(26,26,26,0.3)",
                  fontWeight: 500,
                  margin: "0 0 1rem",
                }}
              >
                Services
              </p>
              <div className="flex flex-col gap-2.5">
                {project.services.map((service) => (
                  <div key={service} className="flex items-center gap-2.5">
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "var(--color-gold)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        color: "rgba(26,26,26,0.62)",
                        fontWeight: 300,
                      }}
                    >
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO description re-used as project statement */}
          {project.seo?.metaDescription && (
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.57rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(26,26,26,0.3)",
                  fontWeight: 500,
                  margin: "0 0 1rem",
                }}
              >
                Statement
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "0.82rem",
                  color: "rgba(26,26,26,0.55)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {project.seo.metaDescription}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Prev / Next nav ──────────────────────────────────────────────────────────
function ProjectNav({ currentSlug }: { currentSlug: string }) {
  const { ref, vis } = useReveal(0.15);

  // Fetch a broader list to find prev/next
  const { data } = useGetProjectsQuery({ limit: 100, published: true });
  const all = data?.data.projects ?? [];
  const idx = all.findIndex((p) => p.slug === currentSlug);
  const prevP = idx > 0 ? all[idx - 1] : null;
  const nextP = idx < all.length - 1 ? all[idx + 1] : null;

  const NavCard = ({
    project,
    dir,
  }: {
    project: Project | null;
    dir: "prev" | "next";
  }) => {
    const [hov, setHov] = useState(false);
    if (!project) return <div className="flex-1" />;
    const year = new Date(project.completedAt).getFullYear();
    return (
      <Link
        to={`/portfolio/${project.slug}`}
        className="flex-1 no-underline block relative overflow-hidden"
        style={{ aspectRatio: "16/7", minHeight: 160 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <img
          src={project.coverImage.url}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover absolute inset-0"
          style={{
            transition: "transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
            transform: hov ? "scale(1.06)" : "scale(1)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to ${dir === "prev" ? "right" : "left"}, rgba(13,26,38,0.92) 0%, rgba(13,26,38,0.45) 55%, rgba(13,26,38,0.15) 100%)`,
            transition: "opacity 0.4s",
            opacity: hov ? 1 : 0.88,
          }}
        />
        <div
          className={`absolute inset-0 flex flex-col justify-center gap-2 px-8 md:px-10 ${dir === "next" ? "items-end text-right" : ""}`}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexDirection: dir === "next" ? "row-reverse" : "row",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {dir === "prev" ? (
                <path d="M11 3L6 8l5 5" />
              ) : (
                <path d="M5 3l5 5-5 5" />
              )}
            </svg>
            {dir === "prev" ? "Previous" : "Next"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1rem, 2.2vw, 1.9rem)",
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {project.title}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.42)",
              fontWeight: 300,
            }}
          >
            {project.location} · {year}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div ref={ref} style={{ background: "#0d1a26" }}>
      <div className="container-main pt-6 pb-3">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.56rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)",
            margin: 0,
          }}
        >
          Continue Exploring
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row"
      >
        <NavCard project={prevP} dir="prev" />
        <div
          style={{
            width: 1,
            background: "rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        />
        <NavCard project={nextP} dir="next" />
      </motion.div>
      <div className="container-main py-5 flex justify-center">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 no-underline"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            paddingBottom: 2,
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "var(--color-gold)";
            el.style.borderColor = "rgba(201,168,76,0.4)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "rgba(255,255,255,0.28)";
            el.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M11 3L6 8l5 5" />
          </svg>
          All Projects
        </Link>
      </div>
    </div>
  );
}

// ─── Not found / Error ────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-7 py-40"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          border: "1px solid rgba(26,26,26,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          stroke="rgba(26,26,26,0.18)"
          strokeWidth="1"
        >
          <rect x="1" y="1" width="24" height="24" />
          <path d="M9 13h8M13 9v8" />
        </svg>
      </div>
      <div className="text-center">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "2rem",
            color: "rgba(26,26,26,0.3)",
            margin: "0 0 0.5rem",
          }}
        >
          Project not found
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "rgba(26,26,26,0.28)",
            margin: 0,
          }}
        >
          This project may not exist or has been moved.
        </p>
      </div>
      <Link
        to="/portfolio"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          background: "var(--color-brand)",
          color: "white",
          padding: "0.85rem 2rem",
          textDecoration: "none",
          transition: "filter 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.filter = "brightness(1.1)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")
        }
      >
        ← Back to Portfolio
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetProjectBySlugQuery(slug ?? "", {
    skip: !slug,
  });

  // Temporary debug
  console.log({ slug, data, isLoading, isError });
  const project = data?.data.project;

  // ✅ Fires once the project data is actually in the DOM
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [slug, isLoading]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/portfolio");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [project, navigate]);

  if (isLoading) return <HeroSkeleton />;
  if (isError || !project) return <NotFound />;

  // Use 3rd image for the mid-article break
  const breakImage = project?.images?.[2] ?? project?.images?.[0];

  return (
    <>
      <ReadingProgress />
      <Hero project={project} />
      <TagsStrip project={project} />

      {/* Body */}
      <div style={{ background: "var(--color-bg)" }}>
        <div className="container-main">
          <div className="grid grid-cols-1 xl:grid-cols-[188px_1fr] gap-0 xl:gap-16">
            <SideNav />

            <main className="min-w-0 pb-6">
              <NarrativeSection
                id="overview"
                eyebrow="Overview"
                heading="The Project"
                body={project.description}
                pullQuote={project.seo?.metaDescription}
              />

              <NarrativeSection
                id="challenge"
                eyebrow="The Brief"
                heading="Challenge"
                body={project.clientBrief ?? ""}
              />

              {/* Full-bleed visual break */}
              {breakImage && <ImageBreak src={breakImage.url} />}

              <NarrativeSection
                id="approach"
                eyebrow="Design"
                heading="Our Approach"
                body={project.approach ?? ""}
              />

              {project.images && project.images.length > 0 && (
                <Gallery images={project.images} />
              )}

              <Specs project={project} />
            </main>
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div
        style={{
          background: "var(--color-brand)",
          padding: "clamp(3rem, 7vw, 5.5rem) 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="240"
            x2="1440"
            y2="0"
            stroke="rgba(201,168,76,0.06)"
            strokeWidth="1.5"
          />
          <line
            x1="720"
            y1="0"
            x2="720"
            y2="240"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1"
          />
        </svg>
        <div className="container-main relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                style={{
                  width: 24,
                  height: 1,
                  background: "var(--color-gold)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  fontWeight: 500,
                }}
              >
                Work with us
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 4vw, 3.4rem)",
                color: "white",
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              Interested in a similar{" "}
              <em
                style={{ fontStyle: "italic", color: "rgba(255,255,255,0.38)" }}
              >
                project?
              </em>
            </h2>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 no-underline group"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.67rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: "var(--color-gold)",
                color: "var(--color-ink)",
                padding: "0.95rem 2.2rem",
                transition: "filter 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.filter =
                  "brightness(1.08)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.filter =
                  "brightness(1)")
              }
            >
              Get in Touch
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path d="M3 13L13 3M13 3H6M13 3v7" />
              </svg>
            </Link>
            <Link
              to="/services"
              className="no-underline transition-colors duration-200"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.67rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.38)",
                borderBottom: "1px solid rgba(255,255,255,0.16)",
                paddingBottom: 2,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.38)")
              }
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>

      <ProjectNav currentSlug={slug ?? ""} />
    </>
  );
}
