import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  MY_ACTIVE_CASE,
  MY_CASE_HISTORY,
  MyCase,
  CaseDocument,
  TimelineEvent,
} from '../mocks/my-cases.mock';

export default function CaseDetailScreen({ route, navigation }: any) {
  const { caseId } = route.params;

  // Find case from active or history
  let caseData: MyCase | undefined;
  if (MY_ACTIVE_CASE.id === caseId) {
    caseData = MY_ACTIVE_CASE;
  } else {
    caseData = MY_CASE_HISTORY.find((c) => c.id === caseId);
  }

  if (!caseData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Case not found</Text>
        </View>
      </View>
    );
  }

  const isActive = caseData.status === 'active';
  const isCompleted = caseData.status === 'completed';
  const isCancelled = caseData.status === 'cancelled';

  const handleNavigateToPhase2 = () => {
    if (!isActive) {
      Alert.alert('Info', 'Case sudah tidak aktif');
      return;
    }

    if (caseData.current_phase !== 2) {
      Alert.alert('Info', 'Case tidak berada di Phase 2');
      return;
    }

    navigation.navigate('Phase2Upload', { caseId: caseData.id });
  };

  const getPhaseIcon = (phase: number, skipped?: boolean) => {
    if (skipped) return '⊘';
    switch (phase) {
      case 0:
        return '📝';
      case 1:
        return '📤';
      case 2:
        return '📋';
      case 3:
        return '🏗️';
      default:
        return '●';
    }
  };

  const renderTimeline = (event: TimelineEvent, index: number) => (
    <View key={event.id} style={styles.timelineItem}>
      <View style={styles.timelineIconContainer}>
        <View
          style={[
            styles.timelineIcon,
            event.completed && styles.timelineIconCompleted,
            event.skipped && styles.timelineIconSkipped,
          ]}
        >
          <Text style={styles.timelineIconText}>
            {event.completed ? '✓' : getPhaseIcon(event.phase, event.skipped)}
          </Text>
        </View>
        {index < caseData!.timeline.length - 1 && (
          <View
            style={[
              styles.timelineLine,
              event.completed && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{event.title}</Text>
        <Text style={styles.timelineDescription}>{event.description}</Text>
        <Text style={styles.timelineDate}>
          {new Date(event.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  const renderDocument = (doc: CaseDocument) => (
    <View key={doc.id} style={styles.docItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.docName}>{doc.document_type}</Text>
        {doc.is_optional && (
          <Text style={styles.docOptional}>(Optional)</Text>
        )}
        {doc.is_required && (
          <Text style={styles.docRequired}>* Required</Text>
        )}
      </View>
      <View
        style={[
          styles.docStatus,
          doc.review_status === 'approved' && styles.docStatusApproved,
          doc.review_status === 'pending' && styles.docStatusPending,
          doc.review_status === 'rejected' && styles.docStatusRejected,
          !doc.file_url && styles.docStatusMissing,
        ]}
      >
        <Text style={styles.docStatusText}>
          {doc.review_status === 'approved'
            ? '✅'
            : doc.review_status === 'rejected'
              ? '❌'
              : doc.file_url
                ? '⏳'
                : '📤'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detail Pengajuan</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>🔥 ACTIVE CASE</Text>
          </View>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✅ COMPLETED</Text>
          </View>
        )}
        {isCancelled && (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledBadgeText}>❌ CANCELLED</Text>
          </View>
        )}

        {/* Case Info Card */}
        <View style={styles.card}>
          <View style={styles.caseHeader}>
            <Text style={styles.serviceIcon}>{caseData.service_icon}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.serviceName}>{caseData.service_name}</Text>
              <Text style={styles.caseNumber}>{caseData.case_number}</Text>
              <Text style={styles.serviceCategory}>
                📂 {caseData.service_category}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dibuat:</Text>
            <Text style={styles.infoValue}>
              {new Date(caseData.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {caseData.completed_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Selesai:</Text>
              <Text style={styles.infoValue}>
                {new Date(caseData.completed_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {caseData.deadline && isActive && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Deadline:</Text>
              <Text style={[styles.infoValue, styles.deadlineText]}>
                {new Date(caseData.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Progress (Only for Active) */}
        {isActive && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📊 Progress</Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressPhase,
                  caseData.current_phase >= 0 && styles.progressPhaseActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressPhaseText,
                    caseData.current_phase >= 0 &&
                    styles.progressPhaseTextActive,
                  ]}
                >
                  P0
                </Text>
              </View>
              <View
                style={[
                  styles.progressLine,
                  caseData.current_phase >= 1 && styles.progressLineActive,
                ]}
              />
              <View
                style={[
                  styles.progressPhase,
                  caseData.current_phase >= 1 && styles.progressPhaseActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressPhaseText,
                    caseData.current_phase >= 1 &&
                    styles.progressPhaseTextActive,
                  ]}
                >
                  P1
                </Text>
              </View>
              <View
                style={[
                  styles.progressLine,
                  caseData.current_phase >= 2 &&
                  !caseData.phase_2_skipped &&
                  styles.progressLineActive,
                  caseData.phase_2_skipped && styles.progressLineSkipped,
                ]}
              />
              <View
                style={[
                  styles.progressPhase,
                  caseData.current_phase >= 2 &&
                  !caseData.phase_2_skipped &&
                  styles.progressPhaseActive,
                  caseData.phase_2_skipped && styles.progressPhaseSkipped,
                ]}
              >
                <Text
                  style={[
                    styles.progressPhaseText,
                    caseData.current_phase >= 2 &&
                    styles.progressPhaseTextActive,
                  ]}
                >
                  {caseData.phase_2_skipped ? '⊘' : 'P2'}
                </Text>
              </View>
              <View
                style={[
                  styles.progressLine,
                  caseData.current_phase >= 3 && styles.progressLineActive,
                ]}
              />
              <View
                style={[
                  styles.progressPhase,
                  caseData.current_phase >= 3 && styles.progressPhaseActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressPhaseText,
                    caseData.current_phase >= 3 &&
                    styles.progressPhaseTextActive,
                  ]}
                >
                  P3
                </Text>
              </View>
            </View>

            <Text style={styles.progressPercentage}>
              {Math.round((caseData.current_phase / 3) * 100)}% Complete
            </Text>

            {caseData.phase_2_skipped && (
              <View style={styles.skipNotice}>
                <Text style={styles.skipNoticeIcon}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skipNoticeTitle}>Phase 2 Skipped</Text>
                  <Text style={styles.skipNoticeText}>
                    Semua dokumen sudah lengkap, tidak perlu dokumen tambahan
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Meeting Info */}
        {caseData.meeting_date && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📅 Jadwal Meeting</Text>
            <View style={styles.meetingCard}>
              <View style={styles.meetingRow}>
                <Text style={styles.meetingLabel}>Tanggal:</Text>
                <Text style={styles.meetingValue}>
                  {new Date(caseData.meeting_date).toLocaleDateString(
                    'id-ID',
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </Text>
              </View>
              <View style={styles.meetingRow}>
                <Text style={styles.meetingLabel}>Waktu:</Text>
                <Text style={styles.meetingValue}>
                  {new Date(caseData.meeting_date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </Text>
              </View>
              {caseData.meeting_location && (
                <View style={styles.meetingRow}>
                  <Text style={styles.meetingLabel}>Lokasi:</Text>
                  <Text style={styles.meetingValue}>
                    {caseData.meeting_location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Phase 2 Action Button (Only for Active + Phase 2) */}
        {isActive &&
          caseData.current_phase === 2 &&
          !caseData.phase_2_skipped && (
            <TouchableOpacity
              style={styles.phase2Button}
              onPress={handleNavigateToPhase2}
            >
              <Text style={styles.phase2ButtonText}>
                📤 Upload Dokumen Tambahan
              </Text>
            </TouchableOpacity>
          )}

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📁 Dokumen</Text>

          {/* Phase 1 Docs */}
          <View style={styles.docSection}>
            <Text style={styles.docSectionTitle}>Phase 1 - Dokumen Awal</Text>
            {caseData.phase_1_docs.map(renderDocument)}
          </View>

          {/* Phase 2 Docs */}
          {caseData.phase_2_docs.length > 0 && (
            <View style={styles.docSection}>
              <Text style={styles.docSectionTitle}>
                Phase 2 - Dokumen Tambahan
                {caseData.phase_2_skipped && ' (SKIPPED)'}
              </Text>
              {caseData.phase_2_docs.map(renderDocument)}
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📜 Timeline</Text>
          <View style={styles.timeline}>
            {caseData.timeline.map((event, index) =>
              renderTimeline(event, index)
            )}
          </View>
        </View>

        {/* Completion Info (Only for Completed) */}
        {isCompleted && (
          <View style={styles.completionCard}>
            <Text style={styles.completionIcon}>🎉</Text>
            <Text style={styles.completionTitle}>Pengajuan Selesai</Text>
            <Text style={styles.completionText}>
              Terima kasih telah menggunakan layanan kami. Semua proses telah
              selesai dengan baik.
            </Text>
            <Text style={styles.completionDate}>
              Selesai pada:{' '}
              {new Date(caseData.completed_at!).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
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
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  activeBadge: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelledBadge: {
    backgroundColor: '#6b7280',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelledBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    fontSize: 56,
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
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  deadlineText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressPhase: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPhaseActive: {
    backgroundColor: '#3b82f6',
  },
  progressPhaseSkipped: {
    backgroundColor: '#f59e0b',
  },
  progressPhaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressPhaseTextActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3b82f6',
  },
  progressLineSkipped: {
    backgroundColor: '#f59e0b',
  },
  progressPercentage: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  skipNotice: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 12,
  },
  skipNoticeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  skipNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  skipNoticeText: {
    fontSize: 12,
    color: '#047857',
  },
  meetingCard: {
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  meetingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  meetingLabel: {
    fontSize: 14,
    color: '#1e40af',
    width: 80,
    fontWeight: '600',
  },
  meetingValue: {
    fontSize: 14,
    color: '#1e3a8a',
    flex: 1,
  },
  phase2Button: {
    backgroundColor: '#3b82f6',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phase2ButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  docSection: {
    marginBottom: 20,
  },
  docSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
  },
  docName: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  docOptional: {
    fontSize: 11,
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  docRequired: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 2,
  },
  docStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  docStatusApproved: {
    backgroundColor: '#d1fae5',
  },
  docStatusPending: {
    backgroundColor: '#fef3c7',
  },
  docStatusRejected: {
    backgroundColor: '#fee2e2',
  },
  docStatusMissing: {
    backgroundColor: '#f3f4f6',
  },
  docStatusText: {
    fontSize: 16,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#3b82f6',
  },
  timelineIconSkipped: {
    backgroundColor: '#f59e0b',
  },
  timelineIconText: {
    fontSize: 18,
    color: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#3b82f6',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  timelineDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  completionCard: {
    backgroundColor: '#ecfdf5',
    margin: 16,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  completionDate: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
});