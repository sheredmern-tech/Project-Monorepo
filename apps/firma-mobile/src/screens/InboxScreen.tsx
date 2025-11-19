import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Colors, Typography, Spacing, Radius, IconSize, Shadows } from '../theme/design-system';

export default function InboxScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, loadNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getTypeColor = (type: string) => {
    // B&W design - no colors, use gray shades
    switch (type) {
      case 'action_required':
        return Colors.black;
      case 'warning':
        return Colors.gray[700];
      case 'success':
        return Colors.gray[600];
      case 'info':
      default:
        return Colors.gray[500];
    }
  };

  const getTypeIcon = (type: string): any => {
    switch (type) {
      case 'action_required':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Tandai Semua Dibaca?',
      'Semua notifikasi akan ditandai sebagai sudah dibaca.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            markAllNotificationsAsRead();
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notif: any) => {
    handleMarkAsRead(notif.id);

    // Navigate based on action_url and case_id from notification
    if (notif.action_url && notif.case_id) {
      if (notif.action_url === 'Phase2Upload') {
        navigation.navigate('Phase2Upload', { caseId: notif.case_id });
      } else if (notif.action_url === 'CaseDetail') {
        navigation.navigate('CaseDetail', { caseId: notif.case_id });
      }
    } else {
      // Just show detail
      Alert.alert(
        notif.title,
        `${notif.message}\n\nCase: ${notif.case_number || 'N/A'}`,
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
          // TODO: Implement delete in store
          console.log('Delete notification:', id);
        },
      },
    ]);
  };

  const renderNotification = ({ item }: { item: any }) => {
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => deleteNotification(item.id)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: Colors.gray[100] }]}>
          <Ionicons name={typeIcon} size={IconSize.base} color={typeColor} />
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
            <Text style={styles.caseNumber}>{item.case_number || 'N/A'}</Text>
            <Text style={styles.date}>
              {new Date(item.date || item.created_at).toLocaleDateString('id-ID', {
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
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.action_url === 'Phase2Upload' ? 'cloud-upload-outline' : 'eye-outline'}
                size={IconSize.sm}
                color={Colors.white}
              />
              <Text style={styles.actionButtonText}>
                {item.action_url === 'Phase2Upload'
                  ? 'Upload Dokumen'
                  : 'Lihat Detail'}
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
            <Ionicons name="alert-circle" size={IconSize.lg} color={Colors.black} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
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
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={IconSize.sm} color={Colors.black} />
            <Text style={styles.markAllButtonText}>
              Tandai Semua Dibaca
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
            <Ionicons
              name={filter === 'unread' ? 'checkmark-done-circle-outline' : 'notifications-off-outline'}
              size={IconSize['4xl']}
              color={Colors.gray[400]}
            />
            <Text style={styles.emptyText}>
              {filter === 'unread'
                ? 'Semua notifikasi sudah dibaca'
                : 'Tidak ada notifikasi'}
            </Text>
            {filter === 'unread' && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => setFilter('all')}
                activeOpacity={0.7}
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
      {notifications.length === 0 && (
        <View style={styles.infoFooter}>
          <Ionicons name="information-circle-outline" size={IconSize.base} color={Colors.gray[500]} />
          <Text style={styles.infoFooterText}>
            Notifikasi akan muncul ketika ada update terkait pengajuan Anda
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingTop: Spacing['5xl'],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  badge: {
    backgroundColor: Colors.black,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterTabActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  filterTabText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.gray[600],
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.base,
    borderWidth: 1.5,
    borderColor: Colors.black,
  },
  actionBannerTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  actionBannerText: {
    fontSize: Typography.size.xs,
    color: Colors.gray[600],
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray[100],
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  markAllButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
  },
  list: {
    padding: Spacing.base,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.black,
    backgroundColor: Colors.gray[50],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
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
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
    flex: 1,
    lineHeight: Typography.size.base * 1.4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.black,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  message: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
    lineHeight: Typography.size.sm * 1.4,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  caseNumber: {
    fontSize: Typography.size.xs,
    color: Colors.gray[700],
    fontWeight: Typography.weight.semibold,
  },
  date: {
    fontSize: Typography.size.xs - 1,
    color: Colors.gray[400],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.black,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.base,
    ...Shadows.sm,
  },
  actionButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'] + Spacing.base,
  },
  emptyText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
  },
  showAllButton: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  showAllButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  infoFooterText: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    textAlign: 'center',
  },
});