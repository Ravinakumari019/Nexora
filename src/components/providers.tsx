import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Providers — Wraps the entire application with all required context providers.
 *
 * Architecture Decision:
 * - Server Component that composes client providers.
 * - ThemeProvider (next-themes): manages light/dark mode with localStorage persistence.
 * - TooltipProvider (shadcn): required for tooltip components to work.
 * - Toaster (sonner): global toast notification container.
 * - Additional providers (Auth, Socket, Zustand) will be added in later milestones.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delay={300}>
        {children}
      </TooltipProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-inter)',
          },
        }}
      />
    </ThemeProvider>
  );
}
