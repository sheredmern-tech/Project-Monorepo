import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { getActiveCase, hasActiveCase as checkHasActiveCase, getCompletedCases } from '../utils/case-helpers';

export default function MyHomeScreen({ navigation }: any) {
  const { cases, loadCases, isLoadingCases } = useStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCases(true);
    setRefreshing(false);
  };

  const MY_ACTIVE_CASE = getActiveCase(cases);
  const MY_CASE_HISTORY = getCompletedCases(cases);
  const hasActive = checkHasActiveCase(cases);

  const handleCreateCase = () => {
    if (hasActive) {
      Alert.alert(
        'Pengajuan Aktif',
        'Anda sudah memiliki 1 pengajuan yang sedang berjalan. Selesaikan pengajuan ini terlebih dahulu sebelum membuat yang baru.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('CreateCase');
  };

  const getDaysUntilDeadline = () => {
    if (!MY_ACTIVE_CASE?.deadline) return null;
    const deadline = new Date(MY_ACTIVE_CASE.deadline);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysUntilDeadline();

  if (isLoadingCases && cases.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pengajuan Saya</Text>
        <Text style={styles.subtitle}>
          {hasActive ? '1 Active Case' : 'No Active Case'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ACTIVE CASE CARD */}
        {hasActive && MY_ACTIVE_CASE && (
          <View style={styles.activeCard}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>🔥 ACTIVE</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CaseDetail', { caseId: MY_ACTIVE_CASE.id })
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.serviceIcon}>{MY_ACTIVE_CASE.service?.icon || '📋'}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.serviceName}>
                    {MY_ACTIVE_CASE.service?.name || 'Legal Service'}
                  </Text>
                  <Text style={styles.caseNumber}>
                    {MY_ACTIVE_CASE.case_number}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(MY_ACTIVE_CASE.current_phase / 3) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Phase {MY_ACTIVE_CASE.current_phase} of 3 ({Math.round((MY_ACTIVE_CASE.current_phase / 3) * 100)}%)
                </Text>
              </View>

              {/* Phase 2 Action */}
              {MY_ACTIVE_CASE.current_phase === 2 && !MY_ACTIVE_CASE.phase_2_skipped && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('Phase2Upload', {
                      caseId: MY_ACTIVE_CASE.id,
                    })
                  }
                >
                  <Text style={styles.actionButtonIcon}>📤</Text>
                  <Text style={styles.actionButtonText}>
                    Upload Dokumen Tambahan
                  </Text>
                </TouchableOpacity>
              )}

              {/* Deadline Warning */}
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 5 && (
                <View style={styles.deadlineWarning}>
                  <Text style={styles.deadlineWarningIcon}>⏰</Text>
                  <Text style={styles.deadlineWarningText}>
                    {daysLeft} hari lagi untuk upload dokumen!
                  </Text>
                </View>
              )}

              {/* Meeting Info */}
              {MY_ACTIVE_CASE.meeting_date && (
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingIcon}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.meetingTitle}>Meeting Dijadwalkan</Text>
                    <Text style={styles.meetingDate}>
                      {new Date(MY_ACTIVE_CASE.meeting_date).toLocaleDateString(
                        'id-ID',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Text>
                    {MY_ACTIVE_CASE.meeting_location && (
                      <Text style={styles.meetingLocation}>
                        📍 {MY_ACTIVE_CASE.meeting_location}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* NO ACTIVE CASE - CTA */}
        {!hasActive && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Tidak Ada Pengajuan Aktif</Text>
            <Text style={styles.emptyText}>
              Anda belum memiliki pengajuan yang sedang berjalan.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateCase}
            >
              <Text style={styles.createButtonText}>+ Buat Pengajuan Baru</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORY SECTION */}
        {MY_CASE_HISTORY.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📜 Riwayat Pengajuan</Text>
            {MY_CASE_HISTORY.map((historyCase) => (
              <TouchableOpacity
                key={historyCase.id}
                style={styles.historyCard}
                onPress={() =>
                  navigation.navigate('CaseDetail', { caseId: historyCase.id })
                }
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyIcon}>{historyCase.service_icon}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.historyServiceName}>
                      {historyCase.service_name}
                    </Text>
                    <Text style={styles.historyCaseNumber}>
                      {historyCase.case_number}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      historyCase.status === 'completed' && styles.statusCompleted,
                      historyCase.status === 'cancelled' && styles.statusCancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {historyCase.status === 'completed' ? '✅ Selesai' : '❌ Batal'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyDate}>
                  Selesai: {new Date(historyCase.completed_at!).toLocaleDateString('id-ID')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  activeCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#3b82f6',
    position: 'relative',
  },
  activeBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    fontSize: 48,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  caseNumber: {
    fontSize: 13,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deadlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deadlineWarningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  deadlineWarningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  meetingInfo: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  meetingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  meetingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 12,
    color: '#047857',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIcon: {
    fontSize: 32,
  },
  historyServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyCaseNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});