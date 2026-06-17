'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Bot, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';

import { PageLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/chat');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <PageLoader />;
  }

  return (
    <div className="bg-radial from-orange-50 via-background to-background dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative flex min-h-screen flex-col overflow-hidden font-sans antialiased">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Decorative Orbs */}
      <div className="absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/3 -left-40 -z-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/5" />

      {/* Navbar */}
      <header className="border-border/40 bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary/25">
              <MessageCircle className="text-primary-foreground" size={20} />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">Nexora</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/signin')}
              className="text-sm font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="shadow-md shadow-primary/25"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
          <Sparkles size={14} className="animate-pulse" />
          <span>Real-time Messaging meets AI</span>
        </div>

        <h1 className="font-heading max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          The Premium Workspace for{' '}
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Conversational Flow
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
          Nexora combines lightning-fast peer messaging with an integrated Gemini AI assistant to elevate your workflow and streamline collaboration.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push('/auth/signin')}
            className="group px-8 py-6 text-base shadow-lg shadow-primary/25"
          >
            Get Started Free
            <ChevronRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-6 text-base"
          >
            Learn More
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-24 w-full scroll-mt-24">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Designed for Modern Teams
          </h2>
          <p className="text-muted-foreground mt-2">
            Packed with features, engineered for responsiveness.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-border/50 bg-background/50 relative overflow-hidden p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-heading mt-4 text-lg font-bold">Real-time Messaging</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Connect instantly with peer-to-peer chat. Share files, keep track of online status, and get instant delivery.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/50 bg-background/50 relative overflow-hidden p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <Bot size={24} />
              </div>
              <h3 className="font-heading mt-4 text-lg font-bold">Gemini AI Assistant</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Invoke Google Gemini directly in your chats. Translate messages, summarize conversations, and generate replies on the fly.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/50 bg-background/50 relative overflow-hidden p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <Sparkles size={24} />
              </div>
              <h3 className="font-heading mt-4 text-lg font-bold">High-Fidelity UI</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                A gorgeous dark/light interface built with polished tokens, fluid layout transitions, and glassmorphic micro-animations.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/40 mt-auto border-t bg-background/40 py-8 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
      </footer>
    </div>
  );
}
