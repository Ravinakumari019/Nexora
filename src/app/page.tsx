'use client';

import { useState } from 'react';

import {
  Bot,
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Settings,
  Star,
  Trash2,
  User,
} from 'lucide-react';

import { Loader, PageLoader } from '@/components/loader';
import { Modal } from '@/components/modal';
import { SearchInput } from '@/components/search-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

/**
 * Design System Showcase — Milestone 2 verification page.
 *
 * This page displays all design system components for visual testing.
 * It will be removed or repurposed after verification.
 */
export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Nexora Design System
        </h1>
        <p className="text-muted-foreground text-lg">
          Component library and design token verification — Milestone 2
        </p>
        <div className="flex items-center gap-4 pt-2">
          <ThemeToggle />
          <Badge variant="outline">v0.2.0</Badge>
        </div>
      </div>

      <Separator />

      {/* ============ COLOR PALETTE ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {[
            { name: 'Primary', className: 'bg-primary' },
            { name: 'Secondary', className: 'bg-secondary' },
            { name: 'Background', className: 'bg-background border' },
            { name: 'Sidebar', className: 'bg-sidebar border' },
            { name: 'Muted', className: 'bg-muted' },
            { name: 'Accent', className: 'bg-accent' },
            { name: 'Destructive', className: 'bg-destructive' },
          ].map((color) => (
            <div key={color.name} className="space-y-1.5 text-center">
              <div
                className={`${color.className} border-border h-16 rounded-xl`}
              />
              <p className="text-xs font-medium">{color.name}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ============ TYPOGRAPHY ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Heading 1 — Poppins Bold</h1>
          <h2 className="text-3xl font-semibold">
            Heading 2 — Poppins Semibold
          </h2>
          <h3 className="text-2xl font-semibold">Heading 3 — Poppins</h3>
          <h4 className="text-xl font-semibold">Heading 4 — Poppins</h4>
          <p className="text-base">
            Body text — Inter. The quick brown fox jumps over the lazy dog.
            Nexora brings real-time messaging and AI together in one premium
            experience.
          </p>
          <p className="text-muted-foreground text-sm">
            Muted text — Used for secondary information and descriptions.
          </p>
          <code className="bg-muted font-mono rounded px-2 py-1 text-sm">
            Monospace — Geist Mono for code
          </code>
        </div>
      </section>

      <Separator />

      {/* ============ BUTTONS ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>
            <Plus size={16} />
            Primary
          </Button>
          <Button variant="secondary">
            <Star size={16} />
            Secondary
          </Button>
          <Button variant="outline">
            <Settings size={16} />
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">
            <Trash2 size={16} />
            Destructive
          </Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <Separator />

      {/* ============ INPUTS ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Inputs</h2>
        <div className="grid max-w-lg gap-4">
          <Input placeholder="Standard input" />
          <Input type="email" placeholder="Email address" />
          <Input disabled placeholder="Disabled input" />
          <SearchInput placeholder="Search conversations..." />
          <Textarea placeholder="Write a message..." rows={3} />
        </div>
      </section>

      <Separator />

      {/* ============ CARDS ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={18} className="text-primary" />
                Chat
              </CardTitle>
              <CardDescription>
                Real-time messaging with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Send messages, share files, and collaborate seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={18} className="text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Powered by Google Gemini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Get intelligent responses with streaming markdown support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} className="text-primary" />
                Premium
              </CardTitle>
              <CardDescription>Built for portfolios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Modern SaaS aesthetic with warm, elegant design tokens.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ============ AVATARS & BADGES ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatars & Badges</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/9.x/initials/svg?seed=Nexora" />
            <AvatarFallback>NX</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>

          <Separator orientation="vertical" className="h-8" />

          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <Separator />

      {/* ============ DROPDOWN ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dropdown Menu</h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Open Menu
            <ChevronRight size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User size={14} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings size={14} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 size={14} />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <Separator />

      {/* ============ MODAL ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create Conversation"
          description="Start a new conversation with a team member."
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                <Check size={16} />
                Create
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input placeholder="Conversation name" />
            <Textarea placeholder="Description (optional)" rows={2} />
          </div>
        </Modal>
      </section>

      <Separator />

      {/* ============ LOADING STATES ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading States</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-2 text-center">
            <Loader size={24} />
            <p className="text-muted-foreground text-xs">Spinner</p>
          </div>
          <div className="space-y-2 text-center">
            <Loader size={32} className="text-secondary" />
            <p className="text-muted-foreground text-xs">Large</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="space-y-2">
            <p className="text-xs font-medium">Skeleton</p>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoader(!showLoader)}
          >
            {showLoader ? 'Hide' : 'Show'} Page Loader
          </Button>
        </div>
        {showLoader && (
          <div className="border-border rounded-xl border">
            <PageLoader />
          </div>
        )}
      </section>

      <Separator />

      {/* ============ BORDER RADIUS ============ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Border Radius (16px base)</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { name: 'sm', className: 'rounded-sm' },
            { name: 'md', className: 'rounded-md' },
            { name: 'lg', className: 'rounded-lg' },
            { name: 'xl', className: 'rounded-xl' },
            { name: '2xl', className: 'rounded-2xl' },
            { name: '3xl', className: 'rounded-3xl' },
            { name: 'full', className: 'rounded-full' },
          ].map((r) => (
            <div key={r.name} className="space-y-1.5 text-center">
              <div
                className={`bg-primary/20 border-primary/30 h-16 w-16 border ${r.className}`}
              />
              <p className="text-xs font-medium">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="border-border border-t pt-8">
        <p className="text-muted-foreground text-sm">
          Nexora Design System — Milestone 2 ✓ All components verified.
        </p>
      </div>
    </main>
  );
}
