'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';

import { cn } from '@/lib/utils';

import { SearchInput } from '@/components/search-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatStore } from '@/store/use-chat-store';

interface NavbarProps {
  /** Title displayed in the navbar */
  title?: string;
  /** Callback to toggle mobile sidebar */
  onMenuClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navbar — Top navigation bar for the dashboard.
 *
 * Features:
 * - Hamburger menu for mobile sidebar toggle
 * - Dynamic page title
 * - Search input
 * - Notification bell (placeholder for Milestone 12)
 * - User avatar area populated with session details
 */
export function Navbar({ title, onMenuClick, className }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { activeConversationId, messageSearchQuery, setMessageSearchQuery } = useChatStore();
  
  const user = session?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header
      className={cn(
        'bg-background/80 border-border sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm md:px-6',
        className
      )}
    >
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors md:hidden"
        aria-label="Toggle sidebar"
        id="mobile-sidebar-toggle"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      {title && (
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Messages inside active conversation */}
      {pathname === '/chat' && activeConversationId && (
        <div className="hidden w-full max-w-xs md:block">
          <SearchInput
            placeholder="Search messages..."
            value={messageSearchQuery}
            onSearch={setMessageSearchQuery}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:bg-accent relative rounded-lg p-2 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {/* Notification dot — will be dynamic in later milestones */}
        </button>

        {/* User Avatar */}
        <Avatar className="h-8 w-8 border border-border">
          {user?.image ? (
            <AvatarImage src={user.image} alt={user.name || 'User'} referrerPolicy="no-referrer" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
