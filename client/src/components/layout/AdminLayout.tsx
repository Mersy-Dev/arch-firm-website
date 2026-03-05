import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FolderOpen, FileText, MessageSquare,
  Users, Settings, LogOut, Menu, X, ChevronRight,
  Layers, Bell, ExternalLink,
} from 'lucide-react';
import { useLogoutUserMutation } from '@/services/authApi';
import { clearCredentials, selectCurrentUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// ─── Nav items ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',  end: true  },
      { to: '/admin/projects',  icon: FolderOpen,      label: 'Projects'              },
      { to: '/admin/services',  icon: Layers,          label: 'Services'              },
      { to: '/admin/blog',      icon: FileText,        label: 'Blog'                  },
      { to: '/admin/enquiries', icon: MessageSquare,   label: 'Enquiries', badge: true },
    ],
  },
  {
    label: 'Studio',
    items: [
      { to: '/admin/team',      icon: Users,     label: 'Team'     },
      { to: '/admin/settings',  icon: Settings,  label: 'Settings' },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getRoleColor(role?: string | null): string {
  if (role === 'superadmin') return '#c9a84c';
  return 'rgba(255,255,255,0.35)';
}

// ─── Nav item ──────────────────────────────────────────────────────────────
function NavItem({ to, icon: Icon, label, end, badge, onClick }: {
  to: string; icon: React.ElementType; label: string;
  end?: boolean; badge?: boolean; onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.58rem 0.85rem',
        marginBottom: '0.1rem',
        textDecoration: 'none',
        fontFamily: 'var(--font-body)',
        fontSize: '0.76rem',
        letterSpacing: '0.04em',
        fontWeight: isActive ? 500 : 400,
        color: isActive ? 'white' : 'rgba(255,255,255,0.35)',
        background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
        transition: 'all 0.18s',
        borderRadius: '0 2px 2px 0',
        position: 'relative',
      })}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        if (!el.style.borderLeftColor.includes('gold') && !el.style.borderLeftColor.includes('c9')) {
          el.style.color = 'rgba(255,255,255,0.72)';
          el.style.background = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        if (!el.style.borderLeftColor.includes('gold') && !el.style.borderLeftColor.includes('c9')) {
          el.style.color = 'rgba(255,255,255,0.35)';
          el.style.background = 'transparent';
        }
      }}
    >
      {({ isActive }) => (
        <>
          <Icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55 }} />
          <span style={{ flex: 1 }}>{label}</span>
          {badge && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
              flexShrink: 0,
            }} />
          )}
          {isActive && !badge && (
            <ChevronRight size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAppSelector(selectCurrentUser);
  const [logoutUser, { isLoading: loggingOut }] = useLogoutUserMutation();

  // Derive current page label for header breadcrumb
  const currentPage = NAV_GROUPS
    .flatMap(g => g.items)
    .find(item => item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
    )?.label ?? 'Admin';

  const handleLogout = async () => {
    try { await logoutUser().unwrap(); } catch { /* clear anyway */ }
    finally {
      dispatch(clearCredentials());
      toast.success('Signed out');
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f4f3f0' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 20,
              background: 'rgba(10,14,20,0.6)',
              backdropFilter: 'blur(2px)',
            }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:relative z-30 h-full flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: 232,
          flexShrink: 0,
          background: 'var(--color-ink)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '1.4rem 1.4rem 1.2rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 20, height: 1, background: 'var(--color-gold)' }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.5rem',
                letterSpacing: '0.32em', textTransform: 'uppercase',
                color: 'var(--color-gold)', fontWeight: 600,
              }}>
                Admin Console
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: '1.25rem', color: 'white', letterSpacing: '0.08em',
              display: 'block',
            }}>
              FORMA
            </span>
          </div>

          {/* Mobile close */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.25)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? '1.5rem' : 0 }}>
              {/* Group label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 0.85rem',
                marginBottom: '0.5rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.5rem',
                  letterSpacing: '0.24em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.18)', fontWeight: 600,
                }}>
                  {group.label}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              </div>

              {group.items.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          ))}

          {/* View site link */}
          <div style={{
            margin: '1.5rem 0 0',
            padding: '0 0.85rem',
          }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.55rem 0',
                fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.2)',
                textDecoration: 'none',
                letterSpacing: '0.06em',
                transition: 'color 0.18s',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '1rem',
                marginTop: '0.25rem',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
            >
              <ExternalLink size={12} style={{ opacity: 0.6 }} />
              View live site
            </a>
          </div>
        </nav>

        {/* ── User + logout ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: '0.85rem 0.75rem 1.1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {user != null && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.75rem 0.85rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '0.6rem',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 34, height: 34,
                  background: 'var(--color-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  fontWeight: 700, color: 'white', letterSpacing: '0.05em',
                }}>
                  {getInitials(user.name)}
                </span>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22c55e',
                  border: '1.5px solid var(--color-ink)',
                }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.76rem',
                  fontWeight: 500, color: 'white', margin: '0 0 1px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.name ?? '—'}
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                  color: getRoleColor(user.role),
                  margin: 0, textTransform: 'capitalize',
                  letterSpacing: '0.08em',
                }}>
                  {user.role ?? ''}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.55rem 0.85rem',
              fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.25)',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', transition: 'color 0.18s', letterSpacing: '0.04em',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            <LogOut size={13} style={{ opacity: 0.7 }} />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <header
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 1.5rem',
            minHeight: 56,
            background: 'white',
            borderBottom: '1px solid rgba(26,26,26,0.07)',
            flexShrink: 0,
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{
              color: 'var(--color-ink)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0',
            }}
          >
            <Menu size={19} />
          </button>

          {/* Breadcrumb */}
          <div
            className="hidden lg:flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.68rem',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: 'rgba(26,26,26,0.28)' }}>FORMA</span>
            <ChevronRight size={10} style={{ color: 'rgba(26,26,26,0.2)' }} />
            <span style={{ color: 'rgba(26,26,26,0.28)' }}>Admin</span>
            <ChevronRight size={10} style={{ color: 'rgba(26,26,26,0.2)' }} />
            <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{currentPage}</span>
          </div>

          {/* Right — status + notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Notification bell (cosmetic — wire up later) */}
            <button
              style={{
                position: 'relative', background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(26,26,26,0.35)',
                padding: 4, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.35)')}
            >
              <Bell size={16} />
              {/* Dot — remove when no notifications */}
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--color-gold)',
                border: '1px solid white',
              }} />
            </button>

            {/* Online status */}
            {user != null && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                  color: 'rgba(26,26,26,0.45)',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 2px rgba(34,197,94,0.2)',
                }} />
                {user.name ?? 'Admin'}
              </div>
            )}
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}