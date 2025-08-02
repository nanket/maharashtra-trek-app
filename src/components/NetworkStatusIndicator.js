/**
 * NetworkStatusIndicator - Shows network and sync status to users
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus, useOfflineQueue, useSyncStatus } from '../utils/NetworkUtils';
import { COLORS } from '../constants/theme';

const NetworkStatusIndicator = ({ onPress }) => {
  const { isOnline, connectionType } = useNetworkStatus();
  const { queueSize } = useOfflineQueue();
  const { lastSync, isSyncing } = useSyncStatus();

  // Don't show indicator if everything is normal
  if (isOnline && queueSize === 0 && !isSyncing) {
    return null;
  }

  const getStatusInfo = () => {
    if (isSyncing) {
      return {
        text: 'Syncing...',
        color: COLORS.warning,
        icon: '🔄',
      };
    }

    if (!isOnline) {
      return {
        text: queueSize > 0 ? `Offline (${queueSize} pending)` : 'Offline',
        color: COLORS.error,
        icon: '📱',
      };
    }

    if (queueSize > 0) {
      return {
        text: `${queueSize} pending sync`,
        color: COLORS.warning,
        icon: '⏳',
      };
    }

    if (connectionType === 'cellular') {
      return {
        text: 'Using cellular data',
        color: COLORS.warning,
        icon: '📶',
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const formatLastSync = () => {
    if (!lastSync) return 'Never synced';
    
    const now = Date.now();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: statusInfo.color + '20' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{statusInfo.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
          {lastSync && (
            <Text style={styles.syncText}>
              Last sync: {formatLastSync()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  syncText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default NetworkStatusIndicator;
