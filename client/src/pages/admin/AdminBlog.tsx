import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAdminPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUpdatePostStatusMutation,
  useToggleFeaturedMutation,
} from "@/services/blogApi";
import type {
  BlogPost,
  BlogPostSummary,
  BlogStatus,
  CreateBlogPayload,
  UpdateBlogPayload,
} from "@/services/blogApi";

// ─── Types ────────────────────────────────────────────────────────────────────
type TextBlock = { id: string; type: "text"; value: string };
type ImageBlock = {
  id: string;
  type: "image";
  file: File | null;
  preview: string;
  caption: string;
};
type ContentBlock = TextBlock | ImageBlock;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Serialise blocks → HTML string for the backend */
function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "text") {
        return b.value
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");
      }
      if (b.type === "image") {
        const src = b.preview || "";
        const cap = b.caption ? `<figcaption>${b.caption}</figcaption>` : "";
        return `<figure><img src="${src}" alt="${b.caption || ""}" />${cap}</figure>`;
      }
      return "";
    })
    .join("");
}

/** Parse an HTML string back into blocks (for edit mode) */
function htmlToBlocks(html: string): ContentBlock[] {
  if (!html) return [{ id: uid(), type: "text", value: "" }];
  const blocks: ContentBlock[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let textBuf = "";

  doc.body.childNodes.forEach((node) => {
    if (node.nodeName === "FIGURE") {
      if (textBuf.trim()) {
        blocks.push({ id: uid(), type: "text", value: textBuf.trim() });
        textBuf = "";
      }
      const img = (node as Element).querySelector("img");
      const cap = (node as Element).querySelector("figcaption");
      blocks.push({
        id: uid(),
        type: "image",
        file: null,
        preview: img?.getAttribute("src") ?? "",
        caption: cap?.textContent ?? "",
      });
    } else {
      textBuf += (node as Element).textContent + "\n\n";
    }
  });

  if (textBuf.trim())
    blocks.push({ id: uid(), type: "text", value: textBuf.trim() });
  if (blocks.length === 0) blocks.push({ id: uid(), type: "text", value: "" });
  return blocks;
}

const STATUS_COLORS: Record<
  BlogStatus,
  { bg: string; color: string; dot: string }
> = {
  published: {
    bg: "rgba(34,197,94,0.1)",
    color: "rgb(22,163,74)",
    dot: "#16a34a",
  },
  draft: { bg: "rgba(234,179,8,0.1)", color: "rgb(161,98,7)", dot: "#ca8a04" },
  archived: {
    bg: "rgba(107,114,128,0.12)",
    color: "rgb(75,85,99)",
    dot: "#6b7280",
  },
};

const CATEGORIES = [
  "Architecture",
  "Interiors",
  "Urbanism",
  "Sustainability",
  "Materials",
  "Technology",
  "Culture",
  "Process",
  "Other",
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BlogStatus }) {
  const { bg, color, dot } = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "var(--font-body)",
        fontSize: "0.6rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 600,
        background: bg,
        color,
        padding: "3px 9px",
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          background: "white",
          padding: "2rem",
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "1.4rem",
            color: "var(--color-ink)",
            margin: "0 0 0.75rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "rgba(26,26,26,0.55)",
            margin: "0 0 1.75rem",
            lineHeight: 1.65,
          }}
        >
          {message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "0.75rem",
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
            Delete
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "transparent",
              color: "rgba(26,26,26,0.55)",
              border: "1px solid rgba(26,26,26,0.15)",
              padding: "0.75rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Block editor ─────────────────────────────────────────────────────────────
function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingInsertAfter, setPendingInsertAfter] = useState<string | null>(
    null,
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<ContentBlock>) => {
      onChange(
        blocks.map((b) =>
          b.id === id ? ({ ...b, ...patch } as ContentBlock) : b,
        ),
      );
    },
    [blocks, onChange],
  );

  const removeBlock = useCallback(
    (id: string) => {
      const next = blocks.filter((b) => b.id !== id);
      onChange(next.length ? next : [{ id: uid(), type: "text", value: "" }]);
    },
    [blocks, onChange],
  );

  const addTextAfter = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      const next = [...blocks];
      next.splice(idx + 1, 0, { id: uid(), type: "text", value: "" });
      onChange(next);
    },
    [blocks, onChange],
  );

  const addImageAfter = useCallback((id: string) => {
    setPendingInsertAfter(id);
    fileInputRef.current?.click();
  }, []);

  const handleFileChosen = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !pendingInsertAfter) return;
      const preview = URL.createObjectURL(file);
      const idx = blocks.findIndex((b) => b.id === pendingInsertAfter);
      const newBlock: ImageBlock = {
        id: uid(),
        type: "image",
        file,
        preview,
        caption: "",
      };
      const next = [...blocks];
      next.splice(idx + 1, 0, newBlock);
      onChange(next);
      setPendingInsertAfter(null);
      e.target.value = "";
    },
    [blocks, onChange, pendingInsertAfter],
  );

  const moveBlock = useCallback(
    (id: string, dir: -1 | 1) => {
      const idx = blocks.findIndex((b) => b.id === id);
      const next = [...blocks];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return;
      [next[idx], next[target]] = [next[target], next[idx]];
      onChange(next);
    },
    [blocks, onChange],
  );

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.58rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(26,26,26,0.4)",
    fontWeight: 500,
    display: "block",
    marginBottom: "0.35rem",
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChosen}
      />

      {blocks.map((block, i) => (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            border: "1px solid rgba(26,26,26,0.1)",
            background: "white",
            position: "relative",
          }}
        >
          {/* Block type indicator */}
          <div
            style={{
              padding: "0.55rem 0.85rem",
              borderBottom: "1px solid rgba(26,26,26,0.07)",
              background: "rgba(26,26,26,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="flex items-center gap-2">
              {/* Block type icon */}
              {block.type === "text" ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="rgba(26,26,26,0.4)"
                  strokeWidth="1.5"
                >
                  <path d="M2 4h12M2 8h8M2 12h10" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="rgba(26,26,26,0.4)"
                  strokeWidth="1.5"
                >
                  <rect x="1" y="1" width="14" height="14" rx="1" />
                  <circle cx="5.5" cy="5.5" r="1.5" />
                  <path d="M1 11l4-4 3 3 2-2 5 5" />
                </svg>
              )}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.56rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(26,26,26,0.35)",
                  fontWeight: 500,
                }}
              >
                {block.type === "text"
                  ? `Text Block ${i + 1}`
                  : `Image Block ${i + 1}`}
              </span>
            </div>

            {/* Block controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(block.id, -1)}
                disabled={i === 0}
                style={{
                  background: "none",
                  border: "none",
                  cursor: i === 0 ? "default" : "pointer",
                  color: i === 0 ? "rgba(26,26,26,0.15)" : "rgba(26,26,26,0.4)",
                  padding: "2px 4px",
                  display: "flex",
                }}
                title="Move up"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M8 12V4M4 8l4-4 4 4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveBlock(block.id, 1)}
                disabled={i === blocks.length - 1}
                style={{
                  background: "none",
                  border: "none",
                  cursor: i === blocks.length - 1 ? "default" : "pointer",
                  color:
                    i === blocks.length - 1
                      ? "rgba(26,26,26,0.15)"
                      : "rgba(26,26,26,0.4)",
                  padding: "2px 4px",
                  display: "flex",
                }}
                title="Move down"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M8 4v8M4 8l4 4 4-4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                disabled={blocks.length === 1}
                style={{
                  background: "none",
                  border: "none",
                  cursor: blocks.length === 1 ? "default" : "pointer",
                  color:
                    blocks.length === 1
                      ? "rgba(26,26,26,0.15)"
                      : "rgba(220,38,38,0.5)",
                  padding: "2px 4px",
                  display: "flex",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (blocks.length > 1)
                    (e.currentTarget as HTMLElement).style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(220,38,38,0.5)";
                }}
                title="Remove block"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
          </div>

          {/* Block content */}
          <div style={{ padding: "0.75rem" }}>
            {block.type === "text" ? (
              <textarea
                value={block.value}
                onChange={(e) =>
                  updateBlock(block.id, { value: e.target.value })
                }
                placeholder="Write your content here… Use double line breaks for new paragraphs."
                rows={6}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.88rem",
                  lineHeight: 1.75,
                  color: "var(--color-ink)",
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  background: "transparent",
                  boxSizing: "border-box" as const,
                }}
              />
            ) : (
              <div>
                {block.preview ? (
                  <div className="relative">
                    <img
                      src={block.preview}
                      alt="block preview"
                      style={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "cover",
                        display: "block",
                        marginBottom: "0.6rem",
                        border: "1px solid rgba(26,26,26,0.08)",
                      }}
                    />
                    <button
                      onClick={() => {
                        setPendingInsertAfter(
                          blocks[Math.max(0, i - 1)]?.id ?? block.id,
                        );
                        // Replace this block's image
                        const inp = document.createElement("input");
                        inp.type = "file";
                        inp.accept = "image/*";
                        inp.onchange = (ev) => {
                          const f = (ev.target as HTMLInputElement).files?.[0];
                          if (!f) return;
                          updateBlock(block.id, {
                            file: f,
                            preview: URL.createObjectURL(f),
                          });
                        };
                        inp.click();
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontFamily: "var(--font-body)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                        background: "rgba(255,255,255,0.92)",
                        color: "rgba(26,26,26,0.6)",
                        border: "1px solid rgba(26,26,26,0.15)",
                        padding: "4px 10px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "white")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.92)")
                      }
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <div
                      style={{
                        border: "2px dashed rgba(26,26,26,0.1)",
                        padding: "2.5rem",
                        textAlign: "center",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--color-brand)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(26,26,26,0.1)")
                      }
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 28 28"
                        fill="none"
                        stroke="rgba(26,26,26,0.25)"
                        strokeWidth="1.2"
                        style={{ display: "block", margin: "0 auto 0.6rem" }}
                      >
                        <rect x="1" y="1" width="26" height="26" rx="1" />
                        <circle cx="9" cy="9" r="3" />
                        <path d="M1 20l8-8 4 4 4-4 10 10" />
                      </svg>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: "rgba(26,26,26,0.38)",
                          margin: "0 0 0.25rem",
                        }}
                      >
                        Click to upload an image
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.62rem",
                          color: "rgba(26,26,26,0.25)",
                          margin: 0,
                        }}
                      >
                        JPG, PNG, WebP — max 10 MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        updateBlock(block.id, {
                          file: f,
                          preview: URL.createObjectURL(f),
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                {/* Caption */}
                <div style={{ marginTop: "0.5rem" }}>
                  <span style={labelStyle}>Caption (optional)</span>
                  <input
                    value={(block as ImageBlock).caption}
                    onChange={(e) =>
                      updateBlock(block.id, { caption: e.target.value })
                    }
                    placeholder="Describe this image…"
                    style={{
                      width: "100%",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.78rem",
                      color: "var(--color-ink)",
                      background: "rgba(26,26,26,0.03)",
                      border: "1px solid rgba(26,26,26,0.1)",
                      padding: "0.5rem 0.7rem",
                      outline: "none",
                      boxSizing: "border-box" as const,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Insert buttons — appear between blocks */}
          <div className="flex items-center gap-2 px-3 pb-2.5">
            <div
              style={{ flex: 1, height: 1, background: "rgba(26,26,26,0.06)" }}
            />
            <button
              type="button"
              onClick={() => addTextAfter(block.id)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.55rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 500,
                background: "transparent",
                border: "1px solid rgba(26,26,26,0.1)",
                color: "rgba(26,26,26,0.4)",
                padding: "3px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-brand)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-brand)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(26,26,26,0.1)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(26,26,26,0.4)";
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M8 2v12M2 8h12" />
              </svg>
              Text
            </button>
            <button
              type="button"
              onClick={() => addImageAfter(block.id)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.55rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 500,
                background: "transparent",
                border: "1px solid rgba(26,26,26,0.1)",
                color: "rgba(26,26,26,0.4)",
                padding: "3px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-gold)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(26,26,26,0.1)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(26,26,26,0.4)";
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M8 2v12M2 8h12" />
              </svg>
              Image
            </button>
            <div
              style={{ flex: 1, height: 1, background: "rgba(26,26,26,0.06)" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Blog form modal ──────────────────────────────────────────────────────────
function BlogFormModal({
  post,
  onClose,
}: {
  post: BlogPostSummary | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(post);
  const [createPost, { isLoading: creating }] = useCreatePostMutation();
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation();

  const [form, setForm] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    category: post?.category ?? "",
    tags: post?.tags.join(", ") ?? "",
    status: (post?.status ?? "draft") as BlogStatus,
    isFeatured: post?.isFeatured ?? false,
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
  });

  // Blocks — initialise from existing HTML or with a single empty text block
  const [blocks, setBlocks] = useState<ContentBlock[]>(() =>
    htmlToBlocks((post as BlogPost)?.content ?? ""),
  );

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(post?.coverImage ?? "");
  const [activeTab, setActiveTab] = useState<"content" | "meta">("content");
  const [error, setError] = useState("");

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const htmlContent = blocksToHtml(blocks);
    if (!htmlContent.trim()) {
      setError("Content cannot be empty.");
      return;
    }

    // ✅ Explicit guard — don't rely on HTML required or TypeScript !
    if (!isEdit && !coverFile && !coverPreview) {
      setError("Cover image is required.");
      return;
    }

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // ✅ Build payload cleanly — coverImage only included if there's a file
    const payload: CreateBlogPayload | UpdateBlogPayload = {
      title: form.title,
      excerpt: form.excerpt,
      content: htmlContent,
      category: form.category,
      tags: tagsArray,
      status: form.status,
      isFeatured: form.isFeatured,

      // ✅ After
      metaTitle: (form.metaTitle || form.title).slice(0, 70),
      metaDescription: (form.metaDescription || form.excerpt).slice(0, 160),
      ...(coverFile ? { coverImage: coverFile } : {}), // only append if file exists
    };

    try {
      if (isEdit && post) {
        await updatePost({
          id: post._id,
          data: payload as UpdateBlogPayload,
        }).unwrap();
      } else {
        // ✅ No more coverFile! — payload already has it via the spread above
        await createPost(payload as CreateBlogPayload).unwrap();
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong";
      setError(msg);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    color: "var(--color-ink)",
    background: "white",
    border: "1px solid rgba(26,26,26,0.12)",
    padding: "0.6rem 0.85rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.58rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(26,26,26,0.42)",
    fontWeight: 500,
    display: "block",
    marginBottom: "0.4rem",
  };

  const isBusy = creating || updating;
  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-body)",
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: active ? 600 : 400,
    color: active ? "var(--color-brand)" : "rgba(26,26,26,0.4)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.75rem 1.25rem",
    borderBottom: active
      ? "2px solid var(--color-gold)"
      : "2px solid transparent",
    transition: "all 0.18s",
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div className="min-h-full flex items-start justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            background: "var(--color-bg)",
            width: "100%",
            maxWidth: 820,
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}
        >
          {/* Modal header */}
          <div
            className="flex items-center justify-between px-7 py-5"
            style={{ borderBottom: "1px solid rgba(26,26,26,0.08)" }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "1.5rem",
                  color: "var(--color-ink)",
                  margin: 0,
                }}
              >
                {isEdit ? "Edit Post" : "New Post"}
              </h2>
              {form.title && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    color: "rgba(26,26,26,0.38)",
                    margin: "0.2rem 0 0",
                  }}
                >
                  {form.title}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(26,26,26,0.06)",
                border: "none",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(26,26,26,0.5)",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(26,26,26,0.12)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(26,26,26,0.06)")
              }
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              borderBottom: "1px solid rgba(26,26,26,0.08)",
              paddingLeft: "1.75rem",
              display: "flex",
            }}
          >
            <button
              type="button"
              style={tabStyle(activeTab === "content")}
              onClick={() => setActiveTab("content")}
            >
              Content
            </button>
            <button
              type="button"
              style={tabStyle(activeTab === "meta")}
              onClick={() => setActiveTab("meta")}
            >
              SEO & Settings
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ padding: "1.75rem 1.75rem 1.25rem" }}>
              {activeTab === "content" && (
                <div className="flex flex-col gap-5">
                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                      style={{
                        ...inputStyle,
                        fontSize: "1rem",
                        fontWeight: 500,
                        padding: "0.7rem 0.9rem",
                      }}
                      placeholder="Post title"
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--color-brand)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(26,26,26,0.12)")
                      }
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label style={labelStyle}>
                      Excerpt *{" "}
                      <span
                        style={{
                          color: "rgba(26,26,26,0.3)",
                          fontWeight: 400,
                          letterSpacing: 0,
                          textTransform: "none",
                        }}
                      >
                        — shown in listing pages
                      </span>
                    </label>
                    <textarea
                      value={form.excerpt}
                      rows={2}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, excerpt: e.target.value }))
                      }
                      required
                      style={{ ...inputStyle, resize: "none" }}
                      placeholder="A short summary of this article…"
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--color-brand)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(26,26,26,0.12)")
                      }
                    />
                  </div>

                  {/* Category + Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Category *</label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        required
                        style={{ ...inputStyle, background: "white" }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-brand)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(26,26,26,0.12)")
                        }
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Tags{" "}
                        <span
                          style={{
                            color: "rgba(26,26,26,0.3)",
                            fontWeight: 400,
                            letterSpacing: 0,
                            textTransform: "none",
                          }}
                        >
                          comma-separated
                        </span>
                      </label>
                      <input
                        value={form.tags}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, tags: e.target.value }))
                        }
                        style={inputStyle}
                        placeholder="design, urban, sustainability"
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-brand)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(26,26,26,0.12)")
                        }
                      />
                    </div>
                  </div>

                  {/* Cover image */}
                  <div>
                    <label style={labelStyle}>
                      Cover Image {!isEdit && "*"}
                    </label>
                    <div className="flex gap-4 items-center">
                      {coverPreview && (
                        <img
                          src={coverPreview}
                          alt="cover preview"
                          style={{
                            width: 96,
                            height: 64,
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid rgba(26,26,26,0.1)",
                          }}
                        />
                      )}
                      <label style={{ flex: 1, cursor: "pointer" }}>
                        <div
                          style={{
                            border: "1px dashed rgba(26,26,26,0.15)",
                            padding: "0.7rem 1rem",
                            textAlign: "center",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "var(--color-brand)";
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(26,60,94,0.02)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(26,26,26,0.15)";
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.72rem",
                              color: "rgba(26,26,26,0.45)",
                              margin: 0,
                            }}
                          >
                            {coverPreview
                              ? "Click to replace cover image"
                              : "Click to upload cover image"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          required={!isEdit && !coverPreview}
                          onChange={handleCoverChange}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Status + Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Status</label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            status: e.target.value as BlogStatus,
                          }))
                        }
                        style={{ ...inputStyle, background: "white" }}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <div
                        onClick={() =>
                          setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))
                        }
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 10,
                          background: form.isFeatured
                            ? "var(--color-gold)"
                            : "rgba(26,26,26,0.15)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 3,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "white",
                            left: form.isFeatured ? 19 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.78rem",
                          color: "rgba(26,26,26,0.6)",
                          userSelect: "none",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))
                        }
                      >
                        Mark as Featured
                      </span>
                    </div>
                  </div>

                  {/* ── Block content editor ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <label style={{ ...labelStyle, margin: 0 }}>
                        Article Content *
                      </label>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.6rem",
                          color: "rgba(26,26,26,0.3)",
                          fontStyle: "italic",
                        }}
                      >
                        Mix text and images in any order
                      </span>
                    </div>

                    <BlockEditor blocks={blocks} onChange={setBlocks} />
                  </div>
                </div>
              )}

              {activeTab === "meta" && (
                <div className="flex flex-col gap-5">
                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(26,60,94,0.03)",
                      border: "1px solid rgba(26,26,26,0.07)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.72rem",
                        color: "rgba(26,26,26,0.45)",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      SEO fields are optional. If left blank they fall back to
                      the post title and excerpt.
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Meta Title
                      <span
                        style={{
                          color: "rgba(26,26,26,0.3)",
                          fontWeight: 400,
                          letterSpacing: 0,
                          textTransform: "none",
                        }}
                      >
                        {" "}
                        — max 70 chars
                      </span>
                    </label>
                    <input
                      value={form.metaTitle}
                      maxLength={70}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, metaTitle: e.target.value }))
                      }
                      style={inputStyle}
                      placeholder={form.title || "Post title"}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--color-brand)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(26,26,26,0.12)")
                      }
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6rem",
                        color:
                          form.metaTitle.length > 60
                            ? "#dc2626"
                            : "rgba(26,26,26,0.3)",
                        margin: "0.3rem 0 0",
                        textAlign: "right",
                      }}
                    >
                      {form.metaTitle.length} / 70
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Meta Description
                      <span
                        style={{
                          color: "rgba(26,26,26,0.3)",
                          fontWeight: 400,
                          letterSpacing: 0,
                          textTransform: "none",
                        }}
                      >
                        {" "}
                        — max 160 chars
                      </span>
                    </label>
                    <textarea
                      value={form.metaDescription}
                      rows={3}
                      maxLength={160}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          metaDescription: e.target.value,
                        }))
                      }
                      style={{ ...inputStyle, resize: "none" }}
                      placeholder={
                        form.excerpt || "Short description for search engines…"
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--color-brand)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(26,26,26,0.12)")
                      }
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6rem",
                        color:
                          form.metaDescription.length > 145
                            ? "#dc2626"
                            : "rgba(26,26,26,0.3)",
                        margin: "0.3rem 0 0",
                        textAlign: "right",
                      }}
                    >
                      {form.metaDescription.length} / 160
                    </p>
                  </div>

                  {/* Search preview */}
                  <div
                    style={{
                      border: "1px solid rgba(26,26,26,0.1)",
                      padding: "1rem",
                      background: "white",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.56rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(26,26,26,0.3)",
                        fontWeight: 500,
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Search Preview
                    </p>
                    <p
                      style={{
                        fontFamily: "arial, sans-serif",
                        fontSize: "1.1rem",
                        color: "#1a0dab",
                        margin: "0 0 0.2rem",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {form.metaTitle || form.title || "Post Title"}
                    </p>
                    <p
                      style={{
                        fontFamily: "arial, sans-serif",
                        fontSize: "0.82rem",
                        color: "#188038",
                        margin: "0 0 0.2rem",
                      }}
                    >
                      forma-studio.com/blog/
                      {form.title?.toLowerCase().replace(/\s+/g, "-") ||
                        "post-slug"}
                    </p>
                    <p
                      style={{
                        fontFamily: "arial, sans-serif",
                        fontSize: "0.82rem",
                        color: "#4d5156",
                        margin: 0,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {form.metaDescription ||
                        form.excerpt ||
                        "Post excerpt will appear here."}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    color: "#dc2626",
                    padding: "0.65rem 1rem",
                    marginTop: "1rem",
                    background: "rgba(220,38,38,0.06)",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 px-7 py-4"
              style={{
                borderTop: "1px solid rgba(26,26,26,0.08)",
                background: "rgba(26,26,26,0.02)",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  background: "transparent",
                  color: "rgba(26,26,26,0.42)",
                  border: "1px solid rgba(26,26,26,0.12)",
                  padding: "0.7rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.62rem",
                    color: "rgba(26,26,26,0.3)",
                  }}
                >
                  {blocks.length} {blocks.length === 1 ? "block" : "blocks"} ·{" "}
                  {blocks.filter((b) => b.type === "image").length} image
                  {blocks.filter((b) => b.type === "image").length !== 1
                    ? "s"
                    : ""}
                </span>
                <button
                  type="submit"
                  disabled={isBusy}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    background: isBusy
                      ? "rgba(26,60,94,0.45)"
                      : "var(--color-brand)",
                    color: "white",
                    border: "none",
                    padding: "0.7rem 2rem",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    transition: "filter 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    if (!isBusy)
                      (e.currentTarget as HTMLElement).style.filter =
                        "brightness(1.1)";
                  }}
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.filter =
                      "brightness(1)")
                  }
                >
                  {isBusy && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "linear",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M8 2a6 6 0 106 6" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                  {isBusy
                    ? "Saving…"
                    : isEdit
                      ? "Save Changes"
                      : "Publish Post"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main AdminBlog ───────────────────────────────────────────────────────────
export default function AdminBlog() {
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "">("");
  const [page, setPage] = useState(1);
  const [editPost, setEditPost] = useState<BlogPostSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostSummary | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);

  const params = {
    page,
    limit: 12,
    ...(statusFilter && { status: statusFilter }),
  };
  const { data, isLoading, isError, refetch } = useGetAdminPostsQuery(params);

  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();
  const [updatePostStatus, { isLoading: toggling }] =
    useUpdatePostStatusMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();

  const posts = data?.data?.posts ?? [];
  const pagination = data?.data?.pagination;

  // Status cycle: draft → published → archived → draft
  async function handleStatusCycle(post: BlogPostSummary) {
    // was BlogPost
    const next: BlogStatus =
      post.status === "draft"
        ? "published"
        : post.status === "published"
          ? "archived"
          : "draft";
    await updatePostStatus({ id: post._id, status: next })
      .unwrap()
      .catch(() => {});
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deletePost(deleteTarget._id)
      .unwrap()
      .catch(() => {});
    setDeleteTarget(null);
  }

  function openCreate() {
    setEditPost(null);
    setShowForm(true);
  }
  function openEdit(p: BlogPostSummary) {
    // was BlogPost
    setEditPost(p as BlogPost); // cast is safe — modal fetches full post if needed
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditPost(null);
  }

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1200 }}>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "2rem",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Blog Posts
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "rgba(26,26,26,0.38)",
              margin: "0.3rem 0 0",
            }}
          >
            {pagination
              ? `${pagination.total} total post${pagination.total !== 1 ? "s" : ""}`
              : "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter pills */}
          <div className="flex items-center gap-1.5">
            {(["", "draft", "published", "archived"] as const).map((s) => {
              const isActive = statusFilter === s;
              const label =
                s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s as BlogStatus | "");
                    setPage(1);
                  }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? "var(--color-brand)" : "transparent",
                    color: isActive ? "white" : "rgba(26,26,26,0.42)",
                    border: `1px solid ${isActive ? "var(--color-brand)" : "rgba(26,26,26,0.1)"}`,
                    padding: "4px 11px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--color-brand)";
                      e.currentTarget.style.borderColor = "var(--color-brand)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(26,26,26,0.42)";
                      e.currentTarget.style.borderColor = "rgba(26,26,26,0.1)";
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openCreate}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
              background: "var(--color-brand)",
              color: "white",
              border: "none",
              padding: "0.6rem 1.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
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
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M8 2v12M2 8h12" />
            </svg>
            New Post
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {isError && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(220,38,38,0.05)",
            border: "1px solid rgba(220,38,38,0.15)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "#dc2626",
              margin: 0,
            }}
          >
            Failed to load posts.
          </p>
          <button
            type="button"
            onClick={refetch}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              background: "none",
              border: "1px solid rgba(220,38,38,0.25)",
              color: "#dc2626",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div
        style={{ border: "1px solid rgba(26,26,26,0.08)", overflow: "hidden" }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "56px minmax(0,1fr) 120px 110px 70px 60px 100px",
            background: "rgba(26,26,26,0.03)",
            borderBottom: "1px solid rgba(26,26,26,0.08)",
            padding: "0.55rem 1rem",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          {[
            "Cover",
            "Title & Excerpt",
            "Category",
            "Status",
            "Views",
            "★",
            "Actions",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.56rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(26,26,26,0.38)",
                fontWeight: 600,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Loading skeleton rows */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "56px minmax(0,1fr) 120px 110px 70px 60px 100px",
                padding: "0.8rem 1rem",
                gap: "0.75rem",
                alignItems: "center",
                borderBottom: "1px solid rgba(26,26,26,0.05)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 34,
                  background: "rgba(26,26,26,0.07)",
                }}
              />
              <div>
                <div
                  style={{
                    width: "55%",
                    height: 10,
                    background: "rgba(26,26,26,0.07)",
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: "80%",
                    height: 8,
                    background: "rgba(26,26,26,0.05)",
                  }}
                />
              </div>
              {[60, 70, 30, 20, 60].map((w, j) => (
                <div
                  key={j}
                  style={{
                    width: w,
                    height: 8,
                    background: "rgba(26,26,26,0.05)",
                  }}
                />
              ))}
            </div>
          ))}

        {/* Empty */}
        {!isLoading && !isError && posts.length === 0 && (
          <div style={{ padding: "3.5rem", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "rgba(26,26,26,0.32)",
                margin: "0 0 1rem",
              }}
            >
              No posts yet.
            </p>
            <button
              type="button"
              onClick={openCreate}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.62rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 500,
                background: "var(--color-brand)",
                color: "white",
                border: "none",
                padding: "0.6rem 1.4rem",
                cursor: "pointer",
              }}
            >
              Create your first post
            </button>
          </div>
        )}

        {/* Data rows */}
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "56px minmax(0,1fr) 120px 110px 70px 60px 100px",
                padding: "0.75rem 1rem",
                gap: "0.75rem",
                alignItems: "center",
                borderBottom: "1px solid rgba(26,26,26,0.05)",
                transition: "background 0.15s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(26,26,26,0.02)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              {/* Cover */}
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: 48,
                  height: 34,
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid rgba(26,26,26,0.08)",
                  display: "block",
                }}
              />

              {/* Title + excerpt — truncated to one line each */}
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "var(--color-ink)",
                    margin: "0 0 0.15rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.68rem",
                    color: "rgba(26,26,26,0.38)",
                    margin: "0 0 0.15rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.excerpt}
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.58rem",
                    color: "rgba(26,26,26,0.25)",
                  }}
                >
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Category */}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  color: "rgba(26,26,26,0.5)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {post.category}
              </span>

              {/* Status — click to cycle */}
              <button
                type="button"
                onClick={() => handleStatusCycle(post)}
                disabled={toggling}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
                title="Click to cycle: draft → published → archived"
              >
                <StatusBadge status={post.status} />
              </button>

              {/* Views */}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  color: "rgba(26,26,26,0.42)",
                  whiteSpace: "nowrap",
                }}
              >
                {post.views.toLocaleString()}
              </span>

              {/* Featured toggle */}
              <button
                type="button"
                onClick={() => toggleFeatured(post._id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  fontSize: "1rem",
                  lineHeight: 1,
                  color: post.isFeatured
                    ? "var(--color-gold)"
                    : "rgba(26,26,26,0.18)",
                  transition: "color 0.2s, transform 0.15s",
                  display: "flex",
                }}
                title={
                  post.isFeatured ? "Remove from featured" : "Mark as featured"
                }
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform =
                    "scale(1.25)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform =
                    "scale(1)")
                }
              >
                ★
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    background: "transparent",
                    border: "1px solid rgba(26,26,26,0.12)",
                    color: "rgba(26,26,26,0.48)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-brand)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-brand)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(26,26,26,0.12)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(26,26,26,0.48)";
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(post)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    background: "transparent",
                    border: "1px solid rgba(220,38,38,0.18)",
                    color: "rgba(220,38,38,0.55)",
                    padding: "4px 8px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#dc2626";
                    (e.currentTarget as HTMLElement).style.color = "#dc2626";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(220,38,38,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(220,38,38,0.18)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(220,38,38,0.55)";
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  Del
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Pagination ── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center gap-1.5 mt-5">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32,
                  height: 32,
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  background: p === page ? "var(--color-brand)" : "transparent",
                  color: p === page ? "white" : "rgba(26,26,26,0.42)",
                  border: p === page ? "none" : "1px solid rgba(26,26,26,0.1)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  if (p !== page)
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-brand)";
                }}
                onMouseLeave={(e) => {
                  if (p !== page)
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(26,26,26,0.1)";
                }}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showForm && <BlogFormModal post={editPost} onClose={closeForm} />}
        {deleteTarget && (
          <ConfirmModal
            title="Delete Post"
            message={`"${deleteTarget.title}" will be permanently deleted along with its Cloudinary assets. This cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {deleting && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              color: "white",
              background: "var(--color-brand)",
              padding: "0.8rem 2rem",
              letterSpacing: "0.1em",
            }}
          >
            Deleting…
          </motion.div>
        </div>
      )}
    </div>
  );
}
