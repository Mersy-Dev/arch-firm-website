import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Upload, X, Plus, AlertCircle, ChevronLeft,
  Image as ImageIcon, Star, Eye, Loader,
} from 'lucide-react';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectByIdQuery,
  useDeleteProjectImageMutation,
} from '@/services/projectsApi';
import { PROJECT_TYPES } from '@/types/project.types';
import type { ProjectType } from '@/types/project.types';

// ─── Form schema ─────────────────────────────────────────────────────────────
const formSchema = z.object({
  title:       z.string().min(2, 'Title is required').max(150),
  type:        z.enum(PROJECT_TYPES, { error: 'Select a project type' }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clientBrief: z.string().optional(),
  approach:    z.string().optional(),
  location:    z.string().min(2, 'Location is required'),
  area:        z.string().optional(),
  completedAt: z.string().min(1, 'Completion date is required'),
  materials:   z.string().optional(),
  services:    z.string().optional(),
  featured:    z.boolean().default(false),
  published:   z.boolean().default(false),
  sortOrder:   z.string().default('0'),
  seoTitle:    z.string().max(70).optional(),
  seoDesc:     z.string().max(160).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.88rem',
  background: 'white',
  border: '1px solid rgba(26,26,26,0.12)',
  color: 'var(--color-ink)',
  outline: 'none',
  transition: 'border-color 0.2s',
} as React.CSSProperties;

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, required, hint, children }: {
  label:     string;
  error?:    string;
  required?: boolean;
  hint?:     string;
  children:  React.ReactNode;
}) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
        color: 'rgba(26,26,26,0.55)', display: 'block', marginBottom: '0.45rem' }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
          color: 'rgba(26,26,26,0.35)', marginTop: '0.3rem' }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          color: '#ef4444', marginTop: '0.3rem', display: 'flex',
          alignItems: 'center', gap: 4 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Image drop zone ──────────────────────────────────────────────────────────
function ImageDropZone({ label, file, existing, onFile, onClear, required, hint }: {
  label:    string;
  file:     File | null;
  existing?: string;
  onFile:   (f: File) => void;
  onClear:  () => void;
  required?: boolean;
  hint?:    string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : existing;

  return (
    <div>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
        color: 'rgba(26,26,26,0.55)', display: 'block', marginBottom: '0.45rem' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>

      {preview ? (
        <div className="relative" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
          <img src={preview} alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(26,26,26,0.55)' }}>
            <button type="button" onClick={() => ref.current?.click()}
              style={{ background: 'white', border: 'none', cursor: 'pointer',
                padding: '0.5rem 1rem', fontFamily: 'var(--font-body)',
                fontSize: '0.72rem', color: 'var(--color-ink)' }}>
              Replace
            </button>
            {!required && (
              <button type="button" onClick={onClear}
                style={{ background: '#ef4444', border: 'none', cursor: 'pointer',
                  padding: '0.5rem 1rem', fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem', color: 'white' }}>
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ border: '2px dashed rgba(26,26,26,0.15)', padding: '3rem',
            background: 'rgba(26,26,26,0.01)', transition: 'all 0.2s' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(26,60,94,0.02)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.15)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,26,0.01)';
          }}
        >
          <Upload size={20} style={{ color: 'rgba(26,26,26,0.3)' }} />
          <div className="text-center">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'rgba(26,26,26,0.5)', margin: 0 }}>
              Click to upload
            </p>
            {hint && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                color: 'rgba(26,26,26,0.3)', margin: '0.25rem 0 0' }}>
                {hint}
              </p>
            )}
          </div>
        </div>
      )}

      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
export default function AdminProjectForm() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading: loadingProject } =
    useGetProjectByIdQuery(id!, { skip: !isEdit });

  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [deleteImage,   { isLoading: deletingImg }] = useDeleteProjectImageMutation();

  const project = existing?.data.project;
  const isBusy  = creating || updating;

  const {
    register, handleSubmit, reset, control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      featured:  false,
      published: false,
      sortOrder: '0',
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (project) {
      reset({
        title:       project.title,
        type:        project.type,
        description: project.description,
        clientBrief: project.clientBrief ?? '',
        approach:    project.approach    ?? '',
        location:    project.location,
        area:        project.area ? String(project.area) : '',
        completedAt: project.completedAt.split('T')[0],
        materials:   project.materials.join(', '),
        services:    project.services.join(', '),
        featured:    project.featured,
        published:   project.published,
        sortOrder:   String(project.sortOrder),
        seoTitle:    project.seo?.metaTitle       ?? '',
        seoDesc:     project.seo?.metaDescription ?? '',
      });
    }
  }, [project, reset]);

  const onSubmit = async (values: FormValues) => {
    // Cover image required on create
    if (!isEdit && !coverFile) {
      toast.error('Cover image is required');
      return;
    }

    const fd = new FormData();

    // Append all text fields
    const textData = {
      title:       values.title,
      type:        values.type,
      description: values.description,
      clientBrief: values.clientBrief ?? '',
      approach:    values.approach    ?? '',
      location:    values.location,
      area:        values.area ? Number(values.area) : undefined,
      completedAt: values.completedAt,
      materials:   (values.materials ?? '').split(',').map(s => s.trim()).filter(Boolean),
      services:    (values.services  ?? '').split(',').map(s => s.trim()).filter(Boolean),
      featured:    values.featured,
      published:   values.published,
      sortOrder:   Number(values.sortOrder) || 0,
      seo: {
        metaTitle:       values.seoTitle ?? '',
        metaDescription: values.seoDesc  ?? '',
      },
    };
    fd.append('data', JSON.stringify(textData));

    // Append files
    if (coverFile)         fd.append('coverImage', coverFile);
    galleryFiles.forEach(f => fd.append('images', f));

    try {
      if (isEdit) {
        await updateProject({ id: id!, formData: fd }).unwrap();
        toast.success('Project updated');
      } else {
        await createProject(fd).unwrap();
        toast.success('Project created');
      }
      navigate('/admin/projects');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Something went wrong';
      toast.error(msg);
    }
  };

  const handleDeleteGalleryImage = async (publicId: string) => {
    if (!id) return;
    try {
      await deleteImage({ id, publicId }).unwrap();
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  if (isEdit && loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={20} className="animate-spin" style={{ color: 'rgba(26,26,26,0.3)' }} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="mb-8">
        <button onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-1.5 mb-5"
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            letterSpacing: '0.1em', color: 'rgba(26,26,26,0.4)',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.4)')}>
          <ChevronLeft size={14} />
          Back to Projects
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 22, height: 1, background: 'var(--color-gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--color-gold)', fontWeight: 500 }}>
            {isEdit ? 'Edit' : 'New'}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--color-ink)',
          margin: 0, lineHeight: 1.1 }}>
          {isEdit ? `Edit: ${project?.title ?? '…'}` : 'New Project'}
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-8">

          {/* ── Section: Core details ── */}
          <Section title="Core Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="md:col-span-2">
                <Field label="Title" required error={errors.title?.message}>
                  <input {...register('title')} style={inputStyle}
                    placeholder="e.g. Clifton House Renovation"
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.title ? '#ef4444' : 'rgba(26,26,26,0.12)')} />
                </Field>
              </div>

              <Field label="Project Type" required error={errors.type?.message}>
                <select {...register('type')} style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')}>
                  <option value="">Select type…</option>
                  {PROJECT_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Location" required error={errors.location?.message}>
                <input {...register('location')} style={inputStyle}
                  placeholder="e.g. Cape Town, South Africa"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>

              <Field label="Completion Date" required error={errors.completedAt?.message}>
                <input {...register('completedAt')} type="date" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>

              <Field label="Floor Area (m²)" error={errors.area?.message}
                hint="Optional — leave blank if not applicable">
                <input {...register('area')} type="number" style={inputStyle}
                  placeholder="e.g. 450"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>

              <Field label="Sort Order" hint="Lower numbers appear first">
                <input {...register('sortOrder')} type="number" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>
            </div>

            <Field label="Description" required error={errors.description?.message}>
              <textarea {...register('description')} rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Project overview visible on the portfolio page…"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                onBlur={e => (e.currentTarget.style.borderColor = errors.description ? '#ef4444' : 'rgba(26,26,26,0.12)')} />
            </Field>

            <Field label="Client Brief" error={errors.clientBrief?.message}>
              <textarea {...register('clientBrief')} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="What the client asked for…"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
            </Field>

            <Field label="Our Approach" error={errors.approach?.message}>
              <textarea {...register('approach')} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="How your studio approached the brief…"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
            </Field>
          </Section>

          {/* ── Section: Tags ── */}
          <Section title="Tags & Services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Materials" hint="Comma-separated, e.g. Concrete, Oak, Rebar">
                <input {...register('materials')} style={inputStyle}
                  placeholder="Concrete, Oak, Glass…"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>
              <Field label="Services" hint="Comma-separated services involved">
                <input {...register('services')} style={inputStyle}
                  placeholder="Architectural Design, Interiors…"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>
            </div>
          </Section>

          {/* ── Section: Images ── */}
          <Section title="Images">
            <ImageDropZone
              label="Cover Image"
              required
              hint="JPEG, PNG or WebP — max 10MB. 16:9 ratio recommended."
              file={coverFile}
              existing={project?.coverImage?.url}
              onFile={setCoverFile}
              onClear={() => setCoverFile(null)}
            />

            {/* Gallery */}
            <div className="mt-6">
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                color: 'rgba(26,26,26,0.55)', display: 'block', marginBottom: '0.45rem' }}>
                Gallery Images
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Existing gallery images */}
                {project?.images?.map(img => (
                  <div key={img.publicId} className="relative group"
                    style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'rgba(26,26,26,0.05)' }}>
                    <img src={img.url} alt={img.caption ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button"
                      onClick={() => handleDeleteGalleryImage(img.publicId)}
                      disabled={deletingImg}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: '#ef4444', border: 'none', cursor: 'pointer',
                        width: 22, height: 22, display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                      <X size={11} style={{ color: 'white' }} />
                    </button>
                  </div>
                ))}

                {/* New gallery files preview */}
                {galleryFiles.map((f, i) => (
                  <div key={i} className="relative group"
                    style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                    <img src={URL.createObjectURL(f)} alt={f.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button"
                      onClick={() => setGalleryFiles(gs => gs.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: '#ef4444', border: 'none', cursor: 'pointer',
                        width: 22, height: 22, display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                      <X size={11} style={{ color: 'white' }} />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                <button type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2"
                  style={{ aspectRatio: '4/3', border: '2px dashed rgba(26,26,26,0.15)',
                    background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(26,60,94,0.02)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,26,26,0.15)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}>
                  <Plus size={16} style={{ color: 'rgba(26,26,26,0.3)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                    color: 'rgba(26,26,26,0.35)' }}>Add images</span>
                </button>
              </div>

              <input ref={galleryInputRef} type="file" multiple
                accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => {
                  if (e.target.files) {
                    setGalleryFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }} />
            </div>
          </Section>

          {/* ── Section: SEO ── */}
          <Section title="SEO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Meta Title" hint="Max 70 characters" error={errors.seoTitle?.message}>
                <input {...register('seoTitle')} style={inputStyle}
                  placeholder="Leave blank to use project title"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>
              <Field label="Meta Description" hint="Max 160 characters" error={errors.seoDesc?.message}>
                <input {...register('seoDesc')} style={inputStyle}
                  placeholder="Brief summary for search engines"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)')} />
              </Field>
            </div>
          </Section>

          {/* ── Section: Visibility ── */}
          <Section title="Visibility">
            <div className="flex flex-col gap-4">
              <Controller control={control} name="published" render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  icon={Eye}
                  label="Published"
                  description="Visible on the public portfolio page"
                  accentColor="#16a34a"
                />
              )} />
              <Controller control={control} name="featured" render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  icon={Star}
                  label="Featured"
                  description="Highlighted in the homepage and portfolio hero"
                  accentColor="var(--color-gold)"
                />
              )} />
            </div>
          </Section>

          {/* ── Submit row ── */}
          <div className="flex items-center gap-4 pt-2 pb-8">
            <button type="submit" disabled={isBusy}
              className="flex items-center gap-2"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
                padding: '0.95rem 2.5rem',
                background: isBusy ? 'rgba(26,60,94,0.5)' : 'var(--color-brand)',
                color: 'white', border: 'none',
                cursor: isBusy ? 'not-allowed' : 'pointer', transition: 'filter 0.2s' }}
              onMouseEnter={e => { if (!isBusy) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}>
              {isBusy && <Loader size={13} className="animate-spin" />}
              {isBusy
                ? isEdit ? 'Saving…' : 'Creating…'
                : isEdit ? 'Save Changes' : 'Create Project'
              }
            </button>

            <button type="button" onClick={() => navigate('/admin/projects')}
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.45)', background: 'none',
                border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.45)')}>
              Cancel
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5 p-6 md:p-8"
      style={{ background: 'white', border: '1px solid rgba(26,26,26,0.07)' }}>
      <div className="flex items-center gap-3 pb-4"
        style={{ borderBottom: '1px solid rgba(26,26,26,0.06)' }}>
        <div style={{ width: 16, height: 1, background: 'var(--color-gold)' }} />
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
          letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
          color: 'rgba(26,26,26,0.45)', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, icon: Icon, label, description, accentColor }: {
  checked:     boolean;
  onChange:    (v: boolean) => void;
  icon:        React.ElementType;
  label:       string;
  description: string;
  accentColor: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between p-4 w-full text-left"
      style={{ background: checked ? `${accentColor}08` : 'rgba(26,26,26,0.02)',
        border: `1px solid ${checked ? accentColor + '30' : 'rgba(26,26,26,0.08)'}`,
        cursor: 'pointer', transition: 'all 0.3s' }}>
      <div className="flex items-center gap-3">
        <Icon size={16} style={{ color: checked ? accentColor : 'rgba(26,26,26,0.3)',
          transition: 'color 0.3s' }} />
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            color: 'rgba(26,26,26,0.45)', margin: '2px 0 0' }}>{description}</p>
        </div>
      </div>
      {/* Pill toggle */}
      <div style={{ width: 40, height: 22, borderRadius: 11, flexShrink: 0,
        background: checked ? accentColor : 'rgba(26,26,26,0.15)',
        transition: 'background 0.3s', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 3, width: 16, height: 16,
          borderRadius: '50%', background: 'white',
          transition: 'left 0.3s',
          left: checked ? 21 : 3 }} />
      </div>
    </button>
  );
}