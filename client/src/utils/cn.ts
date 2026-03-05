import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// Used in every component: className={cn('base-class', condition && 'extra', className)}
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }