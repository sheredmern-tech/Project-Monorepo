import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import CategoryPicker from '../components/CategoryPicker';
import syncService from '../services/sync.service';
import { useStore } from '../store';

export default function UploadScreen({ navigation }: any) {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { updateSyncStatus, loadDocuments } = useStore();

  // Request camera permission
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Updated: Use array instead of MediaTypeOptions
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileName(asset.fileName || `photo_${Date.now()}.jpg`);
      setFileSize(asset.fileSize || 0);
      setFileType(asset.type || 'image/jpeg');
    }
  };

  // Pick file from gallery/documents
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets[0]) {
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileName(asset.name);
      setFileSize(asset.size || 0);
      setFileType(asset.mimeType || 'application/octet-stream');
    }
  };

  // Upload document
  const handleUpload = async () => {
    if (!fileUri) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Check file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      Alert.alert('Error', 'File size must be less than 10MB');
      return;
    }

    setLoading(true);

    try {
      // Add to upload queue (works offline!)
      await syncService.addToQueue(
        fileUri,
        fileName,
        fileSize,
        fileType,
        category
      );

      Alert.alert(
        'Success',
        'Document queued for upload. It will sync when online.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh documents and sync status
              loadDocuments();
              updateSyncStatus();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to queue document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upload Document</Text>
      </View>

      <View style={styles.previewContainer}>
        {fileUri ? (
          <View style={styles.preview}>
            {fileType.startsWith('image/') ? (
              <Image source={{ uri: fileUri }} style={styles.image} />
            ) : (
              <View style={styles.filePlaceholder}>
                <Text style={styles.fileIcon}>📄</Text>
                <Text style={styles.fileNameText} numberOfLines={2}>
                  {fileName}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>No file selected</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePickFile}>
          <Text style={styles.actionIcon}>📁</Text>
          <Text style={styles.actionText}>Pick File</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <CategoryPicker value={category} onChange={setCategory} />

        {fileUri && (
          <View style={styles.fileInfo}>
            <Text style={styles.infoLabel}>File Name:</Text>
            <Text style={styles.infoValue}>{fileName}</Text>

            <Text style={styles.infoLabel}>File Size:</Text>
            <Text style={styles.infoValue}>
              {(fileSize / 1024).toFixed(2)} KB
            </Text>

            <Text style={styles.infoLabel}>File Type:</Text>
            <Text style={styles.infoValue}>{fileType}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!fileUri || !category || loading) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!fileUri || !category || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          💡 Documents will be queued and synced automatically when online
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
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
  },
  previewContainer: {
    marginBottom: 24,
  },
  preview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  filePlaceholder: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  fileIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  fileNameText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyPreview: {
    height: 300,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  form: {
    gap: 16,
  },
  fileInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});