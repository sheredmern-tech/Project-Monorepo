import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { DOCUMENT_CATEGORIES } from '../utils/constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryPicker({ value, onChange }: Props) {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{value || 'Select category'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Category</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {DOCUMENT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.option}
                  onPress={() => {
                    onChange(category);
                    setVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    value === category && styles.optionTextSelected,
                  ]}>
                    {category}
                  </Text>
                  {value === category && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  optionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#3b82f6',
  },
});