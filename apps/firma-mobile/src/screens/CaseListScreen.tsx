import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MOCK_CASES, Case } from '../mocks/cases.mock';

export default function CaseListScreen({ navigation }: any) {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setCases(MOCK_CASES);
      setRefreshing(false);
    }, 1000);
  };

  const getPhaseLabel = (phase: number, skipped: boolean) => {
    if (phase === 2 && skipped) {
      return 'Phase 3 (P2 Skipped)';
    }
    return `Phase ${phase}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'phase_0':
        return '#6b7280';
      case 'phase_1':
        return '#3b82f6';
      case 'phase_2':
        return '#f59e0b';
      case 'phase_3':
        return '#10b981';
      default:
        return '#6b7280';
    }
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
    { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
  >
  <Text
            style={ [styles.statusText, { color: getStatusColor(item.status) }] }
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

return (
  <View style= { styles.container } >
  <View style={ styles.header }>
    <Text style={ styles.title }> My Cases </Text>
      < Text style = { styles.subtitle } > { cases.length } Active Cases </Text>
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
  <Text style={ styles.emptyIcon }>📋</Text>
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
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  lawyer: {
    fontSize: 14,
    color: '#374151',
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  skipBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  skipBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  meetingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  meetingText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
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
  },
});