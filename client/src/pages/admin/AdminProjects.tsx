import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff,
  Star, AlertCircle, ChevronLeft, ChevronRight,
  MoreVertical, ImageOff,
} from 'lucide-react';
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useTogglePublishMutation,
} from '@/services/projectsApi';
import type { Project, ProjectType } from '@/types/project.types';
import { PROJECT_TYPES } from '@/types/project.types';

// ─── Type badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ProjectType }) {
  const colors: Record<ProjectType, { bg: string; color: string }> = {
    residential:  { bg: 'rgba(26,60,94,0.08)',   color: 'var(--color-brand)' },
    commercial:   { bg: 'rgba(201,168,76,0.12)',  color: '#92740a' },
    hospitality:  { bg: 'rgba(139,92,246,0.1)',   color: '#7c3aed' },
    mixed:        { bg: 'rgba(34,197,94,0.1)',    color: '#16a34a' },
    renovation:   { bg: 'rgba(239,68,68,0.08)',   color: '#dc2626' },
  };
  const c = colors[type];
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
      letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
      padding: '3px 8px', background: c.bg, color: c.color }}>
      {type}
    </span>
  );
}

// ─── Confirm delete modal ───────────────────────────────────────────────────
function ConfirmModal({
  project, onConfirm, onCancel, isDeleting,
}: {
  project: Project;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,26,0.6)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md p-8"
        style={{ background: 'white' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: '1.3rem', color: 'var(--color-ink)', margin: '0 0 0.4rem' }}>
              Delete Project
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              color: 'rgba(26,26,26,0.55)', margin: 0 }}>
              <strong style={{ color: 'var(--color-ink)' }}>{project.title}</strong> will be
              permanently deleted along with all its images from Cloudinary. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isDeleting}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
              padding: '0.75rem 1.5rem', background: 'white',
              border: '1px solid rgba(26,26,26,0.12)', cursor: 'pointer',
              color: 'rgba(26,26,26,0.6)', transition: 'all 0.2s' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
              padding: '0.75rem 1.5rem', background: '#ef4444',
              border: 'none', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Row actions menu ───────────────────────────────────────────────────────
function RowActions({ project, onEdit, onDelete, onTogglePublish, isToggling }: {
  project:         Project;
  onEdit:          () => void;
  onDelete:        () => void;
  onTogglePublish: () => void;
  isToggling:      boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(26,26,26,0.4)', padding: '4px', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.4)')}>
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 z-20 py-1 min-w-[160px]"
              style={{ background: 'white', border: '1px solid rgba(26,26,26,0.1)',
                boxShadow: '0 8px 24px rgba(26,26,26,0.12)', top: '100%' }}
            >
              {[
                { icon: Edit2,  label: 'Edit',  action: () => { onEdit(); setOpen(false); }, color: 'var(--color-ink)' },
                {
                  icon: project.published ? EyeOff : Eye,
                  label: isToggling ? 'Updating…' : project.published ? 'Unpublish' : 'Publish',
                  action: () => { onTogglePublish(); setOpen(false); },
                  color: project.published ? '#ca8a04' : '#16a34a',
                },
                { icon: Trash2, label: 'Delete', action: () => { onDelete(); setOpen(false); }, color: '#ef4444' },
              ].map(({ icon: Icon, label, action, color }) => (
                <button key={label} onClick={action}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                    color, background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,26,26,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function AdminProjects() {
  const navigate = useNavigate();

  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [typeFilter, setTypeFilter] = useState<ProjectType | ''>('');
  const [pubFilter, setPubFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toDelete,  setToDelete]  = useState<Project | null>(null);

  const queryParams = {
    page,
    limit: 10,
    ...(search     && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(pubFilter !== 'all' && { published: pubFilter === 'published' }),
  };

  const { data, isLoading, isError, refetch } = useGetProjectsQuery(queryParams);
  const [deleteProject,  { isLoading: isDeleting  }] = useDeleteProjectMutation();
  const [togglePublish,  { isLoading: isToggling  }] = useTogglePublishMutation();

  const projects   = data?.data.projects   ?? [];
  const pagination = data?.data.pagination;

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProject(toDelete._id).unwrap();
      toast.success(`"${toDelete.title}" deleted`);
      setToDelete(null);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      const res = await togglePublish(project._id).unwrap();
      toast.success(res.data.project.published ? 'Project published' : 'Project unpublished');
    } catch {
      toast.error('Failed to update publish status');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width: 22, height: 1, background: 'var(--color-gold)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'var(--color-gold)', fontWeight: 500 }}>Content</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--color-ink)',
            margin: 0, lineHeight: 1.1 }}>
            Projects
            {pagination && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                color: 'rgba(26,26,26,0.35)', fontWeight: 300, marginLeft: '0.75rem' }}>
                {pagination.total} total
              </span>
            )}
          </h1>
        </div>

        <button onClick={() => navigate('/admin/projects/new')}
          className="flex items-center gap-2 px-6 py-3"
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500,
            background: 'var(--color-brand)', color: 'white',
            border: 'none', cursor: 'pointer', transition: 'filter 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}>
          <Plus size={15} />
          New Project
        </button>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-wrap gap-3 mb-6">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(26,26,26,0.3)' }} />
          <input
            type="text" placeholder="Search projects…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              background: 'white', border: '1px solid rgba(26,26,26,0.1)',
              color: 'var(--color-ink)', outline: 'none' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.1)')}
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(26,26,26,0.3)' }} />
          <select value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as ProjectType | ''); setPage(1); }}
            style={{ padding: '0.65rem 2.5rem 0.65rem 2.2rem',
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              background: 'white', border: '1px solid rgba(26,26,26,0.1)',
              color: typeFilter ? 'var(--color-ink)' : 'rgba(26,26,26,0.45)',
              cursor: 'pointer', appearance: 'none', outline: 'none' }}>
            <option value="">All types</option>
            {PROJECT_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Published filter */}
        {(['all', 'published', 'draft'] as const).map(f => (
          <button key={f} onClick={() => { setPubFilter(f); setPage(1); }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
              padding: '0.65rem 1.25rem',
              background: pubFilter === f ? 'var(--color-ink)' : 'white',
              color: pubFilter === f ? 'white' : 'rgba(26,26,26,0.45)',
              border: '1px solid',
              borderColor: pubFilter === f ? 'var(--color-ink)' : 'rgba(26,26,26,0.1)',
              cursor: 'pointer', transition: 'all 0.2s' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* ── Error ── */}
      {isError && (
        <div className="flex items-center gap-3 p-4 mb-6"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={15} style={{ color: '#ef4444' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
            Failed to load projects.{' '}
            <button onClick={() => refetch()}
              style={{ color: 'var(--color-brand)', background: 'none',
                border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Retry
            </button>
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ background: 'white', border: '1px solid rgba(26,26,26,0.07)' }}>

        {/* Table header */}
        <div className="hidden md:grid gap-4 px-6 py-3"
          style={{ gridTemplateColumns: '48px 1fr 120px 100px 80px 80px 48px',
            borderBottom: '1px solid rgba(26,26,26,0.07)',
            fontFamily: 'var(--font-body)', fontSize: '0.6rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.35)', fontWeight: 600 }}>
          <span>Img</span>
          <span>Title</span>
          <span>Type</span>
          <span>Location</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>

        {/* Loading skeletons */}
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 animate-pulse items-center"
            style={{ borderBottom: '1px solid rgba(26,26,26,0.05)' }}>
            <div style={{ width: 48, height: 36, background: 'rgba(26,26,26,0.06)', flexShrink: 0 }} />
            <div className="flex-1">
              <div style={{ width: '50%', height: 12, background: 'rgba(26,26,26,0.07)', marginBottom: 6 }} />
              <div style={{ width: '30%', height: 10, background: 'rgba(26,26,26,0.04)' }} />
            </div>
            <div style={{ width: 70, height: 20, background: 'rgba(26,26,26,0.06)' }} />
          </div>
        ))}

        {/* Empty */}
        {!isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ImageOff size={32} style={{ color: 'rgba(26,26,26,0.15)' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              color: 'rgba(26,26,26,0.35)', margin: 0 }}>
              {search || typeFilter || pubFilter !== 'all'
                ? 'No projects match your filters'
                : 'No projects yet'}
            </p>
            {!search && !typeFilter && pubFilter === 'all' && (
              <button onClick={() => navigate('/admin/projects/new')}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--color-brand)', background: 'none',
                  border: '1px solid var(--color-brand)', cursor: 'pointer',
                  padding: '0.6rem 1.25rem', transition: 'all 0.2s' }}>
                Create first project
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!isLoading && projects.map((project, i) => (
          <motion.div key={project._id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="hidden md:grid gap-4 px-6 py-4 items-center"
            style={{
              gridTemplateColumns: '48px 1fr 120px 100px 80px 80px 48px',
              borderBottom: i < projects.length - 1 ? '1px solid rgba(26,26,26,0.05)' : 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,60,94,0.015)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Cover thumbnail */}
            <div style={{ width: 48, height: 36, overflow: 'hidden',
              background: 'rgba(26,26,26,0.06)', flexShrink: 0 }}>
              {project.coverImage?.url
                ? <img src={project.coverImage.url} alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <ImageOff size={14} style={{ margin: '11px auto', display: 'block',
                    color: 'rgba(26,26,26,0.2)' }} />
              }
            </div>

            {/* Title + slug */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500,
                  fontSize: '0.85rem', color: 'var(--color-ink)', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.title}
                </p>
                {project.featured && (
                  <Star size={11} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                color: 'rgba(26,26,26,0.35)', margin: '2px 0 0' }}>
                /{project.slug}
              </p>
            </div>

            <TypeBadge type={project.type} />

            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'rgba(26,26,26,0.5)', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.location}
            </span>

            {/* Publish badge */}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
              padding: '3px 8px',
              background: project.published ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
              color:      project.published ? '#16a34a' : '#ca8a04' }}>
              {project.published ? 'Live' : 'Draft'}
            </span>

            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              color: 'rgba(26,26,26,0.35)' }}>
              {format(parseISO(project.createdAt), 'd MMM yy')}
            </span>

            <RowActions
              project={project}
              onEdit={() => navigate(`/admin/projects/${project._id}/edit`)}
              onDelete={() => setToDelete(project)}
              onTogglePublish={() => handleTogglePublish(project)}
              isToggling={isToggling}
            />
          </motion.div>
        ))}

        {/* Mobile cards */}
        {!isLoading && projects.map((project, i) => (
          <motion.div key={`mob-${project._id}`}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="md:hidden flex items-center gap-4 px-4 py-4"
            style={{ borderBottom: i < projects.length - 1 ? '1px solid rgba(26,26,26,0.05)' : 'none' }}
          >
            <div style={{ width: 56, height: 42, overflow: 'hidden',
              background: 'rgba(26,26,26,0.06)', flexShrink: 0 }}>
              {project.coverImage?.url &&
                <img src={project.coverImage.url} alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: '0.85rem', color: 'var(--color-ink)', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={project.type} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                  padding: '3px 8px',
                  background: project.published ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                  color:      project.published ? '#16a34a' : '#ca8a04' }}>
                  {project.published ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
            <RowActions
              project={project}
              onEdit={() => navigate(`/admin/projects/${project._id}/edit`)}
              onDelete={() => setToDelete(project)}
              onTogglePublish={() => handleTogglePublish(project)}
              isToggling={isToggling}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
            color: 'rgba(26,26,26,0.4)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
              style={{ padding: '0.5rem 0.75rem', background: 'white',
                border: '1px solid rgba(26,26,26,0.1)', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                opacity: pagination.hasPrev ? 1 : 0.4, transition: 'all 0.2s' }}>
              <ChevronLeft size={15} style={{ color: 'var(--color-ink)' }} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
              style={{ padding: '0.5rem 0.75rem', background: 'white',
                border: '1px solid rgba(26,26,26,0.1)', cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                opacity: pagination.hasNext ? 1 : 0.4, transition: 'all 0.2s' }}>
              <ChevronRight size={15} style={{ color: 'var(--color-ink)' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {toDelete && (
          <ConfirmModal
            project={toDelete}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}