import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../constants/Colors';
import type { Basket } from '../types/api';

const { width } = Dimensions.get('window');

interface BasketCardProps {
  basket: Basket;
  onPress: () => void;
  onQuickRebalance?: () => void;
  showQuickActions?: boolean;
  style?: any;
}

export function BasketCard({
  basket,
  onPress,
  onQuickRebalance,
  showQuickActions = false,
  style,
}: BasketCardProps) {
  const totalValue = parseFloat(basket.totalValue || '0');
  
  // Mock performance data - would come from API
  const performance = Math.random() * 20 - 10; // -10% to +10%
  const isPositive = performance >= 0;

  const handleQuickRebalance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onQuickRebalance?.();
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={20} color={Colors.light.tint} />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.name} numberOfLines={1}>
              {basket.name}
            </Text>
            <View style={styles.badges}>
              {basket.isPublic && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Public</Text>
                </View>
              )}
              {!basket.isActive && (
                <View style={[styles.badge, styles.inactiveBadge]}>
                  <Text style={[styles.badgeText, styles.inactiveBadgeText]}>
                    Inactive
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {showQuickActions && (
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleQuickRebalance}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={18} color={Colors.light.tint} />
          </TouchableOpacity>
        )}
      </View>

      {basket.description && (
        <Text style={styles.description} numberOfLines={2}>
          {basket.description}
        </Text>
      )}

      <View style={styles.metrics}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Total Value</Text>
          <Text style={styles.value}>
            ${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.performanceContainer}>
          <View style={styles.performanceRow}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={isPositive ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.performance,
                { color: isPositive ? '#10B981' : '#EF4444' },
              ]}
            >
              {isPositive ? '+' : ''}{performance.toFixed(2)}%
            </Text>
          </View>
          <Text style={styles.performanceLabel}>24h</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Updated {new Date(basket.updatedAt).toLocaleDateString()}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
  },
  inactiveBadge: {
    backgroundColor: Colors.light.textSecondary,
  },
  inactiveBadgeText: {
    color: '#ffffff',
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.tint}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueContainer: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  performanceContainer: {
    alignItems: 'flex-end',
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  performance: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});