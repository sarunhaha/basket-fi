import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useBasket } from '../../hooks/useBaskets';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import Colors from '../../constants/Colors';

export default function QuickRebalanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { basket, isLoading, rebalance, isRebalancing, rebalanceData } = useBasket(id);
  const { track } = useAnalytics();
  
  const [isDryRun, setIsDryRun] = useState(true);

  const handleRebalance = async () => {
    if (!basket) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isDryRun) {
        // Perform dry run first
        await rebalance({ dryRun: true });
      } else {
        // Show confirmation for actual rebalance
        Alert.alert(
          'Confirm Rebalance',
          `Are you sure you want to rebalance "${basket.name}"? This will execute trades on the blockchain.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Rebalance',
              style: 'destructive',
              onPress: () => rebalance({ dryRun: false }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Rebalance failed:', error);
    }
  };

  const handleToggleDryRun = () => {
    setIsDryRun(!isDryRun);
    track('rebalance_dry_run_toggled', { isDryRun: !isDryRun });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSkeleton type="rebalance" />
      </SafeAreaView>
    );
  }

  if (!basket) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Basket not found"
          description="The basket you're looking for doesn't exist"
          actionText="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basket Info */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.basketInfo}
        >
          <View style={styles.basketHeader}>
            <View style={styles.basketIcon}>
              <Ionicons name="briefcase" size={24} color={Colors.light.tint} />
            </View>
            <View style={styles.basketDetails}>
              <Text style={styles.basketName}>{basket.name}</Text>
              <Text style={styles.basketValue}>
                ${parseFloat(basket.totalValue || '0').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
          
          {basket.description && (
            <Text style={styles.basketDescription}>{basket.description}</Text>
          )}
        </Animated.View>

        {/* Current Allocations */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Current Allocations</Text>
          <View style={styles.allocationsContainer}>
            {basket.allocations?.map((allocation, index) => (
              <View key={allocation.id} style={styles.allocationItem}>
                <View style={styles.allocationInfo}>
                  <Text style={styles.tokenSymbol}>
                    {allocation.basketAsset.symbol}
                  </Text>
                  <Text style={styles.tokenName}>
                    {allocation.basketAsset.name}
                  </Text>
                </View>
                <View style={styles.allocationPercentages}>
                  <Text style={styles.currentPercentage}>
                    {parseFloat(allocation.currentPercentage).toFixed(1)}%
                  </Text>
                  <Text style={styles.targetPercentage}>
                    Target: {parseFloat(allocation.targetPercentage).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Rebalance Options */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Rebalance Options</Text>
          
          <TouchableOpacity
            style={[styles.optionItem, isDryRun && styles.optionItemActive]}
            onPress={handleToggleDryRun}
          >
            <View style={styles.optionContent}>
              <Ionicons 
                name={isDryRun ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={isDryRun ? Colors.light.tint : Colors.light.textSecondary} 
              />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Dry Run</Text>
                <Text style={styles.optionDescription}>
                  Preview rebalance without executing trades
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, !isDryRun && styles.optionItemActive]}
            onPress={handleToggleDryRun}
          >
            <View style={styles.optionContent}>
              <Ionicons 
                name={!isDryRun ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={!isDryRun ? Colors.light.tint : Colors.light.textSecondary} 
              />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Execute Rebalance</Text>
                <Text style={styles.optionDescription}>
                  Perform actual trades on the blockchain
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Rebalance Results */}
        {rebalanceData && (
          <Animated.View 
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>
              {isDryRun ? 'Preview Results' : 'Rebalance Results'}
            </Text>
            
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Estimated Gas</Text>
                <Text style={styles.resultValue}>
                  {rebalanceData.estimatedGas || 'N/A'} ETH
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Number of Trades</Text>
                <Text style={styles.resultValue}>
                  {rebalanceData.trades?.length || 0}
                </Text>
              </View>
              
              {rebalanceData.trades?.map((trade, index) => (
                <View key={index} style={styles.tradeItem}>
                  <Text style={styles.tradeText}>
                    Swap {trade.amount} from {trade.from} to {trade.to}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Action Button */}
      <Animated.View 
        entering={FadeInDown.delay(500).duration(600)}
        style={styles.actionContainer}
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            isRebalancing && styles.actionButtonDisabled,
          ]}
          onPress={handleRebalance}
          disabled={isRebalancing}
        >
          {isRebalancing ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {isDryRun ? 'Calculating...' : 'Rebalancing...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.actionButtonText}>
              {isDryRun ? 'Preview Rebalance' : 'Execute Rebalance'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
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
  basketInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  basketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  basketIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.tint}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  basketDetails: {
    flex: 1,
  },
  basketName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  basketValue: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  basketDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  allocationsContainer: {
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
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  allocationInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  tokenName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  allocationPercentages: {
    alignItems: 'flex-end',
  },
  currentPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  targetPercentage: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  optionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItemActive: {
    borderColor: Colors.light.tint,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  resultsContainer: {
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
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  tradeItem: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tradeText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});