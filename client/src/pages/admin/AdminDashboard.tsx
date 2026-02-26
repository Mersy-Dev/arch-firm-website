import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  FileText, MessageSquare,
  ArrowUpRight, Clock, TrendingUp, Eye, Plus,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import { useGetDashboardOverviewQuery } from '@/services/dashboardApi';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useAppSelector } from '@/app/hooks';
import type { RecentEnquiry, RecentProject } from '@/services/dashboardApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Ambient background texture ──────────────────────────────────────────────

function AmbientBg() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Subtle dot-grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.018 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--color-ink)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Top-right ambient glow */}
      <div style={{
        position: 'absolute',
        top: -120,
        right: -120,
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
      }} />

      {/* Bottom-left ambient glow */}
      <div style={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,60,94,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label:    string;
  value:    number | string;
  sub?:     string;
  icon:     React.ElementType;
  accent:   string;
  index:    number;
  onClick?: () => void;
}

function StatCard({ label, value, sub, icon: Icon, accent, index, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative overflow-hidden flex flex-col justify-between"
      style={{
        background: 'white',
        border: '1px solid rgba(26,26,26,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.35s, transform 0.35s',
        padding: '1.75rem',
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(26,26,26,0.09)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0" style={{ height: 2, background: accent }} />

      {/* Subtle corner watermark */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0"
        style={{ opacity: 0.04, transform: 'translate(25%, 25%)' }}
      >
        <Icon size={96} style={{ color: accent }} />
      </div>

      <div className="flex items-start justify-between mb-6">
        <div
          style={{
            width: 42,
            height: 42,
            background: `${accent}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${accent}22`,
          }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
        {onClick && (
          <div
            className="opacity-0 group-hover:opacity-100"
            style={{
              width: 28,
              height: 28,
              border: `1px solid ${accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
            }}
          >
            <ArrowUpRight size={13} style={{ color: accent }} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
            lineHeight: 1,
            color: 'var(--color-ink)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.4)',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              color: accent,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="animate-pulse"
      style={{ background: 'white', border: '1px solid rgba(26,26,26,0.07)', padding: '1.75rem' }}
    >
      <div style={{ width: 42, height: 42, background: 'rgba(26,26,26,0.05)', marginBottom: 24 }} />
      <div style={{ width: '35%', height: 40, background: 'rgba(26,26,26,0.05)', marginBottom: 10 }} />
      <div style={{ width: '55%', height: 10, background: 'rgba(26,26,26,0.04)' }} />
    </div>
  );
}

// ─── Enquiry badge ────────────────────────────────────────────────────────────

function EnquiryBadge({ status }: { status: RecentEnquiry['status'] }) {
  const styles: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    unread:  { label: 'Unread',  bg: 'rgba(239,68,68,0.08)',  color: '#ef4444', dot: '#ef4444' },
    read:    { label: 'Read',    bg: 'rgba(26,26,26,0.05)',   color: 'rgba(26,26,26,0.4)', dot: 'rgba(26,26,26,0.2)' },
    replied: { label: 'Replied', bg: 'rgba(34,197,94,0.08)',  color: '#16a34a', dot: '#16a34a' },
  };
  const s = styles[status];
  return (
    <span
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.57rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 700,
        padding: '3px 9px',
        background: s.bg,
        color: s.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ─── Project badge ────────────────────────────────────────────────────────────

function ProjectBadge({ status }: { status: RecentProject['status'] }) {
  const styles: Record<string, { label: string; bg: string; color: string }> = {
    published: { label: 'Live',  bg: 'rgba(34,197,94,0.08)',  color: '#16a34a' },
    draft:     { label: 'Draft', bg: 'rgba(234,179,8,0.08)',  color: '#ca8a04' },
  };
  const s = styles[status];
  return (
    <span
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.57rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 700,
        padding: '3px 9px',
        background: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label, accent = 'var(--color-brand)' }: {
  icon: React.ElementType;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: 28,
          height: 28,
          background: `${accent}12`,
          border: `1px solid ${accent}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={13} style={{ color: accent }} />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Quick action ─────────────────────────────────────────────────────────────

function QuickAction({
  label, icon: Icon, onClick, accent = 'var(--color-brand)', description,
}: {
  label: string;
  description?: string;
  icon: React.ElementType;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 w-full text-left"
      style={{
        padding: '0.9rem 1rem',
        background: 'white',
        border: '1px solid rgba(26,26,26,0.07)',
        cursor: 'pointer',
        transition: 'all 0.25s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = accent;
        el.style.background = `${accent}06`;
        el.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(26,26,26,0.07)';
        el.style.background = 'white';
        el.style.transform = 'translateX(0)';
      }}
    >
      {/* Left accent strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: accent,
          transform: 'scaleY(0)',
          transition: 'transform 0.25s',
        }}
        className="group-hover:scale-y-100"
      />

      <div
        style={{
          width: 34,
          height: 34,
          background: `${accent}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.25s',
        }}
      >
        <Icon size={14} style={{ color: accent }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              color: 'rgba(26,26,26,0.38)',
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>

      <ArrowUpRight
        size={13}
        style={{ color: accent, opacity: 0, flexShrink: 0, transition: 'opacity 0.2s' }}
        className="group-hover:opacity-100"
      />
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0.5rem 0' }}>
      <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
      <div style={{ flex: 1, height: 1, background: 'rgba(26,26,26,0.06)' }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user     = useAppSelector(selectCurrentUser);

  const { data, isLoading, isError, refetch, isFetching } =
    useGetDashboardOverviewQuery();

  const stats     = data?.data?.stats;
  const enquiries = data?.data?.recentEnquiries ?? [];
  const projects  = data?.data?.recentProjects  ?? [];

  const STAT_CARDS: StatCardProps[] = [
    {
      label:   'Services',
      value:   stats?.services?.total ?? 0,
      sub:     stats?.services != null ? `${stats.services.active} active` : undefined,
      icon:    FileText,
      accent:  'var(--color-gold)',
      index:   0,
      onClick: () => navigate('/admin/services'),
    },
    // Uncomment as backend data becomes available:
    // {
    //   label: 'Projects',
    //   value: stats?.projects?.total ?? 0,
    //   sub: stats?.projects != null ? `${stats.projects.published} published · ${stats.projects.draft} draft` : undefined,
    //   icon: FolderOpen, accent: 'var(--color-brand)', index: 1,
    //   onClick: () => navigate('/admin/projects'),
    // },
    // {
    //   label: 'Enquiries',
    //   value: stats?.enquiries?.total ?? 0,
    //   sub: stats?.enquiries?.unread ? `${stats.enquiries.unread} unread` : undefined,
    //   icon: MessageSquare, accent: stats?.enquiries?.unread ? '#ef4444' : 'var(--color-brand)', index: 2,
    //   onClick: () => navigate('/admin/enquiries'),
    // },
  ];

  return (
    <>
      <AmbientBg />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            gap: '1rem',
          }}
        >
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.6rem' }}>
              <div style={{ width: 24, height: 1, background: 'var(--color-gold)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  fontWeight: 600,
                }}
              >
                Admin Console
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: 'var(--color-ink)',
                margin: '0 0 0.3rem',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
              }}
            >
              {greeting()}
              {user?.name ? (
                <>
                  ,{' '}
                  <em style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.3)' }}>
                    {user.name.split(' ')[0]}
                  </em>
                </>
              ) : ''}
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '0.82rem',
                color: 'rgba(26,26,26,0.38)',
                margin: 0,
              }}
            >
              {format(new Date(), 'EEEE, d MMMM yyyy')}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0.6rem 1.1rem',
              background: 'white',
              border: '1px solid rgba(26,26,26,0.08)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(26,26,26,0.4)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = 'var(--color-brand)';
              el.style.borderColor = 'rgba(26,60,94,0.3)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = 'rgba(26,26,26,0.4)';
              el.style.borderColor = 'rgba(26,26,26,0.08)';
            }}
          >
            <RefreshCw size={12} style={{ transition: 'transform 0.5s' }}
              className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {/* ── Error banner ───────────────────────────────────────────────── */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.9rem 1.1rem',
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.18)',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'rgba(26,26,26,0.55)',
              }}
            >
              Could not load dashboard data.{' '}
              <button
                onClick={() => refetch()}
                style={{
                  color: 'var(--color-brand)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Try again
              </button>
            </span>
          </motion.div>
        )}

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : STAT_CARDS.map(card => <StatCard key={card.label} {...card} />)
          }
        </div>

        <GoldDivider />

        {/* ── Main content ───────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
          className="lg:grid-cols-3-1"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
            className="lg:grid-cols-[1fr_320px]"
          >

            {/* ── Recent enquiries ───────────────────────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <SectionHeading icon={MessageSquare} label="Recent Enquiries" accent="var(--color-brand)" />
                <button
                  onClick={() => navigate('/admin/enquiries')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-brand)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.65'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  View all <ArrowUpRight size={11} />
                </button>
              </div>

              <div
                style={{
                  background: 'white',
                  border: '1px solid rgba(26,26,26,0.07)',
                  overflow: 'hidden',
                }}
              >
                {/* Column headers */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    padding: '0.6rem 1.1rem',
                    background: 'rgba(26,26,26,0.02)',
                    borderBottom: '1px solid rgba(26,26,26,0.05)',
                  }}
                >
                  {['Sender / Subject', 'Status'].map(h => (
                    <span
                      key={h}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.57rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'rgba(26,26,26,0.3)',
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex gap-4 items-center"
                      style={{
                        padding: '1rem 1.1rem',
                        borderBottom: '1px solid rgba(26,26,26,0.04)',
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(26,26,26,0.07)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '40%', height: 11, background: 'rgba(26,26,26,0.06)', marginBottom: 6 }} />
                        <div style={{ width: '65%', height: 9, background: 'rgba(26,26,26,0.04)' }} />
                      </div>
                      <div style={{ width: 54, height: 18, background: 'rgba(26,26,26,0.04)' }} />
                    </div>
                  ))
                ) : enquiries.length === 0 ? (
                  <div
                    style={{
                      padding: '3.5rem 1rem',
                      textAlign: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      color: 'rgba(26,26,26,0.28)',
                    }}
                  >
                    <MessageSquare size={28} style={{ opacity: 0.15, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                    No enquiries yet
                  </div>
                ) : (
                  enquiries.map((enq, i) => (
                    <motion.div
                      key={enq._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      onClick={() => navigate('/admin/enquiries')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.9rem 1.1rem',
                        borderBottom: i < enquiries.length - 1 ? '1px solid rgba(26,26,26,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget as HTMLElement).style.background = 'rgba(26,60,94,0.025)'}
                      onMouseLeave={e =>
                        (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: enq.status === 'unread' ? '#ef4444' : 'transparent',
                          border: enq.status !== 'unread' ? '1px solid rgba(26,26,26,0.15)' : 'none',
                          boxShadow: enq.status === 'unread' ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.82rem',
                            fontWeight: enq.status === 'unread' ? 600 : 400,
                            color: 'var(--color-ink)',
                            margin: '0 0 2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {enq.name}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.73rem',
                            color: 'rgba(26,26,26,0.38)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {enq.subject}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                        <EnquiryBadge status={enq.status} />
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.62rem',
                            color: 'rgba(26,26,26,0.28)',
                          }}
                        >
                          {format(parseISO(enq.createdAt), 'd MMM')}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* ── Right column ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Quick actions */}
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <SectionHeading icon={TrendingUp} label="Quick Actions" accent="var(--color-gold)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <QuickAction
                    label="New Project"
                    description="Add to portfolio"
                    icon={Plus}
                    onClick={() => navigate('/admin/projects/new')}
                    accent="var(--color-brand)"
                  />
                  <QuickAction
                    label="Manage Services"
                    description="Edit service listings"
                    icon={FileText}
                    onClick={() => navigate('/admin/services')}
                    accent="var(--color-gold)"
                  />
                  <QuickAction
                    label="View Enquiries"
                    description="Respond to clients"
                    icon={Eye}
                    onClick={() => navigate('/admin/enquiries')}
                    accent="#8b5cf6"
                  />
                </div>
              </div>

              {/* Recent projects */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <SectionHeading icon={Clock} label="Recent Projects" accent="var(--color-brand)" />
                  <button
                    onClick={() => navigate('/admin/projects')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-brand)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    All <ArrowUpRight size={11} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse flex gap-3 items-center"
                        style={{
                          padding: '0.75rem',
                          background: 'white',
                          border: '1px solid rgba(26,26,26,0.07)',
                        }}
                      >
                        <div style={{ width: 44, height: 44, background: 'rgba(26,26,26,0.06)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '70%', height: 11, background: 'rgba(26,26,26,0.06)', marginBottom: 7 }} />
                          <div style={{ width: '40%', height: 9, background: 'rgba(26,26,26,0.04)' }} />
                        </div>
                      </div>
                    ))
                  ) : projects.length === 0 ? (
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        background: 'white',
                        border: '1px solid rgba(26,26,26,0.07)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8rem',
                        color: 'rgba(26,26,26,0.3)',
                      }}
                    >
                      No projects yet
                    </div>
                  ) : (
                    projects.slice(0, 4).map((proj, i) => (
                      <motion.div
                        key={proj._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                        onClick={() => navigate(`/admin/projects/${proj._id}/edit`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.7rem',
                          background: 'white',
                          border: '1px solid rgba(26,26,26,0.07)',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'var(--color-brand)';
                          el.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(26,26,26,0.07)';
                          el.style.transform = 'translateX(0)';
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            overflow: 'hidden',
                            background: 'rgba(26,26,26,0.05)',
                          }}
                        >
                          {proj.coverImage && (
                            <img
                              src={proj.coverImage}
                              alt={proj.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              color: 'var(--color-ink)',
                              margin: '0 0 2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {proj.title}
                          </p>
                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.65rem',
                              color: 'rgba(26,26,26,0.32)',
                              margin: 0,
                            }}
                          >
                            {proj.category}
                          </p>
                        </div>
                        <ProjectBadge status={proj.status} />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(26,26,26,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              color: 'rgba(26,26,26,0.18)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            FORMA Architecture Studio Admin Console
          </span>
          <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
        </motion.div>
      </div>
    </>
  );
}