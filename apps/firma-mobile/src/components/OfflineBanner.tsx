import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store';

export default function OfflineBanner() {
  const { syncStatus } = useStore();

  if (syncStatus.isOnline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📡 Offline Mode - Changes will sync when online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    padding: 12,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});