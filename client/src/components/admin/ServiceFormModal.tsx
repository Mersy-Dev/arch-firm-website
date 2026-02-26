import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Plus, Minus, RefreshCw, Layers, Upload, Link2, ImageIcon } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { baseApi } from '@/app/api';
import { useAppDispatch } from '@/app/hooks';
import type { Service } from '@/services/servicesApi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Props {
  service: Service | null;
  onClose: () => void;
}

interface FormState {
  number:       string;
  title:        string;
  tagline:      string;
  shortDesc:    string;
  description:  string;
  features:     string[];
  deliverables: string[];
  isActive:     boolean;
  order:        number;
}

const EMPTY: FormState = {
  number: '', title: '', tagline: '', shortDesc: '',
  description: '', features: [''], deliverables: [''],
  isActive: true, order: 0,
};

// ─── Small shared components ──────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.6rem',
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'rgba(26,26,26,0.45)', fontWeight: 600, marginBottom: '0.4rem',
    }}>
      {children}
      {required && <span style={{ color: 'var(--color-gold)', marginLeft: 3 }}>*</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem',
  background: 'rgba(26,26,26,0.02)', border: '1px solid rgba(26,26,26,0.1)',
  outline: 'none', fontFamily: 'var(--font-body)', fontSize: '0.83rem',
  color: 'var(--color-ink)', transition: 'border-color 0.18s', boxSizing: 'border-box',
};

// ─── Dynamic list (features / deliverables) ───────────────────────────────────
function DynamicList({ label, values, onChange }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
}) {
  const update = (i: number, val: string) => { const n = [...values]; n[i] = val; onChange(n); };
  const add    = () => onChange([...values, '']);
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <Label>{label}</Label>
        <button type="button" onClick={add} style={{
          display: 'flex', alignItems: 'center', gap: 4, background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
          fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-gold)', fontWeight: 600, padding: 0,
        }}>
          <Plus size={11} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{ width: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-gold)' }} />
            </div>
            <input type="text" value={v} onChange={e => update(i, e.target.value)}
              placeholder={`${label} ${i + 1}`} style={{ ...inputStyle, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
            {values.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{
                width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'none', border: '1px solid rgba(26,26,26,0.1)',
                cursor: 'pointer', color: 'rgba(26,26,26,0.3)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.3)'; }}
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

// ─── Image field ──────────────────────────────────────────────────────────────
type ImageMode = 'upload' | 'url';

function ImageField({ file, setFile, urlValue, setUrlValue, existingUrl }: {
  file: File | null;
  setFile: (f: File | null) => void;
  urlValue: string;
  setUrlValue: (u: string) => void;
  existingUrl?: string;
}) {
  const fileRef               = useRef<HTMLInputElement>(null);
  const [mode, setMode]       = useState<ImageMode>('upload');
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [dragging, setDragging] = useState(false);

  // Build object-URL preview when a local file is chosen
  useEffect(() => {
    if (!file) { setPreview(existingUrl ?? null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, existingUrl]);

  const validate = (f: File): boolean => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return false; }
    if (f.size > 8 * 1024 * 1024)    { toast.error('Image must be under 8 MB');    return false; }
    return true;
  };

  const handleFile = (f: File) => {
    if (!validate(f)) return;
    setFile(f);
    setUrlValue('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // Preview src: local file → URL fallback → existing image
  const previewSrc = file ? preview : (urlValue || existingUrl || null);

  return (
    <div>
      {/* Label row with mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <Label required>Image</Label>
        <div style={{ display: 'flex', border: '1px solid rgba(26,26,26,0.1)', overflow: 'hidden' }}>
          {(['upload', 'url'] as ImageMode[]).map((m, i) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px',
              background: mode === m ? 'var(--color-ink)' : 'transparent',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.58rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: mode === m ? 'white' : 'rgba(26,26,26,0.4)',
              transition: 'all 0.15s',
              borderRight: i === 0 ? '1px solid rgba(26,26,26,0.1)' : 'none',
            }}>
              {m === 'upload' ? <Upload size={10} /> : <Link2 size={10} />}
              {m === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'upload' ? (
        /* ── Drag-and-drop / click zone ── */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragging ? 'var(--color-gold)' : 'rgba(26,26,26,0.15)'}`,
            background: dragging ? 'rgba(201,168,76,0.04)' : 'rgba(26,26,26,0.02)',
            cursor: 'pointer', transition: 'all 0.18s',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {previewSrc ? (
            /* ── Preview with replace overlay ── */
            <div style={{ position: 'relative' }}>
              <img src={previewSrc} alt="preview"
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />

              {/* Hover overlay */}
              <div
                className="group"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(10,14,20,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
              >
                <Upload size={20} style={{ color: 'white' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                  color: 'white', letterSpacing: '0.1em' }}>
                  Click or drag to replace
                </span>
              </div>

              {/* Clear button */}
              <button type="button" onClick={e => {
                e.stopPropagation();
                setFile(null); setPreview(null); setUrlValue('');
              }} style={{
                position: 'absolute', top: 8, right: 8,
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(10,14,20,0.75)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}>
                <X size={12} />
              </button>

              {/* File name pill */}
              {file && (
                <div style={{
                  position: 'absolute', bottom: 8, left: 8,
                  background: 'rgba(10,14,20,0.72)', backdropFilter: 'blur(4px)',
                  padding: '3px 10px',
                  fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  color: 'rgba(255,255,255,0.8)', maxWidth: '80%',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </div>
              )}
            </div>
          ) : (
            /* ── Empty drop zone ── */
            <div style={{
              padding: '2.25rem 1rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 48, height: 48,
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ImageIcon size={20} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                  color: 'var(--color-ink)', margin: '0 0 4px', fontWeight: 500 }}>
                  Drop image here, or click to browse
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  color: 'rgba(26,26,26,0.35)', margin: 0 }}>
                  JPG, PNG, WebP · max 8 MB · 4:5 ratio recommended
                </p>
              </div>
            </div>
          )}

          <input ref={fileRef} type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </div>
      ) : (
        /* ── URL input ── */
        <div>
          <input type="url" value={urlValue}
            onChange={e => { setUrlValue(e.target.value); setFile(null); }}
            placeholder="https://images.unsplash.com/…"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
          {(urlValue || existingUrl) && (
            <div style={{ marginTop: 8, height: 110, overflow: 'hidden',
              border: '1px solid rgba(26,26,26,0.07)' }}>
              <img src={urlValue || existingUrl} alt="URL preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ServiceFormModal({ service, onClose }: Props) {
  const isEdit  = !!service;
  const token   = useAppSelector(state => state.auth.token);
  const dispatch = useAppDispatch();

  const [form,      setForm]      = useState<FormState>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl,  setImageUrl]  = useState('');
  const [saving,    setSaving]    = useState(false);

  // Populate on edit
  useEffect(() => {
    if (service) {
      setForm({
        number:      service.number,
        title:       service.title,
        tagline:     service.tagline,
        shortDesc:   service.shortDesc,
        description: service.description,
        features:    service.features.length  ? service.features    : [''],
        deliverables:service.deliverables.length ? service.deliverables : [''],
        isActive:    service.isActive,
        order:       service.order,
      });
      setImageUrl(service.image ?? '');
    } else {
      setForm(EMPTY);
      setImageFile(null);
      setImageUrl('');
    }
  }, [service]);

  const set = (key: keyof FormState, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    // Basic validation
    if (!form.title.trim())   { toast.error('Title is required');   return; }
    if (!form.number.trim())  { toast.error('Number is required');  return; }
    if (!form.tagline.trim()) { toast.error('Tagline is required'); return; }

    const hasImage = imageFile || imageUrl || (isEdit && service?.image);
    if (!hasImage) { toast.error('Please add a service image'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('number',      form.number);
      fd.append('title',       form.title);
      fd.append('tagline',     form.tagline);
      fd.append('shortDesc',   form.shortDesc);
      fd.append('description', form.description);
      fd.append('features',    JSON.stringify(form.features.filter(f => f.trim())));
      fd.append('deliverables',JSON.stringify(form.deliverables.filter(d => d.trim())));
      fd.append('isActive',    String(form.isActive));
      fd.append('order',       String(form.order));

      if (imageFile) {
        fd.append('image', imageFile);        // actual file — multer picks this up
      } else if (imageUrl) {
        fd.append('image', imageUrl);         // URL string fallback
      }
      // In edit mode with no new image: don't append — controller keeps existing

      const url    = `${import.meta.env.VITE_API_URL}/services${isEdit ? `/${service!._id}` : ''}`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        // Do NOT set Content-Type — browser sets it with the correct multipart boundary
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Request failed');

      // Invalidate RTK Query 'Service' tag so AdminServices + ServicesPage refetch
      dispatch(baseApi.util.invalidateTags(['Service']));

      toast.success(`"${form.title}" ${isEdit ? 'updated' : 'created'}`);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(10,14,20,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '1.5rem', overflowY: 'auto',
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
            background: 'white', width: '100%', maxWidth: 680,
            position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
            marginTop: '1rem', marginBottom: '1rem',
          }}
        >
          {/* Gold top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--color-gold)' }} />

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: '1px solid rgba(26,26,26,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38,
                background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={16} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.55rem',
                    letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'var(--color-gold)', fontWeight: 600 }}>
                    {isEdit ? 'Edit Service' : 'New Service'}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: '1.25rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.1 }}>
                  {isEdit ? service!.title : 'Create Service'}
                </h2>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid rgba(26,26,26,0.1)', cursor: 'pointer',
              color: 'rgba(26,26,26,0.35)', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.35)'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Number + Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <Label required>Number</Label>
                <input type="text" value={form.number} placeholder="01"
                  onChange={e => set('number', e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
              </div>
              <div>
                <Label>Display Order</Label>
                <input type="number" value={form.order} min={0}
                  onChange={e => set('order', Number(e.target.value))} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label required>Title</Label>
              <input type="text" value={form.title} placeholder="Architectural Design"
                onChange={e => set('title', e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
            </div>

            {/* Tagline */}
            <div>
              <Label required>Tagline</Label>
              <input type="text" value={form.tagline} placeholder="From concept to construction"
                onChange={e => set('tagline', e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
            </div>

            {/* Short desc */}
            <div>
              <Label required>Short Description</Label>
              <textarea value={form.shortDesc} rows={2}
                placeholder="One or two sentences for the services overview…"
                onChange={e => set('shortDesc', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
            </div>

            {/* Description */}
            <div>
              <Label required>Full Description</Label>
              <textarea value={form.description} rows={4}
                placeholder="Detailed description shown in the service detail panel…"
                onChange={e => set('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(26,60,94,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(26,26,26,0.1)')} />
            </div>

            {/* ── Image field ── */}
            <ImageField
              file={imageFile}         setFile={setImageFile}
              urlValue={imageUrl}      setUrlValue={setImageUrl}
              existingUrl={isEdit ? service!.image : undefined}
            />

            {/* Features + Deliverables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <DynamicList label="Features"    values={form.features}     onChange={v => set('features', v)} />
              <DynamicList label="Deliverables" values={form.deliverables} onChange={v => set('deliverables', v)} />
            </div>

            {/* Active toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'rgba(26,26,26,0.02)', border: '1px solid rgba(26,26,26,0.07)',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  fontWeight: 500, color: 'var(--color-ink)' }}>Visible on site</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                  color: 'rgba(26,26,26,0.38)', marginTop: 2 }}>
                  {form.isActive ? 'This service is currently live' : 'Hidden from visitors'}
                </div>
              </div>
              <button type="button" onClick={() => set('isActive', !form.isActive)} style={{
                width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                background: form.isActive ? 'var(--color-gold)' : 'rgba(26,26,26,0.15)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: form.isActive ? 22 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.25s', display: 'block',
                }} />
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '0.6rem', padding: '1.1rem 1.75rem',
            borderTop: '1px solid rgba(26,26,26,0.07)',
            background: 'rgba(26,26,26,0.015)',
          }}>
            <button onClick={onClose} style={{
              padding: '0.7rem 1.4rem', background: 'transparent',
              border: '1px solid rgba(26,26,26,0.12)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(26,26,26,0.45)', transition: 'all 0.18s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.45)'; }}
            >
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: '0.7rem 1.75rem',
              background: 'var(--color-gold)', border: '1px solid var(--color-gold)',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-ink)', fontWeight: 700,
              opacity: saving ? 0.75 : 1,
              display: 'flex', alignItems: 'center', gap: 7, transition: 'filter 0.18s',
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