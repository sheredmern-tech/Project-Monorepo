# 📚 Internal Admin Document Management System - Implementation Plan

## 🎯 Project Overview

System management dokumen internal untuk admin dengan kemampuan **full CRUD** (Create, Read, Update, Delete) yang terintegrasi dengan **Google Drive API**.

---

## 🏗️ Architecture Overview

### **Tech Stack**
- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **UI Library**: shadcn/ui, Tailwind CSS
- **Cloud Storage**: Google Drive
- **APIs**: Google Drive API (v3)
- **Authentication**: OAuth 2.0

### **Core Concept**
```
Admin Dashboard
    ↓
Google Drive API (File Management)
    ↓
Google Drive Storage
    ↓
Embedded Google Docs/Sheets/Slides (View & Edit)
```

---

## 🎨 User Interface Design

### **File Detail Page Layout**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back   Document_Name.docx    [Edit] [Delete] [Share]      │
├─────────────────────────────────────────────────────────────┤
│                                        │ 📋 Informasi        │
│                                        │ ├─ 📏 Ukuran        │
│   [GOOGLE DOCS IFRAME]                 │ ├─ 🏷️ Tipe          │
│   • View Mode: Preview (read-only)     │ ├─ 📅 Upload        │
│   • Edit Mode: Full Editor             │ ├─ 👤 Uploaded by   │
│                                        │ └─ 📝 Last modified │
│                                        ├─────────────────────│
│                                        │ 📝 Deskripsi        │
│                                        │ [Editable text]     │
│                                        ├─────────────────────│
│                                        │ ⚡ Aksi             │
│                                        │ [Open in Drive]     │
│                                        │ [Download]          │
│                                        │ [Share]             │
│                                        │ [History]           │
└────────────────────────────────────────┴─────────────────────┘
```

---

## 🔑 Key Features

### **1. Document Viewing & Editing**

#### **View Mode (Default)**
- Embedded iframe dengan Google Docs preview
- Read-only mode
- Scroll, zoom, navigate halaman
- URL: `https://docs.google.com/document/d/{fileId}/preview`

#### **Edit Mode**
- Toggle ke full Google Docs editor
- Real-time auto-save (built-in Google Docs)
- All formatting features available
- Collaboration support (multiple users)
- URL: `https://docs.google.com/document/d/{fileId}/edit`

#### **Implementation**
```typescript
const [isEditMode, setIsEditMode] = useState(false);

// Dynamic iframe URL
const docUrl = isEditMode 
  ? `https://docs.google.com/document/d/${fileId}/edit`
  : `https://docs.google.com/document/d/${fileId}/preview`;

// Toggle button
<button onClick={() => setIsEditMode(!isEditMode)}>
  {isEditMode ? '✓ Selesai Edit' : '✏️ Edit Document'}
</button>

// Iframe
<iframe src={docUrl} width="100%" height="800px" />
```

### **2. File Management (CRUD)**

#### **Create**
```typescript
// Upload new file to Google Drive
const uploadFile = async (file: File) => {
  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId] // Optional: specify folder
    },
    media: {
      mimeType: file.type,
      body: file
    }
  });
  return response.data.id;
};
```

#### **Read**
```typescript
// List files
const listFiles = async () => {
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
    orderBy: 'modifiedTime desc'
  });
  return response.data.files;
};

// Get file metadata
const getFile = async (fileId: string) => {
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime, owners'
  });
  return response.data;
};
```

#### **Update**
```typescript
// Update file metadata (rename, move, etc)
const updateFile = async (fileId: string, updates: any) => {
  const response = await drive.files.update({
    fileId,
    requestBody: updates
  });
  return response.data;
};

// Update content: Via embedded Google Docs editor (auto-save!)
// NO API CALL NEEDED - Google Docs handles it automatically
```

#### **Delete**
```typescript
// Delete file
const deleteFile = async (fileId: string) => {
  await drive.files.delete({ fileId });
};
```

### **3. File Organization**

#### **Folder Structure**
```
Root Folder (Admin Internal)
├── HR Documents/
│   ├── Policies/
│   └── Templates/
├── Finance Documents/
│   ├── Budgets/
│   └── Invoices/
├── Operations/
│   ├── SOPs/
│   └── Guidelines/
└── Shared Resources/
```

#### **Create Folder**
```typescript
const createFolder = async (folderName: string, parentId?: string) => {
  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    }
  });
  return response.data.id;
};
```

### **4. Permission Management**

```typescript
// Share file with specific user
const shareFile = async (fileId: string, email: string, role: 'reader' | 'writer' | 'commenter') => {
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'user',
      role: role,
      emailAddress: email
    }
  });
};

// Make file accessible to anyone with link
const sharePublic = async (fileId: string) => {
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'anyone',
      role: 'reader'
    }
  });
};

// List permissions
const getPermissions = async (fileId: string) => {
  const response = await drive.permissions.list({
    fileId,
    fields: 'permissions(id, emailAddress, role, displayName)'
  });
  return response.data.permissions;
};
```

### **5. Version History**

```typescript
// Get revision history
const getRevisions = async (fileId: string) => {
  const response = await drive.revisions.list({
    fileId,
    fields: 'revisions(id, modifiedTime, lastModifyingUser, size)'
  });
  return response.data.revisions;
};

// Restore specific version
const restoreVersion = async (fileId: string, revisionId: string) => {
  await drive.revisions.update({
    fileId,
    revisionId,
    requestBody: {
      keepForever: true
    }
  });
};
```

---

## 🔐 Authentication Setup

### **1. Google Cloud Console Setup**
1. Buat project baru di [Google Cloud Console](https://console.cloud.google.com)
2. Enable APIs:
   - Google Drive API
   - (Optional) Google Docs API (kalo butuh advanced features)
3. Create OAuth 2.0 Credentials
4. Add authorized redirect URIs

### **2. OAuth Flow**
```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
  ]
});

// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
```

---

## 📊 Supported File Types

### **Google Workspace Files**
| Type | MIME Type | View URL | Edit URL |
|------|-----------|----------|----------|
| Google Docs | `application/vnd.google-apps.document` | `/preview` | `/edit` |
| Google Sheets | `application/vnd.google-apps.spreadsheet` | `/preview` | `/edit` |
| Google Slides | `application/vnd.google-apps.presentation` | `/preview` | `/edit` |

### **Microsoft Office Files**
| Type | MIME Type | Notes |
|------|-----------|-------|
| Word (.docx) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Convert to Google Docs for editing |
| Excel (.xlsx) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Convert to Google Sheets for editing |
| PowerPoint (.pptx) | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | Convert to Google Slides for editing |

### **Other Files**
- PDF: View only (no edit via iframe)
- Images: View only
- Videos: Embed player

### **File Conversion**
```typescript
// Convert uploaded file to Google Docs format
const convertToGoogleDocs = async (fileId: string) => {
  const response = await drive.files.copy({
    fileId,
    requestBody: {
      mimeType: 'application/vnd.google-apps.document'
    }
  });
  return response.data.id;
};
```

---

## 💰 Cost & Limits

### **Pricing**
- ✅ **Google Drive API: FREE**
- ✅ **Iframe Embed: FREE**
- ✅ **OAuth 2.0: FREE**

### **Rate Limits**
| Operation | Limit |
|-----------|-------|
| Queries per 100 seconds | 1,000 |
| Queries per day | 1,000,000,000 |

### **Storage Limits**
- Free: 15 GB
- Google Workspace: Unlimited (business plan)

---

## ⚡ Best Practices

### **1. Performance**
```typescript
// Batch requests untuk efficiency
const batchUpdate = async (updates: any[]) => {
  const batch = drive.newBatch();
  updates.forEach(update => {
    batch.add(drive.files.update(update));
  });
  await batch.execute();
};

// Cache file metadata
const fileCache = new Map();
const getCachedFile = async (fileId: string) => {
  if (fileCache.has(fileId)) {
    return fileCache.get(fileId);
  }
  const file = await getFile(fileId);
  fileCache.set(fileId, file);
  return file;
};
```

### **2. Error Handling**
```typescript
const safeApiCall = async (apiCall: () => Promise<any>) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.code === 404) {
      throw new Error('File tidak ditemukan');
    } else if (error.code === 403) {
      throw new Error('Akses ditolak. Periksa permission.');
    } else if (error.code === 429) {
      throw new Error('Terlalu banyak request. Coba lagi nanti.');
    }
    throw error;
  }
};
```

### **3. Security**
- Never expose API credentials di client-side
- Use environment variables
- Implement proper token refresh
- Validate file permissions before access
- Sanitize user inputs

---

## 🚀 Implementation Phases

### **Phase 1: MVP (Week 1-2)**
- ✅ OAuth authentication
- ✅ File listing (read)
- ✅ File viewing (iframe preview)
- ✅ Basic upload
- ✅ Basic delete

### **Phase 2: Core Features (Week 3-4)**
- ✅ Edit mode toggle (view ↔ edit)
- ✅ File metadata display
- ✅ Folder organization
- ✅ Search & filter
- ✅ Permission management

### **Phase 3: Advanced Features (Week 5-6)**
- ✅ Version history
- ✅ Activity log
- ✅ Bulk operations
- ✅ Advanced search
- ✅ File preview for multiple types

### **Phase 4: Polish & Optimization (Week 7-8)**
- ✅ Performance optimization
- ✅ Error handling improvements
- ✅ UI/UX refinements
- ✅ Testing & bug fixes
- ✅ Documentation

---

## 🎯 Key Decisions

### **✅ DECISIONS MADE**

1. **NO Google Docs API needed**
   - Use iframe embed for view & edit
   - Simpler implementation
   - All features available out-of-the-box

2. **Drive API Only**
   - Sufficient for all CRUD operations
   - Manage files, folders, permissions
   - Handle metadata updates

3. **Auto-save Built-in**
   - Google Docs handles all saving
   - No manual save implementation needed
   - Real-time sync automatic

4. **Iframe Approach**
   - Better UX (familiar interface)
   - Zero maintenance
   - Full feature parity with Google Docs

### **❌ DECISIONS REJECTED**

1. **Custom Editor**
   - Too complex
   - High maintenance
   - Reinventing the wheel

2. **Google Docs API for Editing**
   - Overkill for this use case
   - Complex index management
   - Rate limit concerns

3. **Download-Edit-Upload Flow**
   - Poor UX
   - No real-time collaboration
   - Manual version control

---

## 📝 Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=root_folder_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔗 Resources

### **Documentation**
- [Google Drive API Docs](https://developers.google.com/drive/api/v3/reference)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Docs Embed Guide](https://developers.google.com/docs/api/how-tos/embed)

### **Libraries**
```json
{
  "dependencies": {
    "googleapis": "^128.0.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🎉 Conclusion

System ini dirancang dengan prinsip **KISS (Keep It Simple, Stupid)**:
- Leverage existing Google infrastructure
- Minimal custom code
- Maximum reliability
- Familiar user experience

**Result:** Powerful document management system dengan effort minimal! 🚀

---

**Last Updated:** November 21, 2025  
**Version:** 1.0.0  
**Status:** 📋 Planning Phase