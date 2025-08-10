import { Suspense } from 'react';
import { BasketsList } from '@/components/baskets/baskets-list';
import { BasketsHeader } from '@/components/baskets/baskets-header';
import { Card, CardContent } from '@basket-fi/ui';

export default function BasketsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <BasketsHeader />

      {/* Baskets List */}
      <Suspense fallback={<BasketsListSkeleton />}>
        <BasketsList />
      </Suspense>
    </div>
  );
}

function BasketsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex space-x-2">
                <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}