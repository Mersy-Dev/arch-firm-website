import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type InputSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  as?: 'input' | 'textarea';
  inputSize?: InputSize;
  className?: string;
}

type InputProps =
  | (BaseProps & { as?: 'input' } & InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & { as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>);

const sizes: Record<InputSize, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-3',
  lg: 'text-base px-4 py-3',
};

const base =
  'w-full rounded border bg-white text-ink-900 placeholder:text-ink-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

const errorCls = 'border-red-500 focus:ring-red-500';
const normalCls = 'border-ink-200 hover:border-ink-400';

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, hint, as = 'input', inputSize = 'md', className, ...props }, ref) => {
    const fieldCls = cn(base, sizes[inputSize], error ? errorCls : normalCls, className);
    const id = props.id ?? (props.name as string);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-800">
            {label}
          </label>
        )}

        {as === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            className={fieldCls}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            className={fieldCls}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && (
          <p id={`${id}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-ink-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;