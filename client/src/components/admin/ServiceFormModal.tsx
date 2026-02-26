import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Plus, Minus, RefreshCw, Layers } from 'lucide-react';
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  type Service,
} from '@/services/servicesApi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Props {
  service: Service | null;  // null = create mode
  onClose: () => void;
}

interface FormState {
  number: string;
  title: string;
  tagline: string;
  shortDesc: string;
  description: string;
  features: string[];
  deliverables: string[];
  image: string;
  isActive: boolean;
  order: number;
}

const EMPTY: FormState = {
  number: '', title: '', tagline: '', shortDesc: '',
  description: '', features: [''], deliverables: [''],
  image: '', isActive: true, order: 0,
};

// ─── Small helpers ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block',
      fontFamily: 'var(--font-body)', fontSize: '0.6rem',
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'rgba(26,26,26,0.45)', fontWeight: 600,
      marginBottom: '0.4rem',
    }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  background: 'rgba(26,26,26,0.02)',
  border: '1px solid rgba(26,26,26,0.1)',
  outline: 'none',
  fontFamily: 'var(--font-body)', fontSize: '0.83rem',
  color: 'var(--color-ink)',
  transition: 'border-color 0.18s',
  boxSizing: 'border-box' as const,
};

// ─── Dynamic list field (features / deliverables) ─────────────────────────────
function DynamicList({
  label, values, onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const add    = () => onChange([...values, '']);
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <Label>{label}</Label>
        <button
          type="button"
          onClick={add}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.6rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-gold)', fontWeight: 600,
            padding: 0,
          }}
        >
          <Plus size={11} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{
              width: 20, height: 20, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--color-gold)',
              }} />
            </div>
            <input
              type="text"
              value={v}
              onChange={e => update(i, e.target.value)}
              placeholder={`${label.replace(' *', '')} ${i + 1}`}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                style={{
                  width: 30, height: 30, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: '1px solid rgba(26,26,26,0.1)',
                  cursor: 'pointer', color: 'rgba(26,26,26,0.3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
                  (e.currentTarget as HTMLElement).style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.1)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.3)';
                }}
              >
                <Minus size={11} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function ServiceFormModal({ service, onClose }: Props) {
  const isEdit = !!service;
  const [form, setForm] = useState<FormState>(EMPTY);

  const [createService, { isLoading: creating }] = useCreateServiceMutation();
  const [updateService, { isLoading: updating }] = useUpdateServiceMutation();
  const saving = creating || updating;

  // Populate form when editing
  useEffect(() => {
    if (service) {
      setForm({
        number:      service.number,
        title:       service.title,
        tagline:     service.tagline,
        shortDesc:   service.shortDesc,
        description: service.description,
        features:    service.features.length ? service.features : [''],
        deliverables:service.deliverables.length ? service.deliverables : [''],
        image:       service.image,
        isActive:    service.isActive,
        order:       service.order,
      });
    } else {
      setForm(EMPTY);
    }
  }, [service]);

  const set = (key: keyof FormState, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    // Basic client-side guard
    if (!form.title.trim() || !form.number.trim() || !form.tagline.trim()) {
      toast.error('Number, title and tagline are required');
      return;
    }

    const payload = {
      ...form,
      features:    form.features.filter(f => f.trim()),
      deliverables:form.deliverables.filter(d => d.trim()),
    };

    try {
      if (isEdit && service) {
        await updateService({ id: service._id, data: payload }).unwrap();
        toast.success(`"${form.title}" updated`);
      } else {
        await createService(payload).unwrap();
        toast.success(`"${form.title}" created`);
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Something went wrong';
      toast.error(msg);
    }
  };

  return (  
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(10,14,20,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '1.5rem',
          overflowY: 'auto',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            width: '100%', maxWidth: 680,
            position: 'relative',
            boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
            marginTop: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Gold top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--color-gold)' }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: '1px solid rgba(26,26,26,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={16} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.55rem',
                    letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'var(--color-gold)', fontWeight: 600,
                  }}>
                    {isEdit ? 'Edit Service' : 'New Service'}
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: '1.25rem', color: 'var(--color-ink)',
                  margin: 0, lineHeight: 1.1,
                }}>
                  {isEdit ? service!.title : 'Create Service'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid rgba(26,26,26,0.1)',
                cursor: 'pointer', color: 'rgba(26,26,26,0.35)',
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.3)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.1)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.35)';
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Row: Number + Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <Label>Number *</Label>
                <input
                  type="text" value={form.number} placeholder="01"
                  onChange={e => set('number', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <input
                  type="number" value={form.order} min={0}
                  onChange={e => set('order', Number(e.target.value))}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Title *</Label>
              <input
                type="text" value={form.title} placeholder="Architectural Design"
                onChange={e => set('title', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
              />
            </div>

            {/* Tagline */}
            <div>
              <Label>Tagline *</Label>
              <input
                type="text" value={form.tagline} placeholder="From concept to construction"
                onChange={e => set('tagline', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
              />
            </div>

            {/* Short desc */}
            <div>
              <Label>Short Description *</Label>
              <textarea
                value={form.shortDesc}
                placeholder="One or two sentences for the services overview…"
                rows={2}
                onChange={e => set('shortDesc', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Full Description *</Label>
              <textarea
                value={form.description}
                placeholder="Detailed description shown in the service detail panel…"
                rows={4}
                onChange={e => set('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
              />
            </div>

            {/* Image URL */}
            <div>
              <Label>Image URL *</Label>
              <input
                type="url" value={form.image} placeholder="https://images.unsplash.com/…"
                onChange={e => set('image', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')}
              />
              {form.image && (
                <div style={{ marginTop: 8, height: 80, overflow: 'hidden', border: '1px solid rgba(26,26,26,0.07)' }}>
                  <img
                    src={form.image} alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            {/* Features + Deliverables side by side on wider screens */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <DynamicList
                label="Features *"
                values={form.features}
                onChange={v => set('features', v)}
              />
              <DynamicList
                label="Deliverables *"
                values={form.deliverables}
                onChange={v => set('deliverables', v)}
              />
            </div>

            {/* Active toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'rgba(26,26,26,0.02)',
              border: '1px solid rgba(26,26,26,0.07)',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  fontWeight: 500, color: 'var(--color-ink)',
                }}>
                  Visible on site
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                  color: 'rgba(26,26,26,0.38)', marginTop: 2,
                }}>
                  {form.isActive ? 'This service is currently live' : 'This service is hidden from visitors'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: form.isActive ? 'var(--color-gold)' : 'rgba(26,26,26,0.15)',
                  border: 'none', cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.25s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: form.isActive ? 22 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.25s',
                  display: 'block',
                }} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '0.6rem',
            padding: '1.1rem 1.75rem',
            borderTop: '1px solid rgba(26,26,26,0.07)',
            background: 'rgba(26,26,26,0.015)',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.7rem 1.4rem',
                background: 'transparent',
                border: '1px solid rgba(26,26,26,0.12)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.65rem',
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
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '0.7rem 1.75rem',
                background: 'var(--color-gold)', border: '1px solid var(--color-gold)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--color-ink)', fontWeight: 700,
                opacity: saving ? 0.75 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'filter 0.18s',
              }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.07)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
            >
              {saving && <RefreshCw size={12} className="animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}