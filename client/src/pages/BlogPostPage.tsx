import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useGetPostBySlugQuery, useGetAllPostsQuery } from "@/services/blogApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// ─── Reading progress bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const top = el.scrollTop || document.body.scrollTop;
      const h = el.scrollHeight - el.clientHeight;
      setProgress(h > 0 ? (top / h) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
      style={{ height: 2, background: "rgba(26,26,26,0.07)" }}
    >
      <motion.div
        style={{
          height: "100%",
          background: "var(--color-gold)",
          width: `${progress}%`,
        }}
        transition={{ duration: 0.05 }}
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div>
      {/* Hero skeleton */}
      <div
        className="animate-pulse"
        style={{
          aspectRatio: "16/6",
          background: "rgba(26,26,26,0.07)",
          maxHeight: 560,
        }}
      />

      <div
        className="container-main"
        style={{ maxWidth: 1100, paddingTop: "3rem" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block lg:col-span-2" />

          {/* Content skeleton */}
          <div className="lg:col-span-8 animate-pulse">
            <div
              style={{
                width: "18%",
                height: 7,
                background: "rgba(26,26,26,0.06)",
                marginBottom: "1.2rem",
              }}
            />
            <div
              style={{
                width: "88%",
                height: 40,
                background: "rgba(26,26,26,0.09)",
                marginBottom: "0.6rem",
              }}
            />
            <div
              style={{
                width: "62%",
                height: 40,
                background: "rgba(26,26,26,0.07)",
                marginBottom: "2rem",
              }}
            />
            <div
              style={{
                width: "45%",
                height: 8,
                background: "rgba(26,26,26,0.05)",
                marginBottom: "2.5rem",
              }}
            />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: `${78 + (i % 3) * 8}%`,
                  height: 11,
                  background: "rgba(26,26,26,0.05)",
                  marginBottom: "0.75rem",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Share buttons ────────────────────────────────────────────────────────────
function ShareButtons({
  title,
  vertical = false,
}: {
  title: string;
  vertical?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const btnStyle = {
    width: 34,
    height: 34,
    border: "1px solid rgba(26,26,26,0.12)",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    color: "rgba(26,26,26,0.45)",
  } as const;

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
    (e.currentTarget as HTMLElement).style.color = "var(--color-brand)";
  };
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(26,26,26,0.12)";
    (e.currentTarget as HTMLElement).style.color = "rgba(26,26,26,0.45)";
  };

  return (
    <div
      className={`flex ${vertical ? "flex-col" : "flex-row"} items-center gap-2`}
    >
      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.56rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(26,26,26,0.3)",
          fontWeight: 500,
          writingMode: vertical
            ? ("vertical-rl" as const)
            : ("horizontal-tb" as const),
          transform: vertical ? "rotate(180deg)" : "none",
          marginBottom: vertical ? "0.5rem" : 0,
          marginRight: vertical ? 0 : "0.25rem",
        }}
      >
        Share
      </span>

      {/* Twitter / X */}
      <button
        style={btnStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        title="Share on X"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            "_blank",
          )
        }
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.265 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </button>
      {/* WhatsApp */}
      <button
        style={btnStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        title="Share on WhatsApp"
        onClick={() =>
          window.open(
            `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
            "_blank",
          )
        }
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        style={btnStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        title="Share on LinkedIn"
        onClick={() =>
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank",
          )
        }
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>

      {/* Copy link */}
      <button
        style={{
          ...btnStyle,
          ...(copied
            ? { borderColor: "var(--color-gold)", color: "var(--color-gold)" }
            : {}),
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        title="Copy link"
        onClick={copyLink}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="2"
              >
                <path d="M2 8l4 4 8-8" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="link"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 10a4 4 0 005.66 0l1.42-1.42A4 4 0 007.42 2.94L6 4.36" />
                <path d="M10 6a4 4 0 00-5.66 0L2.93 7.42A4 4 0 008.6 13.06L10 11.64" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

// ─── Sticky sidebar ───────────────────────────────────────────────────────────
function StickySidebar({
  title,
  readTime,
  views,
  publishedAt,
}: {
  title: string;
  readTime: number;
  views: number;
  publishedAt: string | null;
}) {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const h = el.scrollHeight - el.clientHeight;
      setScrollPct(h > 0 ? Math.round((el.scrollTop / h) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="hidden lg:flex flex-col items-center gap-6 pt-2"
      style={{
        position: "sticky",
        top: "calc(var(--nav-height) + 2rem)",
        alignSelf: "flex-start",
      }}
    >
      {/* Reading progress circle */}
      <div style={{ position: "relative", width: 40, height: 40 }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="rgba(26,26,26,0.08)"
            strokeWidth="2"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="var(--color-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - scrollPct / 100)}`}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            fontSize: "0.5rem",
            fontWeight: 600,
            color: "rgba(26,26,26,0.45)",
          }}
        >
          {scrollPct}%
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "rgba(26,26,26,0.1)" }} />

      {/* Share */}
      <ShareButtons title={title} vertical />

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "rgba(26,26,26,0.1)" }} />

      {/* Stats */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.58rem",
              fontWeight: 600,
              color: "rgba(26,26,26,0.55)",
            }}
          >
            {readTime}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.5rem",
              letterSpacing: "0.1em",
              color: "rgba(26,26,26,0.28)",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            min
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.58rem",
              fontWeight: 600,
              color: "rgba(26,26,26,0.55)",
            }}
          >
            {views > 999 ? `${(views / 1000).toFixed(1)}k` : views}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.5rem",
              letterSpacing: "0.1em",
              color: "rgba(26,26,26,0.28)",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            views
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Related card ─────────────────────────────────────────────────────────────
function RelatedCard({
  slug,
  coverImage,
  title,
  category,
  excerpt,
  publishedAt,
  readTime,
  author,
}: {
  slug: string;
  coverImage: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string | null;
  readTime: number;
  author: { name: string; avatar?: string };
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/blog/${slug}`}
      className="no-underline block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden mb-4"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{
            transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(26,26,26,0.2)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s",
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.56rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              background: "var(--color-gold)",
              color: "var(--color-ink)",
              padding: "2px 8px",
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Author + date */}
      <div className="flex items-center gap-2 mb-2.5">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "white", fontSize: "0.48rem" }}>
              {author.name.charAt(0)}
            </span>
          </div>
        )}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            color: "rgba(26,26,26,0.38)",
            fontWeight: 500,
          }}
        >
          {author.name}
        </span>
        <span style={{ color: "rgba(26,26,26,0.18)" }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            color: "rgba(26,26,26,0.32)",
          }}
        >
          {formatDateShort(publishedAt)}
        </span>
        <span style={{ color: "rgba(26,26,26,0.18)" }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            color: "rgba(26,26,26,0.32)",
          }}
        >
          {readTime} min
        </span>
      </div>

      {/* Title */}
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
          lineHeight: 1.2,
          color: hovered ? "var(--color-brand)" : "var(--color-ink)",
          margin: "0 0 0.5rem",
          transition: "color 0.2s",
        }}
      >
        {title}
      </h4>

      {/* Excerpt */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "0.8rem",
          lineHeight: 1.65,
          color: "rgba(26,26,26,0.45)",
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {excerpt}
      </p>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useGetPostBySlugQuery(slug ?? "", {
    skip: !slug,
  });
  const { data: relatedData } = useGetAllPostsQuery({ limit: 6 });

  const post = data?.data;
  const related = (relatedData?.data?.posts ?? [])
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading)
    return (
      <>
        <ReadingProgress />
        <PostSkeleton />
      </>
    );

  if (isError || !post) {
    return (
      <div
        style={{
          background: "var(--color-bg)",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center" style={{ maxWidth: 400, padding: "2rem" }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: "1px solid rgba(26,26,26,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="rgba(26,26,26,0.25)"
              strokeWidth="1"
            >
              <rect x="1" y="1" width="20" height="20" />
              <line x1="8" y1="8" x2="14" y2="14" />
              <line x1="14" y1="8" x2="8" y2="14" />
            </svg>
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "1.4rem",
              color: "rgba(26,26,26,0.35)",
              margin: "0 0 0.5rem",
            }}
          >
            Article not found
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "rgba(26,26,26,0.3)",
              margin: "0 0 1.75rem",
            }}
          >
            This article may have been moved or removed.
          </p>
          <button
            onClick={() => navigate("/blog")}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
              background: "var(--color-brand)",
              color: "white",
              border: "none",
              padding: "0.8rem 1.75rem",
              cursor: "pointer",
              transition: "filter 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.filter =
                "brightness(1.1)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")
            }
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title} — FORMA</title>
        <meta
          name="description"
          content={post.metaDescription || post.excerpt}
        />
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta
          property="og:description"
          content={post.metaDescription || post.excerpt}
        />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:type" content="article" />
      </Helmet>

      <ReadingProgress />

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/6", maxHeight: 560 }}
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.03)", transition: "transform 8s ease" }}
          onLoad={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26,26,26,0.1) 0%, rgba(26,26,26,0.65) 100%)",
          }}
        />

        {/* Hero text overlay — category + title */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-main pb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  background: "var(--color-gold)",
                  color: "var(--color-ink)",
                  padding: "3px 11px",
                  display: "inline-block",
                  marginBottom: "0.85rem",
                }}
              >
                {post.category}
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(1.6rem, 4vw, 3.5rem)",
                  lineHeight: 1.08,
                  color: "white",
                  margin: 0,
                  maxWidth: "18ch",
                  textShadow: "0 2px 20px rgba(26,26,26,0.4)",
                }}
              >
                {post.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Article body ── */}
      <div style={{ background: "var(--color-bg)" }}>
        <div
          className="container-main"
          style={{ maxWidth: 1100, paddingTop: "3rem", paddingBottom: "5rem" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* ── Left sidebar: sticky share + progress ── */}
            <div className="lg:col-span-1">
              <StickySidebar
                title={post.title}
                readTime={post.readTime}
                views={post.views}
                publishedAt={post.publishedAt}
              />
            </div>

            {/* ── Main content ── */}
            <div className="lg:col-span-8">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="flex items-center gap-2 mb-8"
              >
                <Link
                  to="/"
                  className="no-underline"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,26,0.3)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(26,26,26,0.3)")
                  }
                >
                  Home
                </Link>
                <span style={{ color: "rgba(26,26,26,0.18)" }}>›</span>
                <Link
                  to="/blog"
                  className="no-underline"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,26,0.3)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(26,26,26,0.3)")
                  }
                >
                  Journal
                </Link>
                <span style={{ color: "rgba(26,26,26,0.18)" }}>›</span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                  }}
                >
                  {post.category}
                </span>
              </motion.div>

              {/* Author + meta row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 mb-8 pb-7"
                style={{ borderBottom: "1px solid rgba(26,26,26,0.08)" }}
              >
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--color-brand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        margin: 0,
                      }}
                    >
                      {post.author.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.62rem",
                        color: "rgba(26,26,26,0.35)",
                        margin: 0,
                      }}
                    >
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  {/* Read time */}
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="rgba(26,26,26,0.3)"
                      strokeWidth="1.5"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3l2 2" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.7rem",
                        color: "rgba(26,26,26,0.38)",
                      }}
                    >
                      {post.readTime} min read
                    </span>
                  </div>
                  <span style={{ color: "rgba(26,26,26,0.15)" }}>·</span>
                  {/* Views */}
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="rgba(26,26,26,0.3)"
                      strokeWidth="1.5"
                    >
                      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
                      <circle cx="8" cy="8" r="2" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.7rem",
                        color: "rgba(26,26,26,0.38)",
                      }}
                    >
                      {post.views.toLocaleString()} views
                    </span>
                  </div>

                  {/* Mobile share */}
                  <div className="lg:hidden">
                    <ShareButtons title={post.title} />
                  </div>
                </div>
              </motion.div>

              {/* Excerpt — styled as a lead paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                  lineHeight: 1.75,
                  color: "rgba(26,26,26,0.65)",
                  margin: "0 0 2.5rem",
                  paddingLeft: "1.25rem",
                  borderLeft: "3px solid var(--color-gold)",
                }}
              >
                {post.excerpt}
              </motion.p>

              {/* Article content */}
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.38 }}
                className="blog-content"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "clamp(0.93rem, 1.1vw, 1.06rem)",
                  lineHeight: 1.9,
                  color: "rgba(26,26,26,0.72)",
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-12 pt-8"
                  style={{ borderTop: "1px solid rgba(26,26,26,0.07)" }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.32)",
                      fontWeight: 500,
                      margin: "0 0 0.75rem",
                    }}
                  >
                    Tagged
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${tag}`}
                        className="no-underline"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.7rem",
                          color: "rgba(26,26,26,0.48)",
                          padding: "5px 12px",
                          border: "1px solid rgba(26,26,26,0.1)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "var(--color-gold)";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--color-brand)";
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(201,168,76,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "rgba(26,26,26,0.1)";
                          (e.currentTarget as HTMLElement).style.color =
                            "rgba(26,26,26,0.48)";
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                        }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Author card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mt-12 p-6 flex items-start gap-5"
                style={{
                  background: "rgba(26,60,94,0.04)",
                  border: "1px solid rgba(26,26,26,0.07)",
                }}
              >
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontFamily: "var(--font-display)",
                        fontWeight: 300,
                        fontSize: "1.3rem",
                      }}
                    >
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--color-gold)",
                      fontWeight: 500,
                      margin: "0 0 0.3rem",
                    }}
                  >
                    Written by
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--color-ink)",
                      margin: "0 0 0.4rem",
                    }}
                  >
                    {post.author.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      fontSize: "0.78rem",
                      lineHeight: 1.65,
                      color: "rgba(26,26,26,0.45)",
                      margin: 0,
                    }}
                  >
                    Architect and writer at FORMA Studio. Writing on the
                    intersection of design, culture, and the built environment.
                  </p>
                </div>
              </motion.div>

              {/* Back + share row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-10">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 no-underline group"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.63rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: "rgba(26,26,26,0.38)",
                    borderBottom: "1px solid rgba(26,26,26,0.12)",
                    paddingBottom: 2,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-brand)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(26,26,26,0.38)")
                  }
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="group-hover:-translate-x-0.5 transition-transform duration-200"
                  >
                    <path d="M13 8H3M7 12l-4-4 4-4" />
                  </svg>
                  Back to Journal
                </Link>
                <ShareButtons title={post.title} />
              </div>
            </div>

            {/* ── Right sidebar: category + related mini list ── */}
            <div className="hidden lg:block lg:col-span-3">
              <div
                style={{
                  position: "sticky",
                  top: "calc(var(--nav-height) + 2rem)",
                  alignSelf: "flex-start",
                }}
              >
                {/* Category pill */}
                <div className="mb-8">
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.56rem",
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.35)",
                      fontWeight: 500,
                      margin: "0 0 0.6rem",
                    }}
                  >
                    Filed under
                  </p>
                  <Link
                    to={`/blog?category=${post.category}`}
                    className="no-underline inline-block"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      background: "var(--color-brand)",
                      color: "white",
                      padding: "6px 16px",
                      transition: "filter 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.filter =
                        "brightness(1.12)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.filter =
                        "brightness(1)")
                    }
                  >
                    {post.category}
                  </Link>
                </div>

                {/* Read time + date */}
                <div
                  className="mb-8 flex flex-col gap-3"
                  style={{
                    padding: "1rem",
                    background: "rgba(26,26,26,0.03)",
                    border: "1px solid rgba(26,26,26,0.07)",
                  }}
                >
                  {[
                    { label: "Published", value: formatDate(post.publishedAt) },
                    { label: "Read time", value: `${post.readTime} minutes` },
                    { label: "Views", value: post.views.toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.54rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(26,26,26,0.28)",
                          fontWeight: 500,
                          margin: "0 0 0.2rem",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: "var(--color-ink)",
                          margin: 0,
                          fontWeight: 400,
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* More from this category */}
                {related.filter((r) => r.category === post.category).length >
                  0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        style={{
                          width: 3,
                          height: 12,
                          background: "var(--color-gold)",
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.56rem",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: "rgba(26,26,26,0.38)",
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        More in {post.category}
                      </p>
                    </div>
                    {related
                      .filter((r) => r.category === post.category)
                      .slice(0, 2)
                      .map((r) => (
                        <Link
                          key={r._id}
                          to={`/blog/${r.slug}`}
                          className="no-underline block mb-4 group"
                        >
                          <div className="flex gap-3 items-start">
                            <div
                              className="overflow-hidden shrink-0"
                              style={{ width: 56, height: 42 }}
                            >
                              <img
                                src={r.coverImage}
                                alt={r.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                style={{ transition: "transform 0.5s ease" }}
                                onMouseEnter={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.transform = "scale(1.08)")
                                }
                                onMouseLeave={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.transform = "scale(1)")
                                }
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "0.75rem",
                                  fontWeight: 400,
                                  lineHeight: 1.4,
                                  color: "rgba(26,26,26,0.68)",
                                  margin: "0 0 0.2rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.color = "var(--color-brand)")
                                }
                                onMouseLeave={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.color = "rgba(26,26,26,0.68)")
                                }
                              >
                                {r.title}
                              </p>
                              <p
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "0.6rem",
                                  color: "rgba(26,26,26,0.28)",
                                  margin: 0,
                                }}
                              >
                                {r.readTime} min
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related posts ── */}
      {related.length > 0 && (
        <div
          style={{
            background: "rgba(26,26,26,0.025)",
            borderTop: "1px solid rgba(26,26,26,0.07)",
          }}
        >
          <div className="container-main py-16 md:py-20">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
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
                    fontWeight: 600,
                  }}
                >
                  Further Reading
                </span>
              </div>
              <Link
                to="/blog"
                className="no-underline inline-flex items-center gap-2 group"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: "rgba(26,26,26,0.38)",
                  borderBottom: "1px solid rgba(26,26,26,0.12)",
                  paddingBottom: 2,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-brand)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(26,26,26,0.38)")
                }
              >
                All Articles
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {related.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                >
                  <RelatedCard
                    slug={p.slug}
                    coverImage={p.coverImage}
                    title={p.title}
                    category={p.category}
                    excerpt={p.excerpt}
                    publishedAt={p.publishedAt}
                    readTime={p.readTime}
                    author={p.author}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
