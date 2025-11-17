import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { hasActiveCase, MY_ACTIVE_CASE } from '../mocks/my-cases.mock';

// Available services
const SERVICES = [
  {
    id: 'sertifikat-tanah',
    name: 'Sertifikat Tanah',
    category: 'Pertanahan',
    icon: '🏡',
    description: 'Pengurusan sertifikat hak atas tanah',
    phase_1_docs: [
      'KTP',
      'Kartu Keluarga',
      'Girik/Surat Tanah',
      'Foto Lokasi (4 sudut)',
    ],
    estimated_duration: '30-45 hari kerja',
  },
  {
    id: 'pendirian-pt',
    name: 'Pendirian PT',
    category: 'Badan Usaha',
    icon: '🏢',
    description: 'Pendirian Perseroan Terbatas (PT)',
    phase_1_docs: [
      'KTP Direktur',
      'KTP Komisaris',
      'NPWP Direktur',
      'Pas Foto 3x4',
    ],
    estimated_duration: '14-21 hari kerja',
  },
  {
    id: 'konsultasi-hukum',
    name: 'Konsultasi Hukum',
    category: 'Konsultasi',
    icon: '⚖️',
    description: 'Konsultasi masalah hukum dengan lawyer berpengalaman',
    phase_1_docs: ['KTP', 'Surat/Dokumen Masalah (opsional)'],
    estimated_duration: '1-3 hari kerja',
  },
  {
    id: 'perizinan-usaha',
    name: 'Perizinan Usaha (NIB)',
    category: 'Perizinan',
    icon: '📋',
    description: 'Pengurusan Nomor Induk Berusaha (NIB)',
    phase_1_docs: ['KTP Pemilik', 'NPWP', 'Akta Perusahaan (jika ada)'],
    estimated_duration: '7-14 hari kerja',
  },
  {
    id: 'akta-notaris',
    name: 'Pembuatan Akta Notaris',
    category: 'Notaris',
    icon: '📜',
    description: 'Pembuatan akta perjanjian, jual-beli, hibah, dll',
    phase_1_docs: ['KTP Para Pihak', 'Dokumen Objek Akta'],
    estimated_duration: '5-10 hari kerja',
  },
];

export default function CreateCaseScreen({ navigation }: any) {
  const [step, setStep] = useState(1); // 1: check, 2: pilih layanan, 3: isi detail, 4: konfirmasi
  const [selectedService, setSelectedService] = useState<any>(null);
  const [caseTitle, setCaseTitle] = useState('');
  const [description, setDescription] = useState('');

  // ===================================================================
  // STEP 0: CHECK IF USER HAS ACTIVE CASE
  // ===================================================================
  useEffect(() => {
    if (hasActiveCase()) {
      // Block immediately - show warning
      Alert.alert(
        '⚠️ Pengajuan Sudah Ada',
        `Anda sudah memiliki pengajuan aktif:\n\n"${MY_ACTIVE_CASE.service_name}"\n(${MY_ACTIVE_CASE.case_number})\n\nSelesaikan pengajuan ini terlebih dahulu sebelum membuat yang baru.`,
        [
          {
            text: 'Lihat Pengajuan',
            onPress: () => {
              navigation.replace('Main', {
                screen: 'MyHome',
              });
            },
          },
          {
            text: 'Kembali',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, []);

  // Don't render form if has active case
  if (hasActiveCase()) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedIcon}>🚫</Text>
        <Text style={styles.blockedTitle}>Tidak Dapat Membuat Pengajuan Baru</Text>
        <Text style={styles.blockedText}>
          Anda sudah memiliki 1 pengajuan aktif
        </Text>
        <View style={styles.activeInfoCard}>
          <Text style={styles.activeInfoIcon}>{MY_ACTIVE_CASE.service_icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeInfoService}>
              {MY_ACTIVE_CASE.service_name}
            </Text>
            <Text style={styles.activeInfoNumber}>
              {MY_ACTIVE_CASE.case_number}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.blockedButton}
          onPress={() => navigation.replace('Main', { screen: 'MyHome' })}
        >
          <Text style={styles.blockedButtonText}>Lihat Pengajuan Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================================
  // STEP 1: SELECT SERVICE
  // ===================================================================
  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setStep(2);
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pilih Layanan</Text>
          <Text style={styles.subtitle}>Layanan apa yang Anda butuhkan?</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>💡</Text>
            <Text style={styles.infoBannerText}>
              Anda hanya dapat membuat 1 pengajuan aktif. Selesaikan pengajuan sebelumnya untuk membuat yang baru.
            </Text>
          </View>

          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleSelectService(service)}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIconText}>{service.icon}</Text>
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
                <View style={styles.serviceMeta}>
                  <Text style={styles.serviceCategory}>📂 {service.category}</Text>
                  <Text style={styles.serviceDuration}>
                    ⏱️ {service.estimated_duration}
                  </Text>
                </View>
              </View>
              <Text style={styles.serviceArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ===================================================================
  // STEP 2: FILL DETAILS
  // ===================================================================
  const handleNext = () => {
    if (!caseTitle.trim()) {
      Alert.alert('Error', 'Mohon isi judul pengajuan');
      return;
    }

    if (caseTitle.trim().length < 5) {
      Alert.alert('Error', 'Judul pengajuan minimal 5 karakter');
      return;
    }

    setStep(3);
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detail Pengajuan</Text>
          <Text style={styles.subtitle}>{selectedService?.name}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Selected Service Info */}
          <View style={styles.selectedServiceCard}>
            <Text style={styles.selectedServiceIcon}>
              {selectedService?.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedServiceName}>
                {selectedService?.name}
              </Text>
              <Text style={styles.selectedServiceCategory}>
                {selectedService?.category}
              </Text>
              <Text style={styles.selectedServiceDuration}>
                ⏱️ Estimasi: {selectedService?.estimated_duration}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>
              Judul Pengajuan <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Sertifikat Tanah Rumah Saya di Jakarta"
              value={caseTitle}
              onChangeText={setCaseTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{caseTitle.length}/100</Text>

            <Text style={styles.label}>Deskripsi (opsional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ceritakan detail kebutuhan Anda..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            {/* Required Docs Preview */}
            <View style={styles.docsPreview}>
              <Text style={styles.docsPreviewTitle}>
                📄 Dokumen yang Perlu Diupload (Phase 1):
              </Text>
              {selectedService?.phase_1_docs.map((doc: string, index: number) => (
                <View key={index} style={styles.docItem}>
                  <Text style={styles.docBullet}>•</Text>
                  <Text style={styles.docName}>{doc}</Text>
                </View>
              ))}
              <Text style={styles.docsNote}>
                💡 Dokumen tambahan mungkin diminta setelah review tim
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Lanjut →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ===================================================================
  // STEP 3: CONFIRMATION
  // ===================================================================
  const handleSubmit = () => {
    Alert.alert(
      '✅ Konfirmasi Pengajuan',
      `Buat pengajuan "${caseTitle}"?\n\nAnda akan diarahkan untuk upload dokumen setelah ini.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Buat',
          onPress: () => {
            // In real app: call API to create case
            Alert.alert(
              'Pengajuan Dibuat! 🎉',
              `Pengajuan "${caseTitle}" berhasil dibuat.\n\nSelanjutnya: Upload dokumen yang diperlukan.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to Upload screen
                    navigation.replace('Main', {
                      screen: 'MyHome',
                    });
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Konfirmasi</Text>
        <Text style={styles.subtitle}>Pastikan data sudah benar</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmIcon}>✅</Text>
          <Text style={styles.confirmTitle}>Siap Dibuat!</Text>

          <View style={styles.confirmSection}>
            <Text style={styles.confirmSectionTitle}>Layanan:</Text>
            <View style={styles.confirmServiceCard}>
              <Text style={styles.confirmServiceIcon}>
                {selectedService?.icon}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.confirmServiceName}>
                  {selectedService?.name}
                </Text>
                <Text style={styles.confirmServiceCategory}>
                  {selectedService?.category}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.confirmSection}>
            <Text style={styles.confirmSectionTitle}>Judul:</Text>
            <Text style={styles.confirmValue}>{caseTitle}</Text>
          </View>

          {description && (
            <View style={styles.confirmSection}>
              <Text style={styles.confirmSectionTitle}>Deskripsi:</Text>
              <Text style={styles.confirmValue}>{description}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.nextStepTitle}>📋 Langkah Selanjutnya:</Text>
          <View style={styles.nextStepList}>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>1</Text>
              <Text style={styles.nextStepText}>
                Upload {selectedService?.phase_1_docs.length} dokumen awal
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>2</Text>
              <Text style={styles.nextStepText}>
                Tunggu review tim (1-2 hari kerja)
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>3</Text>
              <Text style={styles.nextStepText}>
                Upload dokumen tambahan (jika diperlukan)
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>4</Text>
              <Text style={styles.nextStepText}>
                Jadwal meeting/konsultasi
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>✓ Buat Pengajuan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  blockedContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  blockedIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  blockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  blockedText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  activeInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginBottom: 24,
    width: '100%',
  },
  activeInfoIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  activeInfoService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activeInfoNumber: {
    fontSize: 13,
    color: '#6b7280',
  },
  blockedButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  blockedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceIconText: {
    fontSize: 28,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceCategory: {
    fontSize: 11,
    color: '#9ca3af',
  },
  serviceDuration: {
    fontSize: 11,
    color: '#9ca3af',
  },
  serviceArrow: {
    fontSize: 20,
    color: '#3b82f6',
  },
  selectedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  selectedServiceIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 2,
  },
  selectedServiceCategory: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 4,
  },
  selectedServiceDuration: {
    fontSize: 11,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: -8,
  },
  docsPreview: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  docsPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  docItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  docBullet: {
    fontSize: 14,
    color: '#92400e',
    marginRight: 8,
  },
  docName: {
    fontSize: 14,
    color: '#92400e',
  },
  docsNote: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 8,
    fontStyle: 'italic',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmSectionTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  confirmServiceCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  confirmServiceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  confirmServiceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  confirmServiceCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  confirmValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  nextStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  nextStepList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  nextStepText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});