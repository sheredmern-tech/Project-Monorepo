# 🚀 FIRMA MOBILE - DATABASE INTEGRATION GUIDE

## ✅ COMPLETED CHANGES

### 1. **API Service** (`src/services/api.service.ts`)
- ✅ Added complete CRUD operations for all entities
- ✅ Proper error handling with token refresh
- ✅ Support for multipart/form-data uploads
- ✅ Request/response logging for debugging

### 2. **Types** (`src/types/index.ts`)
- ✅ Complete type definitions matching backend schema
- ✅ Legacy compatibility types for existing screens
- ✅ Proper enum types for statuses and roles
- ✅ Pagination and filter types

### 3. **Data Transform Service** (`src/services/data-transform.service.ts`)
- ✅ Transform backend Perkara → mobile Case format
- ✅ Transform backend DokumenHukum → mobile Document format
- ✅ Utility functions for formatting and colors
- ✅ Phase skip logic implementation

### 4. **Sync Service** (`src/services/sync.service.ts`)
- ✅ Auto-sync every 30 seconds when online
- ✅ Upload queue management with retry logic
- ✅ Exponential backoff for failed uploads
- ✅ Offline-first data persistence

### 5. **Storage Service** (`src/services/storage.service.ts`)
- ✅ AsyncStorage wrapper with type safety
- ✅ Separate caches for cases, documents, tasks
- ✅ Upload queue persistence
- ✅ Cache management utilities

### 6. **Zustand Store** (`src/store/index.ts`)
- ✅ Complete state management for all entities
- ✅ Automatic cache-first loading
- ✅ Network status awareness
- ✅ Queue management for offline operations

### 7. **Constants** (`src/utils/constants.ts`)
- ✅ API endpoints configuration
- ✅ Extended storage keys
- ✅ Phase configuration
- ✅ Validation rules

---

## 🔧 MIGRATION STEPS

### Step 1: Update API URL
```typescript
// In src/utils/constants.ts
export const API_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3000/api' // ← Replace with your IP
  : 'https://your-production-api.com/api';
```

### Step 2: Update Screen Imports
Replace mock imports in your screens:

```typescript
// BEFORE (using mocks)
import { MOCK_CASES, Case } from '../mocks/cases.mock';

// AFTER (using store)
import { useStore } from '../store';
import type { Case } from '../types';
```

### Step 3: Update CaseListScreen

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import dataTransformService from '../services/data-transform.service';

export default function CaseListScreen({ navigation }: any) {
  const { 
    cases, 
    isLoadingCases, 
    casesError, 
    loadCases,
    syncStatus 
  } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load cases on mount
    loadCases();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCases(true); // Force refresh
    setRefreshing(false);
  };

  const renderCaseCard = ({ item }: { item: Case }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.caseNumber}>{item.case_number}</Text>
        <View style={[
          styles.phaseBadge, 
          { backgroundColor: dataTransformService.getPhaseColor(item.current_phase) }
        ]}>
          <Text style={styles.phaseText}>
            {dataTransformService.getPhaseLabel(item.current_phase, item.phase_2_skipped)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.clientName}>{item.client.name}</Text>
      <Text style={styles.serviceType}>{item.service.category}</Text>
      
      {!syncStatus.isOnline && (
        <Text style={styles.offlineIndicator}>📴 Offline Mode</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoadingCases && cases.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading cases...</Text>
      </View>
    );
  }

  if (casesError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{casesError}</Text>
        <TouchableOpacity onPress={() => loadCases(true)}>
          <Text style={styles.retry}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={cases}
      keyExtractor={(item) => item.id}
      renderItem={renderCaseCard}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No cases found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  // ... your styles
});
```

### Step 4: Update CaseDetailScreen

```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useStore } from '../store';

export default function CaseDetailScreen({ route }: any) {
  const { caseId } = route.params;
  const { 
    currentCase, 
    documents,
    loadCaseById, 
    loadDocuments,
    isLoading 
  } = useStore();

  useEffect(() => {
    loadCaseById(caseId);
    loadDocuments(caseId);
  }, [caseId]);

  if (isLoading || !currentCase) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView>
      <Text>{currentCase.case_number}</Text>
      {/* Render case details */}
      
      <View>
        <Text>Documents ({documents.length})</Text>
        {documents.map(doc => (
          <View key={doc.id}>
            <Text>{doc.namaDokumen}</Text>
            <Text>{doc.reviewStatus}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

### Step 5: Update LoginScreen

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useStore } from '../store';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useStore();

  const handleLogin = async () => {
    const success = await login(email, password);
    
    if (success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', 'Please check your credentials');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Step 6: Update Document Upload

```typescript
import * as DocumentPicker from 'expo-document-picker';
import { useStore } from '../store';

const handleUpload = async () => {
  const { uploadDocument, currentCase } = useStore.getState();
  
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (!result.canceled && currentCase) {
    await uploadDocument(
      result.assets[0].uri,
      result.assets[0].name,
      result.assets[0].mimeType || 'application/octet-stream',
      currentCase.id,
      'KTP', // category
      1, // phase
      true // isRequired
    );
  }
};
```

---

## 🔥 TESTING CHECKLIST

### Offline Mode Testing
- [ ] Turn off WiFi/mobile data
- [ ] Create a case (should queue)
- [ ] Upload documents (should queue)
- [ ] Turn on network (should auto-sync)

### Authentication Testing
- [ ] Login with valid credentials
- [ ] Token refresh on 401
- [ ] Logout clears all data

### CRUD Operations
- [ ] Load cases list
- [ ] View case details
- [ ] Create new case
- [ ] Upload documents
- [ ] Update task status

### Sync Testing
- [ ] Pull-to-refresh works
- [ ] Auto-sync every 30 seconds
- [ ] Upload queue processing
- [ ] Retry failed uploads

---

## 🐛 TROUBLESHOOTING

### Issue: Network Request Failed
```bash
# Check API_URL in constants.ts
# Make sure it's your laptop's IP, not localhost
# For physical device: use ngrok or public IP
```

### Issue: 401 Unauthorized
```bash
# Check token is being sent
# Check backend CORS settings
# Verify JWT secret matches
```

### Issue: Upload Not Working
```bash
# Check multipart/form-data handling
# Verify file permissions
# Check file size limits
```

### Issue: Sync Not Triggering
```bash
# Check network listener
# Verify sync interval
# Check upload queue in AsyncStorage
```

---

## 📱 RUNNING THE APP

### Development
```bash
cd apps/firma-mobile
npm start
# Press 'a' for Android
# Press 'i' for iOS
```

### Clear Cache
```bash
npx expo start -c
```

### Build APK
```bash
eas build -p android --profile preview
```

---

## 🎯 NEXT STEPS

1. **Test with real backend**
   - Update API_URL with your server IP
   - Create test user account
   - Upload test documents

2. **Add Error Boundaries**
   - Wrap screens in error boundaries
   - Add crash reporting (Sentry)

3. **Performance Optimization**
   - Implement lazy loading
   - Add image caching
   - Optimize re-renders

4. **Security**
   - Add biometric authentication
   - Encrypt sensitive storage
   - Implement certificate pinning

5. **Polish UI/UX**
   - Add loading skeletons
   - Implement animations
   - Add haptic feedback

---

## 🤝 NEED HELP?

If you encounter issues:
1. Check console logs in Metro bundler
2. Use React Native Debugger
3. Check Network tab in Chrome DevTools
4. Verify backend logs
5. Test with Postman first

Good luck! 🚀 GAS GASSSSS!
