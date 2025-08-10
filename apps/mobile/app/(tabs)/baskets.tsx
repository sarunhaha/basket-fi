import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useBaskets } from '../../hooks/useBaskets';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BasketCard } from '../../components/BasketCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { FilterModal } from '../../components/FilterModal';
import Colors from '../../constants/Colors';

type SortOption = 'recent' | 'name' | 'value' | 'performance';
type FilterOption = 'all' | 'active' | 'public' | 'private';

export default function BasketsScreen() {
  const { baskets, isLoading, refetch, isRefetching } = useBaskets();
  const { track } = useAnalytics();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = useCallback(() => {
    track('baskets_pull_to_refresh');
    refetch();
  }, [refetch, track]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    track('baskets_search', { query });
  };

  const handleBasketPress = (basketId: string) => {
    track('baskets_basket_pressed', { basketId });
    router.push(`/basket/${basketId}`);
  };

  const handleQuickRebalance = (basketId: string) => {
    track('baskets_quick_rebalance', { basketId });
    router.push(`/rebalance/${basketId}`);
  };

  const handleCreateBasket = () => {
    track('baskets_create_pressed');
    router.push('/add-basket');
  };

  // Filter and sort baskets
  const filteredBaskets = baskets?.filter(basket => {
    // Search filter
    if (searchQuery && !basket.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    switch (filterBy) {
      case 'active':
        return basket.isActive;
      case 'public':
        return basket.isPublic;
      case 'private':
        return !basket.isPublic;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return parseFloat(b.totalValue || '0') - parseFloat(a.totalValue || '0');
      case 'performance':
        // Mock performance sorting
        return Math.random() - 0.5;
      default: // recent
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Baskets</Text>
        </View>
        <ScrollView style={styles.content}>
          <LoadingSkeleton type="baskets" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Baskets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateBasket}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search baskets..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* Baskets List */}
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
        {!filteredBaskets || filteredBaskets.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title={searchQuery ? "No baskets found" : "No baskets yet"}
            description={
              searchQuery 
                ? "Try adjusting your search or filters"
                : "Create your first DeFi portfolio to get started"
            }
            actionText="Create Basket"
            onAction={handleCreateBasket}
          />
        ) : (
          <View style={styles.basketsList}>
            {filteredBaskets.map((basket, index) => (
              <Animated.View
                key={basket.id}
                entering={FadeInDown.delay(index * 100).duration(600)}
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
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  basketsList: {
    paddingVertical: 16,
    gap: 12,
  },
});