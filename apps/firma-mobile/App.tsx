import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import networkService from './src/services/network.service';
import authService from './src/services/auth.service';
import syncService from './src/services/sync.service';
import { useStore } from './src/store';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // Initialize network service
      networkService.init();

      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getUser();
        setUser(user);

        // Start auto-sync
        syncService.startAutoSync();
      }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
});