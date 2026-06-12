/**
 * Components — Barrel export for all custom (non-shadcn) components.
 *
 * Import custom components from '@/components' instead of individual files.
 * shadcn/ui primitives are imported directly from '@/components/ui/[name]'.
 */

// Layout
export { Sidebar } from './sidebar';
export { Navbar } from './navbar';
export { MobileSidebar } from './mobile-sidebar';

// Feedback
export { Loader, PageLoader } from './loader';
export { Modal } from './modal';

// Input
export { SearchInput } from './search-input';

// Theme
export { ThemeToggle } from './theme-toggle';
export { ThemeProvider } from './theme-provider';

// Providers
export { Providers } from './providers';
