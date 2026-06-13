'use client';

import { useCallback, useState } from 'react';

import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Callback fired on value change (debounced externally if needed) */
  onSearch?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Controlled value */
  value?: string;
}

/**
 * SearchInput — Styled search input with icon and clear button.
 *
 * Designed for sidebar search, user search, and message search.
 * Renders as a controlled or uncontrolled input with visual feedback.
 */
export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  className,
  value: controlledValue,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onSearch?.(newValue);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        size={16}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn(
          'bg-muted/50 border-border text-foreground placeholder:text-muted-foreground',
          'h-9 w-full rounded-lg border pl-9 pr-8 text-sm',
          'focus:border-primary focus:ring-primary/20 transition-colors focus:outline-none focus:ring-2'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
