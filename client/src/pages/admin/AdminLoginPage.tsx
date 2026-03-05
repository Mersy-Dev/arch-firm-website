import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '@/services/authApi';
import { setCredentials, selectIsAuthenticated } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// ─── Validation ────────────────────────────────────────────────────────────

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

// ─── Component ─────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const dispatch        = useAppDispatch();
  const navigate        = useNavigate();
  const location        = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  // Already logged in → straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const result = await login(data).unwrap();
      dispatch(
        setCredentials({
          user:         result.data.user,
          accessToken:  result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      toast.success(`Welcome back, ${result.data.user.name}`);
      console.log('Login successful:', result);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Invalid email or password';
      setServerError(msg);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-ink)' }}
    >
      {/* ── Left panel — decorative ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'var(--color-brand)' }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1200&q=70&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />

        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[150, 300, 450].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="900"
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <line x1="0" y1="900" x2="600" y2="0"
            stroke="rgba(201,168,76,0.08)" strokeWidth="1.5" />
        </svg>

        {/* Logo mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width: 28, height: 1, background: 'var(--color-gold)' }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.62rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                fontWeight: 500,
              }}
            >
              Admin Console
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              color: 'white',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            FORMA
            <br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>
              Architecture
            </em>
          </h1>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.7,
              maxWidth: '36ch',
            }}
          >
            "We shape our buildings; thereafter they shape us."
          </p>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              opacity: 0.6,
            }}
          >
            — Winston Churchill
          </span>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div style={{ width: 24, height: 1, background: 'var(--color-gold)' }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                fontWeight: 500,
              }}
            >
              FORMA Admin
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color: 'white',
                margin: '0 0 0.5rem',
                lineHeight: 1.1,
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Access the content management console
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 mb-6"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {serverError}
              </span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.email ? '#ef4444' : 'rgba(255,255,255,0.2)' }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@forma.studio"
                  {...register('email')}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)')}
                />
              </div>
              {errors.email && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  color: '#ef4444', marginTop: '0.35rem' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.password ? '#ef4444' : 'rgba(255,255,255,0.2)' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  style={{
                    width: '100%',
                    padding: '0.85rem 3rem 0.85rem 2.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.25)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  color: '#ef4444', marginTop: '0.35rem' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="relative overflow-hidden flex items-center justify-center gap-2 mt-2"
              style={{
                background:    busy ? 'rgba(201,168,76,0.6)' : 'var(--color-gold)',
                color:         'var(--color-ink)',
                fontFamily:    'var(--font-body)',
                fontWeight:    500,
                fontSize:      '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding:       '1rem',
                border:        'none',
                cursor:        busy ? 'not-allowed' : 'pointer',
                transition:    'filter 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { if (!busy) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
            >
              {busy ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="text-center mt-8"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.18)',
            }}
          >
            Access is restricted to authorised personnel only.
            <br />
            Contact your superadmin if you need an account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}