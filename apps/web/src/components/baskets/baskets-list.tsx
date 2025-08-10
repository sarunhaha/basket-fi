'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api-client';
import { 
  FolderOpen, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

export function BasketsList() {
  const t = useTranslations('baskets');

  const { data, isLoading, error } = useQuery({
    queryKey: ['baskets'],
    queryFn: () => apiClient.getBaskets({ limit: 50 }),
  });

  const baskets = data?.data || [];

  if (error) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {t('error.title', { default: 'Failed to load baskets' })}
        </h3>
        <p className="text-muted-foreground">
          {t('error.description', { default: 'Please try again later' })}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <BasketsListSkeleton />;
  }

  if (baskets.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {t('empty.title', { default: 'No baskets yet' })}
        </h3>
        <p className="text-muted-foreground mb-6">
          {t('empty.description', { default: 'Create your first DeFi portfolio to get started' })}
        </p>
        <Button asChild>
          <Link href="/baskets/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createFirst', { default: 'Create Your First Basket' })}
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
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{basket.name}</h3>
                      <div className="flex items-center space-x-2">
                        {basket.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            {t('public', { default: 'Public' })}
                          </Badge>
                        )}
                        {!basket.isActive && (
                          <Badge variant="outline" className="text-xs">
                            {t('inactive', { default: 'Inactive' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/baskets/${basket.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('actions.view', { default: 'View Details' })}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/baskets/${basket.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('actions.edit', { default: 'Edit' })}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/baskets/${basket.id}/rebalance`}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('actions.rebalance', { default: 'Rebalance' })}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('actions.delete', { default: 'Delete' })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                {basket.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {basket.description}
                  </p>
                )}

                {/* Value and Performance */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">
                      ${totalValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('totalValue', { default: 'Total Value' })}
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
                      {t('performance24h', { default: '24h' })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/baskets/${basket.id}`}>
                      {t('actions.viewDetails', { default: 'View Details' })}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/baskets/${basket.id}/rebalance`}>
                      <BarChart3 className="h-4 w-4" />
                      <span className="sr-only">Rebalance</span>
                    </Link>
                  </Button>
                </div>

                {/* Last updated */}
                <div className="text-xs text-muted-foreground">
                  {t('lastUpdated', { default: 'Updated' })}{' '}
                  {new Date(basket.updatedAt).toLocaleDateString()}
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
                <div className="flex items-center space-x-3">
                  <div className="skeleton h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-4 w-16" />
                  </div>
                </div>
                <div className="skeleton h-8 w-8 rounded" />
              </div>
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="skeleton h-8 w-24" />
                  <div className="skeleton h-3 w-16" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="skeleton h-5 w-16" />
                  <div className="skeleton h-3 w-8" />
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="skeleton h-9 flex-1" />
                <div className="skeleton h-9 w-9" />
              </div>
              <div className="skeleton h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}