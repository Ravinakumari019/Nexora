import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoaderProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

/**
 * Loader — Animated spinner for loading states.
 *
 * Uses Lucide's Loader2 icon with a spin animation.
 * Defaults to primary color and 24px size.
 */
export function Loader({ size = 24, className, label = 'Loading' }: LoaderProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <Loader2
        className={cn('text-primary animate-spin', className)}
        size={size}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * PageLoader — Full-page centered loading spinner.
 * Used for route-level loading states (loading.tsx files).
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
      <Loader size={32} label="Loading page" />
    </div>
  );
}
