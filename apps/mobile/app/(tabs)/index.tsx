import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../hooks/useAuth';
import { useBaskets } from '../../hooks/useBaskets';
import { useAnalytics } from '../../hooks/useAnalytics';
import { DashboardHeader } from '../../components/DashboardHeader';
import { StatsCard } from '../../components/StatsCard';
import { BasketCard } from '../../components/BasketCard';
import { QuickActions } from '../../components/QuickActions';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { baskets, isLoading, refetch, isRefetching } = useBaskets();
  const { track } = useAnalytics();

  const onRefresh = useCallback(() => {
    track('dashboard_pull_to_refresh');
    refetch();
  }, [refetch, track]);

  const handleViewAllBaskets = () => {
    track('dashboard_view_all_baskets');
    router.push('/(tabs)/baskets');
  };

  const handleBasketPress = (basketId: string) => {
    track('dashboard_basket_pressed', { basketId });
    router.push(`/basket/${basketId}`);
  };

  const handleQuickRebalance = (basketId: string) => {
    track('dashboard_quick_rebalance', { basketId });
    router.push(`/rebalance/${basketId}`);
  };

  // Calculate portfolio stats
  const totalValue = baskets?.reduce((sum, basket) => 
    sum + parseFloat(basket.totalValue || '0'), 0
  ) || 0;

  const activeBaskets = baskets?.filter(basket => basket.isActive).length || 0;
  const change24h = 2.34; // Mock data - would come from API

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardHeader user={user} />
        <ScrollView style={styles.content}>
          <LoadingSkeleton type="dashboard" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader user={user} />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Stats */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.statsContainer}
        >
          <StatsCard
            title="Total Portfolio Value"
            value={`$${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            change={change24h}
            icon="wallet"
          />
          
          <View style={styles.statsRow}>
            <StatsCard
              title="Active Baskets"
              value={activeBaskets.toString()}
              subtitle={`${baskets?.length || 0} total`}
              icon="briefcase"
              style={styles.halfCard}
            />
            <StatsCard
              title="24h Change"
              value={`${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`}
              change={change24h}
              icon="trending-up"
              style={styles.halfCard}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <QuickActions />
        </Animated.View>

        {/* Recent Baskets */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Baskets</Text>
            {baskets && baskets.length > 3 && (
              <TouchableOpacity onPress={handleViewAllBaskets}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {!baskets || baskets.length === 0 ? (
            <EmptyState
              icon="briefcase-outline"
              title="No baskets yet"
              description="Create your first DeFi portfolio to get started"
              actionText="Create Basket"
              onAction={() => router.push('/add-basket')}
            />
          ) : (
            <View style={styles.basketsList}>
              {baskets.slice(0, 3).map((basket, index) => (
                <Animated.View
                  key={basket.id}
                  entering={FadeInDown.delay(400 + index * 100).duration(600)}
                >
                  <BasketCard
                    basket={basket}
                    onPress={() => handleBasketPress(basket.id)}
                    onQuickRebalance={() => handleQuickRebalance(basket.id)}
                    showQuickActions
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Market Insights */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Market Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={24} color={Colors.light.tint} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>DeFi Market Update</Text>
              <Text style={styles.insightDescription}>
                Total value locked in DeFi protocols increased by 5.2% this week
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  basketsList: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});