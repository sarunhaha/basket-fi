'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { FolderOpen, Plus, TrendingUp, TrendingDown } from 'lucide-react';

export function RecentBaskets() {
  const t = useTranslations('dashboard.recentBaskets');

  const { data, isLoading, error } = useQuery({
    queryKey: ['baskets', 'recent'],
    queryFn: () => apiClient.getBaskets({ limit: 5 }),
  });

  const baskets = data?.data || [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>{t('title', { default: 'Recent Baskets' })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {t('error', { default: 'Failed to load baskets' })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <span>{t('title', { default: 'Recent Baskets' })}</span>
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/baskets">
            {t('viewAll', { default: 'View All' })}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
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
          </div>
        ) : baskets.length === 0 ? (
          <div className="text-center py-6">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('noBaskets', { default: 'No baskets yet' })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('createFirst', { default: 'Create your first DeFi portfolio to get started' })}
            </p>
            <Button asChild>
              <Link href="/baskets/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('createBasket', { default: 'Create Basket' })}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {baskets.map((basket) => {
              // Mock performance data - in real app, this would come from API
              const performance = Math.random() * 10 - 5; // -5% to +5%
              const isPositive = performance >= 0;

              return (
                <Link
                  key={basket.id}
                  href={`/baskets/${basket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{basket.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>
                          ${parseFloat(basket.totalValue || '0').toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {basket.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            {t('public', { default: 'Public' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {isPositive ? '+' : ''}{performance.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('today', { default: 'Today' })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}