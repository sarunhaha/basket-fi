'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@basket-fi/ui';
import { apiClient } from '@/lib/api-client';
import { 
  FolderOpen, 
  Plus, 
  TrendingUp, 
  TrendingDown,
} from 'lucide-react';

export function BasketsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['baskets'],
    queryFn: () => apiClient.getBaskets({ limit: 20 }),
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Failed to load baskets
        </h3>
        <p className="text-muted-foreground">
          Please try again later
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <BasketsListSkeleton />;
  }

  const baskets = data?.data || [];

  if (baskets.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          No baskets yet
        </h3>
        <p className="text-muted-foreground mb-6">
          Create your first DeFi portfolio to get started
        </p>
        <Button asChild>
          <Link href="/dashboard/baskets/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Basket
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {baskets.map((basket) => {
        // Mock performance data - in real app, this would come from API
        const performance = Math.random() * 20 - 10; // -10% to +10%
        const isPositive = performance >= 0;
        const totalValue = parseFloat(basket.totalValue || '0');

        return (
          <Card key={basket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{basket.name}</h3>
                    <div className="flex items-center space-x-2">
                      {basket.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                      {!basket.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {basket.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {basket.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Value */}
                  <div>
                    <div className="text-2xl font-bold">
                      ${totalValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Value
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <div className={`text-2xl font-bold flex items-center ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {isPositive ? '+' : ''}{performance.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      24h
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/baskets/${basket.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>

                {/* Last updated */}
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(basket.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}