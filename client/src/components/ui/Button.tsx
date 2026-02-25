import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

type Variant = 'primary'|'secondary'|'outline'|'ghost'|'gold';
type Size    = 'sm'|'md'|'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean;
  href?: string; external?: string;
}

const variants: Record<Variant, string> = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-ink-900 text-white hover:bg-ink-700',
  outline:   'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white',
  ghost:     'text-ink-500 hover:text-ink-900 hover:bg-ink-100',
  gold:      'bg-gold-500 text-white hover:bg-gold-600',
};
const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2', md: 'text-sm px-6 py-3', lg: 'text-base px-8 py-4'
};
const base = 'inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant='primary', size='md', loading, href, external, children, className, disabled, ...props }, ref) => {
    const cls = cn(base, variants[variant], sizes[size], className);
    const content = loading ? 'Loading...' : children;
    if (href) return <Link to={href} className={cls}>{content}</Link>;
    if (external) return <a href={external} target="_blank" rel="noopener noreferrer" className={cls}>{content}</a>;
    return <button ref={ref} className={cls} disabled={disabled || loading} {...props}>{content}</button>;
  }
);
Button.displayName = 'Button';
export default Button;