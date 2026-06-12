'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

import {
  Bot,
  ChevronLeft,
  MessageCircle,
  Settings,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Sidebar navigation item configuration.
 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'AI Assistant', href: '/ai', icon: Bot },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar — Main navigation sidebar for the dashboard.
 *
 * Features:
 * - Collapsible (icon-only mode)
 * - Active route highlighting using coral primary
 * - Warm cream background matching Nexora palette
 * - ThemeToggle at the bottom
 * - Smooth width transition animation
 */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-sidebar border-border flex h-full flex-col border-r transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Header */}
      <div className="border-border flex h-16 items-center border-b px-4">
        <Link
          href="/"
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <MessageCircle className="text-primary-foreground" size={18} />
          </div>
          {!collapsed && (
            <span className="font-heading text-lg font-semibold tracking-tight">
              Nexora
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-border space-y-3 border-t px-3 py-4">
        {/* Theme Toggle */}
        <div
          className={cn(
            'flex',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          {!collapsed && <ThemeToggle />}
        </div>

        {/* Collapse Button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'text-muted-foreground hover:text-foreground hover:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
            collapsed && 'justify-center'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={20}
            className={cn(
              'shrink-0 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
