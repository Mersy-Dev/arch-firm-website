/**
 * CursorGlowLayout.tsx
 *
 * Wrap your entire app with this component (in App.tsx or your root layout).
 * It injects the faint lerp-based cursor glow that "drags" slightly behind
 * the mouse — the same feel as the ServiceRow hover effect — but globally
 * across every page and section.
 *
 * USAGE:
 *   import CursorGlowLayout from "@/components/CursorGlowLayout";
 *
 *   // App.tsx
 *   export default function App() {
 *     return (
 *       <CursorGlowLayout>
 *         <Navbar />
 *         <Outlet />   ← all your pages
 *         <Footer />
 *       </CursorGlowLayout>
 *     );
 *   }
 */

import { useEffect, useRef, type ReactNode } from "react";

// ─── Lerp helper ──────────────────────────────────────────────────────────
// t = 0.075 gives the "lagging behind" drag feel.
// Raise toward 0.2 for snappier, lower toward 0.03 for dreamier.
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LERP_FACTOR = 0.075; // ← tweak drag speed here

// ─── Component ────────────────────────────────────────────────────────────
export default function CursorGlowLayout({ children }: { children: ReactNode }) {
  const glowRef   = useRef<HTMLDivElement>(null);
  const target    = useRef({ x: -9999, y: -9999 }); // where the mouse IS
  const current   = useRef({ x: -9999, y: -9999 }); // where the glow IS (lerped)
  const rafId     = useRef<number>(0);
  const isTouch   = useRef(false);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    // ── Track raw mouse position ──────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    // Hide glow on touch devices — it serves no purpose there
    const onTouchStart = () => {
      isTouch.current = true;
      el.style.opacity = "0";
    };

    // ── RAF loop: lerp current → target ──────────────────────────────────
    const tick = () => {
      if (!isTouch.current) {
        current.current.x = lerp(current.current.x, target.current.x, LERP_FACTOR);
        current.current.y = lerp(current.current.y, target.current.y, LERP_FACTOR);

        el.style.setProperty("--gx", `${current.current.x}px`);
        el.style.setProperty("--gy", `${current.current.y}px`);
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    // Outer wrapper — position:relative so the fixed glow still escapes to viewport
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* ── Glow layer ── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          // Fixed to viewport — follows scroll automatically
          position:      "fixed",
          inset:         0,
          zIndex:        9999,
          pointerEvents: "none",

          // Radial spotlight centred on the lerped CSS vars
          background: `radial-gradient(
            600px circle at var(--gx, -9999px) var(--gy, -9999px),
            rgba(201, 168, 76, 0.055) 0%,
            rgba(26,  60,  94, 0.025) 40%,
            transparent               70%
          )`,

          /*
           * soft-light blends well on BOTH the cream (var(--color-bg))
           * sections AND the dark ink sections — you get a warm gold shimmer
           * on light areas and a subtle brightening on dark ones.
           *
           * If you want more intensity: "overlay"
           * If light sections only:    "screen"
           */
          mixBlendMode: "soft-light",

          // Smooth out any micro-jitter between lerp steps
          willChange: "background",
        }}
      />

      {/* ── All page content ── */}
      {children}
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOMISATION REFERENCE
   ─────────────────────────────────────────────────────────────────────────────

   DRAG SPEED
   Change LERP_FACTOR at the top of this file:
     0.03  — very slow, dreamy drift
     0.075 — default: clearly drags behind the cursor (matches ServiceRow feel)
     0.15  — quicker catch-up, still smooth
     1.0   — instant (no lag at all)

   GLOW SIZE
   Change the first argument of radial-gradient:
     400px  — tighter, more focused spotlight
     600px  — default
     900px  — large, ambient wash

   GLOW COLOURS
   The gradient uses two stops:
     Stop 1 — var(--color-gold) tint  → warm highlight on cream sections
     Stop 2 — var(--color-brand) tint → subtle depth on dark sections
   Adjust the rgba values or add more stops as needed.

   INTENSITY
   Raise/lower the alpha values in rgba(...):
     0.04  — barely perceptible (very safe)
     0.055 — default
     0.1   — noticeably warm

   PER-SECTION OVERRIDES
   You can shift the blend mode locally via a wrapper:
     <div style={{ isolation: "isolate", mixBlendMode: "normal" }}>
       ... section that should NOT show the glow ...
     </div>

   ─────────────────────────────────────────────────────────────────────────────
*/