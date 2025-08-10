'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FolderOpen, 
  ArrowLeftRight,
  AlertTriangle
} from 'lucide-react';

export function DashboardStats() {
  const t = useTranslations('dashboard.stats');

  // Fetch user's baskets to calculate stats
  const { data: basketsData } = useQuery({
    queryKey: ['baskets', 'stats'],
    queryFn: () => apiClient.getBaskets({ limit: 100 }),
  });

  // Fetch recent transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => apiClient.getTransactions({ limit: 10 }),
  });

  // Fetch active alerts
  const { data: alertsData } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => apiClient.getAlerts({ isActive: true, limit: 100 }),
  });

  // Calculate stats from data
  const baskets = basketsData?.data || [];
  const transactions = transactionsData?.data || [];
  const alerts = alertsData?.data || [];

  const totalValue = baskets.reduce((sum, basket) => {
    return sum + parseFloat(basket.totalValue || '0');
  }, 0);

  const activeBaskets = baskets.filter(basket => basket.isActive).length;
  const recentTransactions = transactions.length;
  const activeAlertsCount = alerts.filter(alert => alert.isActive).length;

  // Mock 24h change - in real app, this would come from API
  const change24h = 2.34; // percentage
  const isPositive = change24h >= 0;

  const stats = [
    {
      title: t('totalValue', { default: 'Total Portfolio Value' }),
      value: `$${totalValue.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`,
      change: `${isPositive ? '+' : ''}${change24h}%`,
      changeType: isPositive ? 'positive' : 'negative',
      icon: Wallet,
    },
    {
      title: t('activeBaskets', { default: 'Active Baskets' }),
      value: activeBaskets.toString(),
      subtitle: `${baskets.length} total`,
      icon: FolderOpen,
    },
    {
      title: t('recentTransactions', { default: 'Recent Transactions' }),
      value: recentTransactions.toString(),
      subtitle: t('last7Days', { default: 'Last 7 days' }),
      icon: ArrowLeftRight,
    },
    {
      title: t('activeAlerts', { default: 'Active Alerts' }),
      value: activeAlertsCount.toString(),
      subtitle: alerts.length > 0 ? `${alerts.filter(a => a.isTriggered).length} triggered` : undefined,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {stat.change && (
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              )}
              {stat.subtitle && (
                <span>{stat.subtitle}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}