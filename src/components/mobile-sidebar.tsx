'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from '@/components/sidebar';

interface MobileSidebarProps {
  /** Whether the mobile sidebar is open */
  isOpen: boolean;
  /** Callback to close the sidebar */
  onClose: () => void;
}

/**
 * MobileSidebar — Wraps the Sidebar in a Sheet for mobile viewports.
 *
 * On desktop (md+), the Sidebar renders inline.
 * On mobile, it slides in from the left via the Sheet component.
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
