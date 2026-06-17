'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import { useEffect } from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SocketProvider } from '@/components/socket-provider';

/**
 * Providers — Wraps the entire application with all required context providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedAccent = localStorage.getItem('nexora-accent');
    if (savedAccent) {
      document.documentElement.setAttribute('data-accent', savedAccent);
    }
  }, []);

  return (
    <SessionProvider>
      <SocketProvider>
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
      </SocketProvider>
    </SessionProvider>
  );
}


