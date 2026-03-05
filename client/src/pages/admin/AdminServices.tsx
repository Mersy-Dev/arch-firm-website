import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  Layers, AlertTriangle, X, Search, CheckCircle, ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  useGetAdminServicesQuery,
  useDeleteServiceMutation,
  useToggleServiceStatusMutation,
  type Service,  // 👈 import the type

} from '@/services/servicesApi';
import ServiceFormModal from '@/components/admin/ServiceFormModal';

// ─── Types ──────────────────────────────────────────────────────────────────


// ─── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: 'white',
        border: '1px solid rgba(26,26,26,0.07)',
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 180, background: 'rgba(26,26,26,0.06)' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ width: '30%', height: 9, background: 'rgba(26,26,26,0.05)', marginBottom: 10 }} />
        <div style={{ width: '70%', height: 18, background: 'rgba(26,26,26,0.07)', marginBottom: 8 }} />
        <div style={{ width: '90%', height: 10, background: 'rgba(26,26,26,0.04)', marginBottom: 5 }} />
        <div style={{ width: '60%', height: 10, background: 'rgba(26,26,26,0.04)', marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 34, background: 'rgba(26,26,26,0.05)' }} />
          <div style={{ width: 34, height: 34, background: 'rgba(26,26,26,0.05)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Confirm delete modal ────────────────────────────────────────────────────
function ConfirmModal({
  open, title, message, onConfirm, onCancel, loading,
}: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(10,14,20,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              maxWidth: 400,
              width: '100%',
              position: 'relative',
              boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            }}
          >
            {/* Top gold bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#ef4444' }} />

            <button
              onClick={onCancel}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(26,26,26,0.3)', padding: 4, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.3)')}
            >
              <X size={15} />
            </button>

            <div style={{
              width: 44, height: 44,
              background: 'rgba(239,68,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>

            <h3 style={{
              fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: '1.35rem', color: 'var(--color-ink)',
              margin: '0 0 0.6rem', lineHeight: 1.1,
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.83rem',
              color: 'rgba(26,26,26,0.48)', lineHeight: 1.65,
              margin: '0 0 1.75rem',
            }}>
              {message}
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid rgba(26,26,26,0.12)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'rgba(26,26,26,0.45)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.3)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.12)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.45)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: '#ef4444', border: '1px solid #ef4444',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'white', opacity: loading ? 0.7 : 1,
                  transition: 'filter 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
              >
                {loading && <RefreshCw size={12} className="animate-spin" />}
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Service card ────────────────────────────────────────────────────────────
function ServiceCard({
  service, index, onEdit, onDelete, onToggle, toggling,
}: {
  service: Service;
  index: number;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
  onToggle: (s: Service) => void;
  toggling: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'white',
        border: '1px solid rgba(26,26,26,0.07)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.3s, transform 0.3s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(26,26,26,0.09)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Inactive overlay tint */}
      {!service.isActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'rgba(255,255,255,0.55)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Image */}
      <div style={{ position: 'relative', height: 175, overflow: 'hidden', flexShrink: 0 }}>
        {!imgErr ? (
          <img
            src={service.image}
            alt={service.title}
            onError={() => setImgErr(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'rgba(26,26,26,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={32} style={{ color: 'rgba(26,26,26,0.12)' }} />
          </div>
        )}

        {/* Number badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(10,14,20,0.72)',
          backdropFilter: 'blur(6px)',
          padding: '3px 10px',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.58rem',
            letterSpacing: '0.2em', color: 'var(--color-gold)',
            fontWeight: 600,
          }}>
            {service.number}
          </span>
        </div>

        {/* Active / inactive badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: service.isActive ? 'rgba(34,197,94,0.9)' : 'rgba(100,100,100,0.8)',
          backdropFilter: 'blur(6px)',
          padding: '3px 10px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'white', opacity: 0.85,
          }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.55rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'white', fontWeight: 600,
          }}>
            {service.isActive ? 'Live' : 'Hidden'}
          </span>
        </div>

        {/* Gold corner accent */}
        <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
            stroke="rgba(201,168,76,0.6)" strokeWidth="1">
            <path d="M18 0 L18 9" /><path d="M18 0 L9 0" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.1rem 1.2rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
          <div style={{ width: 14, height: 1, background: 'var(--color-gold)', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.58rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--color-gold)', fontWeight: 500,
          }}>
            {service.tagline}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: '1.15rem', lineHeight: 1.15,
          color: 'var(--color-ink)', margin: '0 0 0.6rem',
        }}>
          {service.title}
        </h3>

        {/* Short desc */}
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: '0.78rem', lineHeight: 1.6,
          color: 'rgba(26,26,26,0.45)',
          margin: '0 0 0.9rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          flex: 1,
        }}>
          {service.shortDesc}
        </p>

        {/* Features count chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            padding: '2px 9px',
            background: 'rgba(26,60,94,0.06)',
            color: 'rgba(26,60,94,0.6)',
            letterSpacing: '0.08em',
          }}>
            {service.features.length} features
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            padding: '2px 9px',
            background: 'rgba(201,168,76,0.08)',
            color: 'rgba(150,120,40,0.8)',
            letterSpacing: '0.08em',
          }}>
            {service.deliverables.length} deliverables
          </span>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          {/* Edit */}
          <button
            onClick={() => onEdit(service)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.65rem',
              background: 'var(--color-ink)', border: '1px solid var(--color-ink)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'white', fontWeight: 500,
              transition: 'filter 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
          >
            <Pencil size={12} />
            Edit
          </button>

          {/* Toggle visibility */}
          <button
            onClick={() => onToggle(service)}
            disabled={toggling}
            title={service.isActive ? 'Hide service' : 'Show service'}
            style={{
              width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(26,26,26,0.12)',
              cursor: toggling ? 'not-allowed' : 'pointer',
              color: service.isActive ? 'rgba(26,26,26,0.4)' : 'var(--color-gold)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              if (!toggling) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.12)';
              (e.currentTarget as HTMLElement).style.color = service.isActive ? 'rgba(26,26,26,0.4)' : 'var(--color-gold)';
            }}
          >
            {toggling
              ? <RefreshCw size={13} className="animate-spin" />
              : service.isActive ? <EyeOff size={13} /> : <Eye size={13} />
            }
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(service)}
            title="Delete service"
            style={{
              width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(26,26,26,0.12)',
              cursor: 'pointer',
              color: 'rgba(26,26,26,0.35)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
              (e.currentTarget as HTMLElement).style.color = '#ef4444';
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.04)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.12)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.35)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        gridColumn: '1 / -1',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '5rem 2rem',
        background: 'white',
        border: '1px solid rgba(26,26,26,0.07)',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 64, height: 64,
        background: 'rgba(201,168,76,0.08)',
        border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <Layers size={26} style={{ color: 'var(--color-gold)' }} />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 300,
        fontSize: '1.5rem', color: 'var(--color-ink)',
        margin: '0 0 0.6rem',
      }}>
        No services yet
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.83rem',
        color: 'rgba(26,26,26,0.4)', margin: '0 0 2rem',
        maxWidth: '32ch', lineHeight: 1.65,
      }}>
        Add your first service to start populating the services page.
      </p>
      <button
        onClick={onAdd}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '0.8rem 1.75rem',
          background: 'var(--color-ink)', border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'white', fontWeight: 500,
          transition: 'filter 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
      >
        <Plus size={14} />
        Add First Service
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminServices() {
  const [search, setSearch]               = useState('');
  const [filterActive, setFilterActive]   = useState<'all' | 'active' | 'inactive'>('all');
  const [formOpen, setFormOpen]           = useState(false);
  const [editTarget, setEditTarget]       = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Service | null>(null);
  const [togglingId, setTogglingId]       = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useGetAdminServicesQuery();
  const [deleteService, { isLoading: deleting }]          = useDeleteServiceMutation();
  const [toggleService]                                    = useToggleServiceStatusMutation();

  const services: Service[] = data?.data ?? [];

  // Stats
  const activeCount   = services.filter(s => s.isActive).length;
  const inactiveCount = services.length - activeCount;

  // Filtered list
  const filtered = services.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
      || s.tagline.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterActive === 'all'
      ? true
      : filterActive === 'active' ? s.isActive : !s.isActive;
    return matchSearch && matchFilter;
  });

  // ── Handlers ──
  const handleEdit = (service: Service) => {
    setEditTarget(service);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget._id).unwrap();
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const handleToggle = async (service: Service) => {
    setTogglingId(service._id);
    try {
      await toggleService(service._id).unwrap();
      toast.success(
        service.isActive
          ? `"${service.title}" hidden from site`
          : `"${service.title}" is now live`,
        { icon: service.isActive ? '👁' : '✓' }
      );
    } catch {
      toast.error('Failed to update service status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{
      padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      maxWidth: 1400,
      margin: '0 auto',
    }}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem', gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.55rem' }}>
            <div style={{ width: 24, height: 1, background: 'var(--color-gold)' }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.58rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'var(--color-gold)', fontWeight: 600,
            }}>
              Content Management
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: 'var(--color-ink)', margin: '0 0 0.3rem',
            lineHeight: 1.05, letterSpacing: '-0.01em',
          }}>
            Services
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.8rem',
            color: 'rgba(26,26,26,0.38)', margin: 0,
          }}>
            {services.length} total &nbsp;·&nbsp;
            <span style={{ color: '#22c55e' }}>{activeCount} live</span>
            {inactiveCount > 0 && (
              <> &nbsp;·&nbsp; <span style={{ color: 'rgba(26,26,26,0.35)' }}>{inactiveCount} hidden</span></>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 1rem',
              background: 'white', border: '1px solid rgba(26,26,26,0.09)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(26,26,26,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-brand)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,60,94,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.4)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.09)';
            }}
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Add service */}
          <button
            onClick={handleAdd}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0.65rem 1.4rem',
              background: 'var(--color-gold)', border: '1px solid var(--color-gold)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-ink)', fontWeight: 600,
              transition: 'filter 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.07)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
          >
            <Plus size={14} />
            Add Service
          </button>
        </div>
      </motion.div>

      {/* ── Toolbar: search + filter ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'flex', alignItems: 'center',
          gap: '0.75rem', marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 220,
          position: 'relative', display: 'flex', alignItems: 'center',
        }}>
          <Search size={13} style={{
            position: 'absolute', left: 12,
            color: 'rgba(26,26,26,0.3)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search services…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.62rem 1rem 0.62rem 2.1rem',
              background: 'white', border: '1px solid rgba(26,26,26,0.09)',
              outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              color: 'var(--color-ink)',
              transition: 'border-color 0.18s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.3)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.09)')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(26,26,26,0.3)', padding: 2,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex',
          border: '1px solid rgba(26,26,26,0.09)',
          background: 'white',
          overflow: 'hidden',
        }}>
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterActive(tab)}
              style={{
                padding: '0.62rem 1rem',
                background: filterActive === tab ? 'var(--color-ink)' : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                letterSpacing: '0.12em', textTransform: 'capitalize',
                color: filterActive === tab ? 'white' : 'rgba(26,26,26,0.4)',
                transition: 'all 0.18s',
                borderRight: tab !== 'inactive' ? '1px solid rgba(26,26,26,0.07)' : 'none',
              }}
              onMouseEnter={e => {
                if (filterActive !== tab)
                  (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,26,0.03)';
              }}
              onMouseLeave={e => {
                if (filterActive !== tab)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {tab === 'all' ? `All (${services.length})` : tab === 'active' ? `Live (${activeCount})` : `Hidden (${inactiveCount})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.85rem 1.1rem', marginBottom: '1.25rem',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(26,26,26,0.55)' }}>
            Could not load services.{' '}
            <button
              onClick={() => refetch()}
              style={{
                color: 'var(--color-brand)', background: 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 'inherit', textDecoration: 'underline', padding: 0,
              }}
            >
              Try again
            </button>
          </span>
        </motion.div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.1rem',
      }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          filtered.map((service, i) => (
            <ServiceCard
              key={service._id}
              service={service}
              index={i}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
              toggling={togglingId === service._id}
            />
          ))
        )}
      </div>

      {/* No search results */}
      {!isLoading && filtered.length === 0 && services.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', marginTop: '3rem',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            color: 'rgba(26,26,26,0.32)',
          }}
        >
          No services match <em>"{search}"</em>
        </motion.p>
      )}

      {/* ── Divider + tip ──────────────────────────────────────────────── */}
      {!isLoading && services.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '2.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid rgba(26,26,26,0.06)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={13} style={{ color: 'var(--color-gold)' }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.7rem',
              color: 'rgba(26,26,26,0.32)',
            }}>
              Use the eye icon to show/hide services without deleting them.
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--font-body)', fontSize: '0.68rem',
              color: 'var(--color-brand)',
              textDecoration: 'none',
              letterSpacing: '0.06em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            View live services page <ArrowUpRight size={11} />
          </a>
        </motion.div>
      )}

      {/* ── Delete confirm modal ───────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete service?"
        message={`"${deleteTarget?.title}" will be permanently removed from the site and cannot be recovered.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* ── Service form modal (create / edit) ─────────────────────────── */}
      {formOpen && (
        <ServiceFormModal
          service={editTarget}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}