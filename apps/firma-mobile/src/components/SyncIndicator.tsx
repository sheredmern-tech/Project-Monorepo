import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';

export default function SyncIndicator() {
  const { syncStatus } = useStore();

  if (syncStatus.isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (syncStatus.pendingUploads > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.pending}>
          📤 {syncStatus.pendingUploads} pending upload(s)
        </Text>
      </View>
    );
  }

  if (syncStatus.failedUploads > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.failed}>
          ⚠️ {syncStatus.failedUploads} failed upload(s)
        </Text>
      </View>
    );
  }

  if (syncStatus.lastSyncTime) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          ✓ Synced {formatDistanceToNow(syncStatus.lastSyncTime)} ago
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  text: {
    fontSize: 12,
    color: '#6b7280',
  },
  pending: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  failed: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});