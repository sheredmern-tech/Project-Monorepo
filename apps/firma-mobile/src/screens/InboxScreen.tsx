import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  MY_NOTIFICATIONS,
  Notification,
  hasActiveCase,
  MY_ACTIVE_CASE,
} from '../mocks/my-cases.mock';

export default function InboxScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(MY_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setNotifications(MY_NOTIFICATIONS);
      setRefreshing(false);
    }, 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action_required':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action_required':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Tandai Semua Dibaca?',
      'Semua notifikasi akan ditandai sebagai sudah dibaca.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notif: Notification) => {
    markAsRead(notif.id);

    // Navigate based on action_url
    if (notif.action_url) {
      if (notif.action_url === 'Phase2Upload') {
        // Check if still in phase 2
        if (hasActiveCase() && MY_ACTIVE_CASE.current_phase === 2) {
          navigation.navigate('Phase2Upload', { caseId: MY_ACTIVE_CASE.id });
        } else {
          Alert.alert(
            'Info',
            'Pengajuan sudah tidak berada di Phase 2.',
            [{ text: 'OK' }]
          );
        }
      } else if (notif.action_url === 'CaseDetail') {
        navigation.navigate('CaseDetail', {
          caseId: MY_ACTIVE_CASE.id,
        });
      }
    } else {
      // Just show detail
      Alert.alert(
        notif.title,
        `${notif.message}\n\nCase: ${notif.case_number}`,
        [{ text: 'OK' }]
      );
    }
  };

  const deleteNotification = (id: string) => {
    Alert.alert('Hapus Notifikasi?', 'Notifikasi akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => deleteNotification(item.id)}
      >
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}
        >
          <Text style={styles.icon}>{typeIcon}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={3}>
            {item.message}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.caseNumber}>{item.case_number}</Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Action Button */}
          {item.action_url && !item.read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNotificationPress(item)}
            >
              <Text style={styles.actionButtonText}>
                {item.action_url === 'Phase2Upload'
                  ? '📤 Upload Dokumen'
                  : '👁️ Lihat Detail'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Filter notifications
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const actionRequiredCount = notifications.filter(
    (n) => !n.read && n.type === 'action_required'
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Kotak Masuk</Text>
            <Text style={styles.headerSubtitle}>
              {notifications.length} notifikasi
            </Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              Semua ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'unread' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'unread' && styles.filterTabTextActive,
              ]}
            >
              Belum Dibaca ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Required Banner */}
        {actionRequiredCount > 0 && (
          <View style={styles.actionBanner}>
            <Text style={styles.actionBannerIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionBannerTitle}>
                {actionRequiredCount} Aksi Diperlukan
              </Text>
              <Text style={styles.actionBannerText}>
                Ada dokumen atau informasi yang perlu Anda lengkapi
              </Text>
            </View>
          </View>
        )}

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>
              ✓ Tandai Semua Dibaca
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              {filter === 'unread' ? '✅' : '📬'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'unread'
                ? 'Semua notifikasi sudah dibaca'
                : 'Tidak ada notifikasi'}
            </Text>
            {filter === 'unread' && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => setFilter('all')}
              >
                <Text style={styles.showAllButtonText}>
                  Lihat Semua Notifikasi
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Info Footer */}
      {!hasActiveCase() && notifications.length === 0 && (
        <View style={styles.infoFooter}>
          <Text style={styles.infoFooterText}>
            💡 Notifikasi akan muncul ketika ada update terkait pengajuan Anda
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 2,
  },
  actionBannerText: {
    fontSize: 12,
    color: '#dc2626',
  },
  markAllButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  markAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  list: {
    padding: 16,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notifCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
    marginTop: 6,
  },
  message: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseNumber: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  showAllButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  showAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  infoFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  infoFooterText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});