import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnalytics } from './useAnalytics';
import { apiClient } from '../lib/api-client';
import type { Basket, BasketWithAllocations } from '../types/api';

export function useBaskets() {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();

  // Get all baskets
  const {
    data: basketsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['baskets'],
    queryFn: () => apiClient.getBaskets({ limit: 50 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const baskets = basketsData?.data || [];

  // Create basket mutation
  const createBasketMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      isPublic?: boolean;
      allocations: Array<{
        tokenAddress: string;
        targetPercentage: number;
      }>;
    }) => {
      track('basket_create_initiated', { name: data.name });
      return apiClient.createBasket(data);
    },
    onSuccess: (newBasket) => {
      // Add to cache optimistically
      queryClient.setQueryData(['baskets'], (old: any) => ({
        ...old,
        data: [newBasket, ...(old?.data || [])],
      }));
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['baskets'] });
      
      track('basket_created', { basketId: newBasket.id });
    },
    onError: (error) => {
      track('basket_create_failed', { error: error.message });
    },
  });

  // Update basket mutation
  const updateBasketMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        isPublic?: boolean;
      };
    }) => {
      track('basket_update_initiated', { basketId: id });
      return apiClient.updateBasket(id, data);
    },
    onSuccess: (updatedBasket) => {
      // Update in cache
      queryClient.setQueryData(['baskets'], (old: any) => ({
        ...old,
        data: old?.data?.map((basket: Basket) =>
          basket.id === updatedBasket.id ? updatedBasket : basket
        ) || [],
      }));
      
      // Update individual basket cache if it exists
      queryClient.setQueryData(['basket', updatedBasket.id], updatedBasket);
      
      track('basket_updated', { basketId: updatedBasket.id });
    },
    onError: (error) => {
      track('basket_update_failed', { error: error.message });
    },
  });

  // Delete basket mutation
  const deleteBasketMutation = useMutation({
    mutationFn: (basketId: string) => {
      track('basket_delete_initiated', { basketId });
      return apiClient.deleteBasket(basketId);
    },
    onSuccess: (_, basketId) => {
      // Remove from cache
      queryClient.setQueryData(['baskets'], (old: any) => ({
        ...old,
        data: old?.data?.filter((basket: Basket) => basket.id !== basketId) || [],
      }));
      
      // Remove individual basket cache
      queryClient.removeQueries({ queryKey: ['basket', basketId] });
      
      track('basket_deleted', { basketId });
    },
    onError: (error) => {
      track('basket_delete_failed', { error: error.message });
    },
  });

  return {
    // Data
    baskets,
    basketsData,
    
    // Loading states
    isLoading,
    isRefetching,
    error,
    
    // Actions
    refetch,
    createBasket: createBasketMutation.mutate,
    updateBasket: updateBasketMutation.mutate,
    deleteBasket: deleteBasketMutation.mutate,
    
    // Mutation states
    isCreating: createBasketMutation.isPending,
    isUpdating: updateBasketMutation.isPending,
    isDeleting: deleteBasketMutation.isPending,
    createError: createBasketMutation.error,
    updateError: updateBasketMutation.error,
    deleteError: deleteBasketMutation.error,
  };
}

export function useBasket(basketId: string) {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();

  // Get individual basket
  const {
    data: basket,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['basket', basketId],
    queryFn: () => apiClient.getBasket(basketId),
    enabled: !!basketId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Rebalance mutation
  const rebalanceMutation = useMutation({
    mutationFn: ({ dryRun = false }: { dryRun?: boolean }) => {
      const idempotencyKey = `rebalance-${basketId}-${Date.now()}`;
      track('basket_rebalance_initiated', { basketId, dryRun });
      return apiClient.rebalanceBasket(basketId, { dryRun }, idempotencyKey);
    },
    onSuccess: (result, variables) => {
      track('basket_rebalanced', { 
        basketId, 
        dryRun: variables.dryRun,
        trades: result.trades?.length || 0 
      });
      
      // Invalidate basket data to refresh
      queryClient.invalidateQueries({ queryKey: ['basket', basketId] });
      queryClient.invalidateQueries({ queryKey: ['baskets'] });
    },
    onError: (error) => {
      track('basket_rebalance_failed', { basketId, error: error.message });
    },
  });

  return {
    // Data
    basket,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    refetch,
    rebalance: rebalanceMutation.mutate,
    
    // Mutation states
    isRebalancing: rebalanceMutation.isPending,
    rebalanceError: rebalanceMutation.error,
    rebalanceData: rebalanceMutation.data,
  };
}

// Hook for optimistic updates
export function useOptimisticBaskets() {
  const queryClient = useQueryClient();

  const optimisticUpdate = (basketId: string, updates: Partial<Basket>) => {
    queryClient.setQueryData(['baskets'], (old: any) => ({
      ...old,
      data: old?.data?.map((basket: Basket) =>
        basket.id === basketId ? { ...basket, ...updates } : basket
      ) || [],
    }));
  };

  const revertOptimisticUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['baskets'] });
  };

  return {
    optimisticUpdate,
    revertOptimisticUpdate,
  };
}