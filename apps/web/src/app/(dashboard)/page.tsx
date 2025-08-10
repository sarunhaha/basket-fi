import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardStats } from '@/components/dashboard/stats';
import { RecentBaskets } from '@/components/dashboard/recent-baskets';
import { PortfolioChart } from '@/components/dashboard/portfolio-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { ActiveAlerts } from '@/components/dashboard/active-alerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('title', { default: 'Dashboard' })}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle', { default: 'Overview of your DeFi portfolios and recent activity' })}
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <PortfolioChart />
          </Suspense>
        </div>

        {/* Active Alerts */}
        <div>
          <Suspense fallback={<AlertsSkeleton />}>
            <ActiveAlerts />
          </Suspense>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Baskets */}
        <Suspense fallback={<BasketsSkeleton />}>
          <RecentBaskets />
        </Suspense>

        {/* Recent Transactions */}
        <Suspense fallback={<TransactionsSkeleton />}>
          <RecentTransactions />
        </Suspense>
      </div>
    </div>
  );
}

// Loading Skeletons
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="skeleton h-80 w-full" />
      </CardContent>
    </Card>
  );
}

function AlertsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="skeleton h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BasketsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="skeleton h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="skeleton h-10 w-10 rounded" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
            <div className="skeleton h-6 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="skeleton h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}