'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Settings,
  LogOut,
  Receipt,
  Menu,
  X,
  ChevronRight,
  User,
} from 'lucide-react';
import { dashboardPathForRole } from '@/lib/dashboard-path';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dashboardHref = user ? dashboardPathForRole(user.role) : '/dashboard';

  useEffect(() => {
    if (user?.mustChangePassword && pathname !== '/force-change-password') {
      router.push('/force-change-password');
    }
  }, [user, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: dashboardHref, label: 'Overview', icon: LayoutDashboard },
    { href: '/expenses', label: 'My Expenses', icon: CreditCard },
    ...(user?.role === 'ADMIN' || user?.role === 'MANAGER'
      ? [{ href: '/approvals', label: 'Approvals', icon: ClipboardCheck }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          { href: '/users', label: 'Users', icon: Users },
          { href: '/settings', label: 'Settings', icon: Settings },
        ]
      : []),
  ];

  const isNavActive = (href: string) => {
    if (href === dashboardHref) return pathname === href || pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Receipt className="size-4.5" />
          </div>
          <div className="leading-none">
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
              Finance Hub
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">
              Odoo × VIT
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-primary" />
              )}
              <item.icon className={`size-4 transition-colors ${active ? 'text-primary' : 'group-hover:text-foreground'}`} />
              <span>{item.label}</span>
              {active && <ChevronRight className="ml-auto size-3 opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 mb-2">
          <div className="size-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <User className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5 tracking-wide">
              {user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-lg text-xs font-medium"
        >
          <LogOut className="mr-2 size-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  const currentPage = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur-sm">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="size-4" />
            </Button>
            <span className="font-heading font-bold text-sm">Finance Hub</span>
          </div>

          {/* Desktop: breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Platform</span>
            <ChevronRight className="size-3.5" />
            <span className="capitalize font-medium text-foreground">{pageName}</span>
          </div>

          {/* Right: status + theme toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="page-transition min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <div className="relative h-full">
              <SidebarContent />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-[-48px] size-9 bg-background border-border shadow-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
