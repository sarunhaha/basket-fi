import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { BasketsList } from '@/components/baskets/baskets-list';
import { BasketsHeader } from '@/components/baskets/baskets-header';
import { Card, CardContent } from '@/components/ui/card';

export default function BasketsPage() {
  const t = useTranslations('baskets');

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
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <div className="skeleton h-8 w-24" />
                <div className="skeleton h-6 w-20" />
              </div>
              <div className="flex space-x-2">
                <div className="skeleton h-8 flex-1" />
                <div className="skeleton h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}