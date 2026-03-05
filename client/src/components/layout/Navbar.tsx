import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// ─── Nav structure ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Work',
    href: '/portfolio',
    children: [
      { label: 'All Projects',    href: '/portfolio',        desc: 'Browse our full portfolio'     },
      { label: 'Project Detail',  href: '/portfolio/sample', desc: 'Explore individual case studies'},
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'What We Offer', href: '/services', desc: 'End-to-end architectural services' },
      { label: 'Our Process',   href: '/process',  desc: 'How we work with clients'          },
    ],
  },
  {
    label: 'Studio',
    href: '/about',
    children: [
      { label: 'About Us', href: '/about',   desc: 'Our philosophy & story'    },
      { label: 'Our Team', href: '/team',    desc: 'Meet the architects'        },
      { label: 'Careers',  href: '/careers', desc: 'Join our practice'          },
    ],
  },
  {
    label: 'Journal',
    href: '/blog',
    children: [
      { label: 'All Articles', href: '/blog', desc: 'Perspectives & insights'   },
      { label: 'FAQ',          href: '/faq',  desc: 'Common questions answered'  },
    ],
  },
];

// ─── Desktop dropdown panel ────────────────────────────────────────────────
function DropdownPanel({
  items,
  onClose,
}: {
  items: { label: string; href: string; desc: string }[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 z-50 min-w-[220px]"
      style={{
        marginTop: 0,
        background: 'rgba(16, 32, 50, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.08)',
      }}
    >
      {/* Gold top rule */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)', opacity: 0.6 }} />

      <div className="py-1.5">
        {items.map(({ label, href, desc }, i) => (
          <Link
            key={href}
            to={href}
            onClick={onClose}
            className="group flex flex-col px-5 py-3 no-underline"
            style={{
              borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span
              className="leading-tight group-hover:text-[var(--color-gold)] transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.82)',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.66rem',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.3)',
                marginTop: 2,
                lineHeight: 1.4,
              }}
            >
              {desc}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Single desktop nav item ───────────────────────────────────────────────
function NavItem({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const hasChildren     = !!item.children?.length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <Link
        to={item.href}
        className="relative flex items-center gap-1 px-4 py-2 no-underline"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.67rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.65)',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'white'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
      >
        {item.label}

        {/* Chevron */}
        {hasChildren && (
          <motion.svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: 0.6 }}
          >
            <path d="M2 3.5l3 3 3-3" />
          </motion.svg>
        )}

        {/* Active dot */}
        {isActive && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: 2, width: 4, height: 4,
              borderRadius: '50%',
              backgroundColor: 'var(--color-gold)',
              display: 'block',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </Link>

      <AnimatePresence>
        {open && hasChildren && (
          <DropdownPanel items={item.children} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile accordion item ─────────────────────────────────────────────────
function MobileNavItem({
  item, index, isActive, onNavigate,
}: {
  item: typeof NAV_ITEMS[0]; index: number; isActive: boolean; onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const hasChildren = !!item.children?.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Parent row */}
      <div
        className="flex items-center justify-between py-4 cursor-pointer select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        onClick={() => hasChildren && setExpanded(v => !v)}
      >
        <div className="flex items-center gap-5">
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.58rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', width: 20, flexShrink: 0,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>

          {hasChildren ? (
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
              color: isActive ? 'var(--color-gold)' : 'white',
            }}>
              {item.label}
            </span>
          ) : (
            <Link to={item.href} onClick={onNavigate} className="no-underline" style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
              color: isActive ? 'var(--color-gold)' : 'white',
            }}>
              {item.label}
            </Link>
          )}
        </div>

        {hasChildren ? (
          <motion.svg
            width="18" height="18" viewBox="0 0 18 18" fill="none"
            stroke={isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.3)'}
            strokeWidth="1.5"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
          >
            <path d="M4 7l5 5 5-5" />
          </motion.svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" className="shrink-0">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        )}
      </div>

      {/* Accordion children */}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-11 pb-3 pt-1 flex flex-col">
              {item.children.map(({ label, href, desc }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={onNavigate}
                  className="group flex flex-col py-2.5 no-underline"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="group-hover:text-[var(--color-gold)] transition-colors duration-150"
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                      fontWeight: 500, color: 'rgba(255,255,255,0.65)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                    fontWeight: 300, color: 'rgba(255,255,255,0.27)', marginTop: 1,
                  }}>
                    {desc}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────
export default function Navbar() {
  const location                = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden]     = useState(false);
  const lastScrollY             = useRef(0);
  const { scrollY }             = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const diff = y - lastScrollY.current;
    if (y < 60) { setScrolled(false); setHidden(false); }
    else {
      setScrolled(true);
      if (diff > 8) setHidden(true);
      else if (diff < -8) setHidden(false);
    }
    lastScrollY.current = y;
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActiveGroup = (item: typeof NAV_ITEMS[0]) => {
    if (location.pathname === item.href) return true;
    return item.children?.some(c =>
      c.href !== '/portfolio/sample' && location.pathname.startsWith(c.href)
    ) ?? false;
  };

  return (
    <>
      {/* ── Bar ── */}
      <motion.header
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: 'var(--nav-height)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'var(--color-brand)',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            transition: 'border-color 0.4s ease',
          }}
        />

        <div className="relative z-10 container-main h-full flex items-center justify-between gap-8">

          {/* ── Logo ── */}
          <Link to="/" className="no-underline flex items-center gap-2.5 shrink-0" aria-label="FORMA home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="0.5" y="0.5" width="23" height="23" stroke="var(--color-gold)" strokeWidth="1" />
              <rect x="5" y="5" width="14" height="14" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.5" />
              <line x1="0" y1="12" x2="24" y2="12" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.4" />
              <line x1="12" y1="0" x2="12" y2="24" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.4" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: '1.05rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'white', lineHeight: 1,
            }}>
              FORMA<span style={{ color: 'var(--color-gold)' }}>.</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center flex-1 justify-center" aria-label="Primary">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.href} item={item} isActive={isActiveGroup(item)} />
            ))}
          </nav>

          {/* ── Right ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* CTA */}
            <Link
              to="/contact"
              className="hidden lg:inline-flex items-center gap-2 no-underline text-[0.64rem] tracking-[0.2em] uppercase px-5 py-2.5"
              style={{
                fontFamily: 'var(--font-body)', fontWeight: 500,
                color: 'var(--color-gold)', border: '1px solid rgba(201,168,76,0.45)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = 'var(--color-gold)';
                el.style.color = 'var(--color-ink)';
                el.style.borderColor = 'var(--color-gold)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = 'transparent';
                el.style.color = 'var(--color-gold)';
                el.style.borderColor = 'rgba(201,168,76,0.45)';
              }}
            >
              Get in Touch
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 13L13 3M13 3H6M13 3v7" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden flex flex-col items-end justify-center gap-[5px] w-10 h-10 focus:outline-none"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-px bg-white origin-center" style={{ width: 24 }}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block h-px bg-white self-end" style={{ width: 16 }}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-px bg-white origin-center" style={{ width: 24 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto"
            style={{ backgroundColor: 'var(--color-brand)', paddingTop: 'var(--nav-height)' }}
          >
            {/* Faint texture */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=30&fit=crop')`,
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05,
              }}
            />
            {/* Diagonal line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 800"
              preserveAspectRatio="none" aria-hidden="true">
              <line x1="400" y1="0" x2="0" y2="800" stroke="rgba(201,168,76,0.07)" strokeWidth="1.5" />
            </svg>

            <div className="relative z-10 container-main flex flex-col justify-between flex-1 py-6">
              <nav aria-label="Mobile navigation" className="mt-2">
                {NAV_ITEMS.map((item, i) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    index={i}
                    isActive={isActiveGroup(item)}
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}

                {/* Contact row */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, delay: NAV_ITEMS.length * 0.06 }}
                >
                  <div className="flex items-center justify-between py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-5">
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                        letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', width: 20,
                      }}>
                        {String(NAV_ITEMS.length + 1).padStart(2, '0')}
                      </span>
                      <Link
                        to="/contact"
                        onClick={() => setMenuOpen(false)}
                        className="no-underline"
                        style={{
                          fontFamily: 'var(--font-display)', fontWeight: 300,
                          fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
                          color: location.pathname === '/contact' ? 'var(--color-gold)' : 'var(--color-gold)',
                        }}
                      >
                        Contact
                      </Link>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                      stroke="var(--color-gold)" strokeWidth="1.5" className="shrink-0">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </div>
                </motion.div>
              </nav>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="pt-8 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-8">
                  {['studio@forma.com', '+1 (212) 555-0100'].map(c => (
                    <a key={c} href={c.includes('@') ? `mailto:${c}` : `tel:${c.replace(/\D/g,'')}`}
                      className="no-underline text-[0.72rem]"
                      style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.35)' }}>
                      {c}
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  {['Instagram', 'LinkedIn', 'Dezeen'].map(s => (
                    <a key={s} href="#" className="no-underline text-[0.6rem] tracking-[0.18em] uppercase"
                      style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.22)' }}>
                      {s}
                    </a>
                  ))}
                  <span className="ml-auto text-[0.58rem] tracking-[0.14em]"
                    style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.15)' }}>
                    NY · LDN · DXB
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}