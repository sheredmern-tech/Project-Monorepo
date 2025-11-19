import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import dataTransformService from '../services/data-transform.service';
import type { Case } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows, IconSize } from '../theme/design-system';

export default function CaseListScreen({ navigation }: any) {
  const {
    cases,
    isLoadingCases,
    casesError,
    loadCases,
    syncStatus
  } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  // Load cases on mount
  useEffect(() => {
    loadCases();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCases(true); // Force refresh from server
    setRefreshing(false);
  };

  const getPhaseLabel = (phase: number, skipped: boolean) => {
    return dataTransformService.getPhaseLabel(phase, skipped);
  };

  const getStatusColor = (phase: number) => {
    return dataTransformService.getPhaseColor(phase);
  };

  const renderCaseCard = ({ item }: { item: Case }) => (
    <TouchableOpacity
      style= { styles.card }
  onPress = {() => navigation.navigate('CaseDetail', { caseId: item.id })
}
    >
  <View style={ styles.cardHeader }>
    <View>
    <Text style={ styles.caseNumber }> { item.case_number } </Text>
      < Text style = { styles.serviceName } > { item.service.name } </Text>
        </View>
        < View
style = {
  [
    styles.statusBadge,
    { backgroundColor: getStatusColor(item.current_phase) + '20' },
          ]}
  >
  <Text
            style={ [styles.statusText, { color: getStatusColor(item.current_phase) }] }
          >
  { getPhaseLabel(item.current_phase, item.phase_2_skipped) }
  </Text>
  </View>
  </View>

  < View style = { styles.cardBody } >
    <Text style={ styles.clientName }>👤 { item.client.name } </Text>
{
  item.assigned_to && (
    <Text style={ styles.lawyer }>👨‍💼 { item.assigned_to.name } </Text>
        )
}
</View>

{/* Progress Bar */ }
<View style={ styles.progressContainer }>
  <View style={ styles.progressBar }>
    <View
            style={
  [
    styles.progressPhase,
    item.current_phase >= 0 && styles.progressPhaseActive,
  ]
}
          >
  <Text style={ styles.progressPhaseText }> P0 </Text>
    </View>
    < View style = { styles.progressLine } />
      <View
            style={
  [
    styles.progressPhase,
    item.current_phase >= 1 && styles.progressPhaseActive,
  ]
}
          >
  <Text style={ styles.progressPhaseText }> P1 </Text>
    </View>
    < View style = { styles.progressLine } />
      <View
            style={
  [
    styles.progressPhase,
    item.current_phase >= 2 && styles.progressPhaseActive,
    item.phase_2_skipped && styles.progressPhaseSkipped,
  ]
}
          >
  <Text style={ styles.progressPhaseText }>
    { item.phase_2_skipped ? '⊘' : 'P2' }
    </Text>
    </View>
    < View style = { styles.progressLine } />
      <View
            style={
  [
    styles.progressPhase,
    item.current_phase >= 3 && styles.progressPhaseActive,
  ]
}
          >
  <Text style={ styles.progressPhaseText }> P3 </Text>
    </View>
    </View>
    </View>

{/* Special Badge if Phase 2 Skipped */ }
{
  item.phase_2_skipped && (
    <View style={ styles.skipBadge }>
      <Text style={ styles.skipBadgeText }>✓ Dokumen Lengkap - P2 Skipped </Text>
        </View>
      )
}

{/* Meeting Info if scheduled */ }
{
  item.meeting_date && (
    <View style={ styles.meetingInfo }>
      <Text style={ styles.meetingIcon }>📅</Text>
        < Text style = { styles.meetingText } >
          Meeting: {
    new Date(item.meeting_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  </Text>
    </View>
      )
}
</TouchableOpacity>
  );

  // Show loading on first load
  if (isLoadingCases && cases.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.black} />
        <Text style={styles.loadingText}>Loading cases...</Text>
      </View>
    );
  }

  // Show error if exists
  if (casesError && cases.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={IconSize['4xl']} color={Colors.gray[400]} />
        <Text style={styles.errorText}>{casesError}</Text>
        <TouchableOpacity
          onPress={() => loadCases(true)}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

return (
  <View style= { styles.container } >
  <View style={ styles.header }>
    <View style={styles.headerTop}>
      <View>
        <Text style={ styles.title }> Cases </Text>
        < Text style = { styles.subtitle } > { cases.length } total </Text>
      </View>
      <Ionicons name="folder-open-outline" size={IconSize.lg} color={Colors.black} />
    </View>
      {!syncStatus.isOnline && (
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline-outline" size={IconSize.sm} color={Colors.gray[600]} />
          <Text style={styles.offlineBadgeText}>Offline Mode</Text>
        </View>
      )}
        </View>

        < FlatList
data = { cases }
keyExtractor = {(item) => item.id}
renderItem = { renderCaseCard }
contentContainerStyle = { styles.list }
refreshControl = {
          < RefreshControl refreshing = { refreshing } onRefresh = { onRefresh } />
        }
ListEmptyComponent = {
          < View style = { styles.empty } >
  <Ionicons name="folder-open-outline" size={IconSize['4xl']} color={Colors.gray[300]} />
    < Text style = { styles.emptyText } > No cases found </Text>
      </View>
        }
      />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing['5xl'],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caseNumber: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  serviceName: {
    fontSize: Typography.size.sm,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  cardBody: {
    marginBottom: Spacing.md,
  },
  clientName: {
    fontSize: Typography.size.sm,
    color: Colors.gray[700],
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  lawyer: {
    fontSize: Typography.size.sm,
    color: Colors.gray[700],
    fontWeight: Typography.weight.medium,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPhase: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
  },
  progressPhaseActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  progressPhaseSkipped: {
    backgroundColor: Colors.gray[500],
    borderColor: Colors.gray[500],
  },
  progressPhaseText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.gray[500],
  },
  progressLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.gray[300],
    marginHorizontal: Spacing.xs,
  },
  skipBadge: {
    backgroundColor: Colors.gray[100],
    borderRadius: Radius.base,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  skipBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.gray[700],
    textAlign: 'center',
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: Spacing.sm,
    borderRadius: Radius.base,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  meetingIcon: {
    marginRight: Spacing.sm,
  },
  meetingText: {
    fontSize: Typography.size.xs,
    color: Colors.gray[700],
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.gray[400],
    marginTop: Spacing.base,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  errorText: {
    fontSize: Typography.size.base,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
  },
  retryButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.base,
    ...Shadows.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.base,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  offlineBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.gray[600],
  },
});