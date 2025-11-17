import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import type { Document } from '../types';

interface Props {
  document: Document;
  onPress: () => void;
}

export default function DocumentCard({ document, onPress }: Props) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      KTP: '#3b82f6',
      'KK (Kartu Keluarga)': '#10b981',
      'Akta Kelahiran': '#8b5cf6',
      'Akta Nikah': '#ec4899',
      'Surat Kuasa': '#f59e0b',
      'Surat Perjanjian': '#f97316',
      'Bukti Pembayaran': '#06b6d4',
      Lainnya: '#6b7280',
    };
    return colors[category] || colors['Lainnya'];
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return '✓';
      case 'pending': return '⏳';
      case 'uploading': return '⬆️';
      case 'failed': return '⚠️';
      default: return '';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📄</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.fileName} numberOfLines={1}>
            {document.fileName}
          </Text>
          <Text style={styles.date}>
            {document.uploadedAt
              ? format(new Date(document.uploadedAt), 'dd MMM yyyy, HH:mm')
              : 'Pending upload'}
          </Text>
        </View>
        <Text style={styles.syncIcon}>{getSyncStatusIcon(document.syncStatus)}</Text>
      </View>
      <View
        style={[
          styles.categoryBadge,
          { backgroundColor: getCategoryColor(document.category) + '20' },
        ]}
      >
        <Text
          style={[styles.categoryText, { color: getCategoryColor(document.category) }]}
        >
          {document.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  syncIcon: {
    fontSize: 18,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});