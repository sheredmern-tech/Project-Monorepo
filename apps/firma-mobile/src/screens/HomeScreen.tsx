import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useStore } from '../store';
import authService from '../services/auth.service';
import syncService from '../services/sync.service';
import DocumentCard from '../components/DocumentCard';
import SyncIndicator from '../components/SyncIndicator';
import OfflineBanner from '../components/OfflineBanner';

export default function HomeScreen({ navigation }: any) {
  const {
    user,
    documents,
    isLoadingDocuments,
    loadDocuments,
    refreshDocuments,
    updateSyncStatus,
    syncStatus,
  } = useStore();

  useEffect(() => {
    loadDocuments();
    updateSyncStatus();

    // Update sync status every 5 seconds
    const interval = setInterval(() => {
      updateSyncStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleClearFailedUploads = async () => {
    Alert.alert(
      'Clear Failed Uploads',
      'Remove all failed uploads from queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await syncService.clearFailedUploads();
            await updateSyncStatus();
            Alert.alert('Success', 'Failed uploads cleared');
          },
        },
      ]
    );
  };

  const handleDocumentPress = (document: any) => {
    Alert.alert(
      document.fileName,
      `Category: ${document.category}\nSize: ${document.fileSize || 'Unknown'} bytes\nStatus: ${document.syncStatus}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.fullName || 'User'}!</Text>
          <Text style={styles.subtitle}>Your Documents</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <SyncIndicator />

      {/* NEW: Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('CaseList')}
        >
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={styles.quickActionText}>My Cases</Text>
          <Text style={styles.quickActionBadge}>NEW!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Upload')}
        >
          <Text style={styles.quickActionIcon}>📤</Text>
          <Text style={styles.quickActionText}>Upload Doc</Text>
        </TouchableOpacity>
      </View>

      {/* Debug: Show clear button if there are failed uploads */}
      {syncStatus.failedUploads > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearFailedUploads}
        >
          <Text style={styles.clearButtonText}>
            🧹 Clear {syncStatus.failedUploads} Failed Upload(s)
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => handleDocumentPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingDocuments}
            onRefresh={refreshDocuments}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptyHint}>
              Tap the + button to upload your first document
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Upload')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  quickActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  clearButtonText: {
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});