import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import { getCaseById, CaseDocument } from '../mocks/cases.mock';

interface UploadedFile {
  docId: string;
  uri: string;
  name: string;
  type: string;
  size: number;
}

export default function Phase2UploadScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const caseData = getCaseById(caseId);

  const [phase2Docs, setPhase2Docs] = useState<CaseDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (caseData) {
      const docs = caseData.documents.filter((d) => d.phase === 2);
      setPhase2Docs(docs);
      checkCanSubmit(docs, []);
    }
  }, [caseData]);

  const checkCanSubmit = (docs: CaseDocument[], uploads: UploadedFile[]) => {
    // Only check REQUIRED documents
    const requiredDocs = docs.filter((doc) => doc.is_required);
    const allRequiredUploaded = requiredDocs.every((doc) => {
      // Check if already uploaded to server
      if (doc.file_url) return true;
      // Check if uploaded locally
      return uploads.some((upload) => upload.docId === doc.id);
    });

    setCanSubmit(allRequiredUploaded);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const handleTakePhoto = async (docId: string) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      handleFileSelected(docId, {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
      });
    }
  };

  const handlePickFile = async (docId: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets[0]) {
      const asset = result.assets[0];
      handleFileSelected(docId, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
      });
    }
  };

  const handleFileSelected = (
    docId: string,
    file: { uri: string; name: string; type: string; size: number }
  ) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Alert.alert('Error', 'File size must be less than 10MB');
      return;
    }

    // Add or update uploaded file
    const newUploads = uploadedFiles.filter((u) => u.docId !== docId);
    newUploads.push({ docId, ...file });
    setUploadedFiles(newUploads);

    // Re-check if can submit
    checkCanSubmit(phase2Docs, newUploads);

    Alert.alert('Success', `File "${file.name}" selected!`);
  };

  const handleRemoveFile = (docId: string) => {
    Alert.alert('Remove File', 'Remove this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newUploads = uploadedFiles.filter((u) => u.docId !== docId);
          setUploadedFiles(newUploads);
          checkCanSubmit(phase2Docs, newUploads);
        },
      },
    ]);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Error', 'Please upload all REQUIRED documents!');
      return;
    }

    Alert.alert(
      'Submit Phase 2',
      `Upload ${uploadedFiles.length} document(s)?\n\n(Mock: Files will not actually upload in demo)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            // In real app, upload files here
            console.log('📤 Uploading files:', uploadedFiles);

            Alert.alert(
              'Success! 🎉',
              'Documents submitted successfully!\n\nIn production, files would be uploaded to server.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderDocumentCard = (doc: CaseDocument) => {
    const uploadedFile = uploadedFiles.find((u) => u.docId === doc.id);
    const hasFile = !!doc.file_url || !!uploadedFile;

    return (
      <View key= { doc.id } style = { styles.docCard } >
        <View style={ styles.docHeader }>
          <View style={ { flex: 1 } }>
            <Text style={ styles.docType }> { doc.document_type } </Text>
    {
      doc.is_optional && (
        <Text style={ styles.docOptional }> (Optional) </Text>
            )
}
{
  doc.is_required && (
    <Text style={ styles.docRequired }>* Required </Text>
            )
}
</View>
{
  hasFile ? (
    <View style= { styles.statusBadge } >
    <Text style={ styles.statusBadgeText }>✓ Uploaded </Text>
      </View>
          ) : (
    <View style= { [styles.statusBadge, styles.statusBadgePending]} >
    <Text style={ [styles.statusBadgeText, styles.statusBadgeTextPending] }>
                ❌ Not Uploaded
    </Text>
    </View>
          )
}
</View>

{
  uploadedFile && (
    <View style={ styles.filePreview }>
    {
      uploadedFile.type.startsWith('image/') ? (
        <Image
                source= {{ uri: uploadedFile.uri }
}
style = { styles.imagePreview }
  />
            ) : (
  <View style= { styles.filePlaceholder } >
  <Text style={ styles.fileIcon }>📄</Text>
    </View>
            )}
<View style={ styles.fileInfo }>
  <Text style={ styles.fileName } numberOfLines = { 1} >
    { uploadedFile.name }
    </Text>
    < Text style = { styles.fileSize } >
      {(uploadedFile.size / 1024).toFixed(2)} KB
        </Text>
        </View>
        </View>
        )}

{
  doc.file_url && !uploadedFile && (
    <View style={ styles.serverFile }>
      <Text style={ styles.serverFileIcon }>☁️</Text>
        < Text style = { styles.serverFileText } > Already uploaded to server </Text>
          </View>
        )
}

{
  !hasFile && (
    <View style={ styles.actions }>
      <TouchableOpacity
              style={ styles.actionButton }
  onPress = {() => handleTakePhoto(doc.id)
}
            >
  <Text style={ styles.actionIcon }>📷</Text>
    < Text style = { styles.actionText } > Take Photo </Text>
      </TouchableOpacity>

      < TouchableOpacity
style = { styles.actionButton }
onPress = {() => handlePickFile(doc.id)}
            >
  <Text style={ styles.actionIcon }>📁</Text>
    < Text style = { styles.actionText } > Pick File </Text>
      </TouchableOpacity>
      </View>
        )}

{
  uploadedFile && (
    <TouchableOpacity
            style={ styles.removeButton }
  onPress = {() => handleRemoveFile(doc.id)
}
          >
  <Text style={ styles.removeButtonText }>🗑️ Remove File </Text>
    </TouchableOpacity>
        )}
</View>
    );
  };

if (!caseData) {
  return (
    <View style= { styles.container } >
    <Text>Case not found </Text>
      </View>
    );
}

const requiredDocs = phase2Docs.filter((d) => d.is_required);
const optionalDocs = phase2Docs.filter((d) => d.is_optional);

return (
  <View style= { styles.container } >
  {/* Header */ }
  < View style = { styles.header } >
    <TouchableOpacity onPress={ () => navigation.goBack() }>
      <Text style={ styles.backButton }>← Back </Text>
        </TouchableOpacity>
        < Text style = { styles.title } > Phase 2 Documents </Text>
          < Text style = { styles.subtitle } > { caseData.case_number } </Text>
            </View>

            < ScrollView style = { styles.content } >
              {/* Info Banner */ }
              < View style = { styles.infoBanner } >
                <Text style={ styles.infoBannerIcon }>💡</Text>
                  < Text style = { styles.infoBannerText } >
                    Upload all REQUIRED documents to proceed.{ '\n' }
            OPTIONAL documents can be skipped.
          </Text>
  </View>

{/* Progress */ }
<View style={ styles.progressCard }>
  <Text style={ styles.progressTitle }> Upload Progress </Text>
    < View style = { styles.progressBar } >
      <View
              style={
  [
    styles.progressFill,
    {
      width: `${(uploadedFiles.filter((u) =>
        requiredDocs.some((d) => d.id === u.docId)
      ).length /
        requiredDocs.length) *
        100
        }%`,
    },
  ]
}
            />
  </View>
  < Text style = { styles.progressText } >
  {
    uploadedFiles.filter((u) =>
      requiredDocs.some((d) => d.id === u.docId)
    ).length
  }{ ' ' }
            / {requiredDocs.length} required documents uploaded
  </Text>
  </View>

{/* Required Documents */ }
<View style={ styles.section }>
  <Text style={ styles.sectionTitle }>📤 Required Documents </Text>
    < Text style = { styles.sectionSubtitle } >
      You must upload all of these documents
        </Text>
{ requiredDocs.map(renderDocumentCard) }
</View>

{/* Optional Documents */ }
{
  optionalDocs.length > 0 && (
    <View style={ styles.section }>
      <Text style={ styles.sectionTitle }>📎 Optional Documents </Text>
        < Text style = { styles.sectionSubtitle } >
          These documents are optional - you can skip them
            </Text>
  { optionalDocs.map(renderDocumentCard) }
  </View>
        )
}
</ScrollView>

{/* Submit Button */ }
<View style={ styles.footer }>
  {!canSubmit && (
    <View style={ styles.warningBanner }>
      <Text style={ styles.warningIcon }>⚠️</Text>
        < Text style = { styles.warningText } >
          Upload all REQUIRED documents to enable submit
            </Text>
            </View>
        )}

<TouchableOpacity
          style={ [styles.submitButton, !canSubmit && styles.submitButtonDisabled] }
onPress = { handleSubmit }
disabled = {!canSubmit}
        >
  <Text style={ styles.submitButtonText }>
    { canSubmit? '✓ Submit Phase 2': '🔒 Complete Required Documents' }
    </Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
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
  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  docCard: {
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
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  docOptional: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  docRequired: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ecfdf5',
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  statusBadgeTextPending: {
    color: '#92400e',
  },
  filePreview: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  filePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  serverFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  serverFileIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  serverFileText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});