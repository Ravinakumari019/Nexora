'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { MobileSidebar } from '@/components/mobile-sidebar';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determine navbar title based on active path
  let pageTitle = 'Dashboard';
  if (pathname.startsWith('/chat')) {
    pageTitle = 'Chat Workspace';
  } else if (pathname.startsWith('/ai')) {
    pageTitle = 'AI Assistant';
  } else if (pathname.startsWith('/settings')) {
    pageTitle = 'Settings';
  } else if (pathname.startsWith('/profile')) {
    pageTitle = 'Profile';
  }

  return (
    <div className="bg-background text-foreground flex h-screen w-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden h-full md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Navbar
          title={pageTitle}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
