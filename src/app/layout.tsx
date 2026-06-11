import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';

import './globals.css';

/**
 * Inter — Body font.
 * Clean, modern sans-serif optimized for screen readability.
 * Loaded as CSS variable `--font-inter` for Tailwind's `font-sans`.
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Poppins — Heading font.
 * Geometric sans-serif with a warm, premium feel.
 * Loaded as CSS variable `--font-poppins` for Tailwind's `font-heading`.
 */
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

/**
 * Geist Mono — Code font.
 * Used for inline code, code blocks, and terminal-style text.
 */
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nexora — Real-time Messaging Meets AI',
    template: '%s | Nexora',
  },
  description:
    'Nexora is a modern AI-powered chat application featuring real-time messaging, Google Gemini AI integration, and a premium SaaS experience.',
  keywords: [
    'chat',
    'ai',
    'messaging',
    'real-time',
    'gemini',
    'nexora',
    'saas',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
