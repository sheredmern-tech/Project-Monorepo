import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import networkService from './src/services/network.service';
import authService from './src/services/auth.service';
import syncService from './src/services/sync.service';
import { useStore } from './src/store';
import { Colors } from './src/theme/design-system';

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

      // Silently check authentication (don't force login)
      // User can browse first, login when needed
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getUser();
        setUser(user);

        // Start auto-sync only if authenticated
        syncService.startAutoSync();
      }
    } catch (error) {
      console.error('Init error:', error);
      // Don't block app from starting even if auth check fails
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});