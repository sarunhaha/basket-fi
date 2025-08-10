/**
 * Authentication hook using TanStack Query
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  authenticateWallet, 
  logout as logoutAuth, 
  getCurrentUser, 
  isAuthenticated 
} from '@/lib/auth';
import type { User } from '@/lib/api-client';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authenticateWallet,
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Clear any cached auth data
      queryClient.setQueryData(['auth', 'user'], null);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      logoutAuth();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to sign-in
      router.push('/sign-in');
    },
  });

  const login = () => {
    loginMutation.mutate();
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: error || loginMutation.error || logoutMutation.error,
    
    // Actions
    login,
    logout,
    refetch,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
}

// Hook for protecting routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  if (!isLoading && !user) {
    router.push('/sign-in');
    return { user: null, isLoading: true };
  }

  return { user, isLoading };
}