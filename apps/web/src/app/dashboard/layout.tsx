'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@basket-fi/ui';
import Link from 'next/link';
import { SimpleConnectButton } from '@/components/connect-button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For now, we'll create a simple layout without complex auth
  // This can be enhanced later with proper authentication

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Basket.fi</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/baskets">Baskets</Link>
              <Link href="/dashboard/pools">Pools</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <SimpleConnectButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}