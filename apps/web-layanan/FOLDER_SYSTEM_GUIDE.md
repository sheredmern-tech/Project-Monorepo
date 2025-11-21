# Virtual Folder System - Implementation Guide

## Overview

The virtual folder system allows users to organize their documents in hierarchical folders (like Google Drive) without actually moving files in Google Drive. Folders only exist in the database.

## Components Created

### 1. FolderTree Component
Location: `/components/dokumen/FolderTree.tsx`

**Features:**
- Hierarchical tree structure with expand/collapse
- Colored folder icons
- Document count per folder
- Active folder highlighting
- "All Documents" root view
- Create folder button

**Usage:**
```tsx
import { FolderTree } from '@/components/dokumen/FolderTree';

<FolderTree
  perkaraId={perkaraId}
  currentFolderId={currentFolder}
  onFolderClick={(folderId) => setCurrentFolder(folderId)}
  onCreateFolder={() => setShowCreateModal(true)}
/>
```

### 2. CreateFolderModal Component
Location: `/components/dokumen/CreateFolderModal.tsx`

**Features:**
- Modal dialog for folder creation
- Name input with validation
- 7 color options
- Parent folder support (nested folders)

**Usage:**
```tsx
import { CreateFolderModal } from '@/components/dokumen/CreateFolderModal';

{showModal && (
  <CreateFolderModal
    perkaraId={perkaraId}
    parentId={currentFolder} // Optional for nested folders
    onClose={() => setShowModal(false)}
    onSuccess={handleFolderCreated}
  />
)}
```

## Example Integration

See: `/app/(klien)/dokumen/with-folders/page.tsx`

This is a complete example showing:
- ✅ Folder tree sidebar
- ✅ Perkara selector
- ✅ Document list filtered by folder
- ✅ Breadcrumb navigation
- ✅ Create folder modal

### How to Use:

1. **View Documents by Folder:**
   - Click on folders in sidebar to filter documents
   - Click "All Documents" to see everything

2. **Create New Folder:**
   - Click "New Folder" button in sidebar
   - Enter folder name and choose color
   - Optionally create subfolders

3. **Organize Documents:**
   - Use move API: `dokumenApi.move(docId, folderId)`
   - Use copy API: `dokumenApi.copy(docId, { folder_id: folderId })`

## API Integration

### Folder API
```tsx
import { folderApi } from '@/lib/api/folder';

// Get folder tree
const folders = await folderApi.getTree(perkaraId);

// Create folder
await folderApi.create({
  perkara_id: perkaraId,
  nama_folder: 'My Folder',
  warna: '#3B82F6',
  parent_id: parentId, // Optional
});

// Update folder
await folderApi.update(folderId, {
  nama_folder: 'Updated Name',
});

// Delete folder
await folderApi.delete(folderId);
```

### Document Move/Copy
```tsx
import { dokumenApi } from '@/lib/api/dokumen';

// Move document to folder
await dokumenApi.move(documentId, folderId);

// Copy document
await dokumenApi.copy(documentId, {
  folder_id: targetFolderId,
  nama_dokumen: 'Copy of Document',
});
```

## Next Steps (TODO)

To fully integrate into existing pages:

1. **Update Main Dokumen Page** (`/app/(klien)/dokumen/page.tsx`):
   - Add folder tree sidebar
   - Filter documents by selected folder
   - Add breadcrumb navigation

2. **Update Upload Form** (`/app/(klien)/dokumen/upload/page.tsx`):
   - Add folder selector dropdown
   - Allow selecting destination folder on upload

3. **Add Context Menu**:
   - Right-click on documents
   - Show move/copy/delete options
   - Drag & drop support (advanced)

4. **Add Backend Filter**:
   - Update backend `findAll` to accept `folder_id` query param
   - Filter documents by folder in database query

## Testing Checklist

- [ ] Create folder in perkara
- [ ] Create nested folder (subfolder)
- [ ] View documents filtered by folder
- [ ] Move document to folder
- [ ] Copy document to folder
- [ ] Rename folder
- [ ] Delete folder (documents move to root)
- [ ] Test RBAC (klien only see own folders)

## Known Limitations

1. **Backend Filter Not Implemented Yet**:
   - Frontend shows folder tree but documents aren't filtered by `folder_id` yet
   - Need to add `folder_id` query param to backend `findAll` endpoint

2. **No Drag & Drop Yet**:
   - Users must use move API manually
   - Future: Add drag & drop for better UX

3. **No Folder Rename in UI**:
   - API supports it but no UI modal yet
   - Future: Add edit folder modal

## Database Schema

```prisma
model FolderDokumen {
  id           String   @id @default(uuid())
  perkara_id   String
  nama_folder  String
  parent_id    String?  // For nesting
  warna        String?  // Hex color
  icon         String?
  urutan       Int      @default(0)
  dibuat_oleh  String?

  perkara      Perkara
  parent       FolderDokumen?  @relation("NestedFolder")
  children     FolderDokumen[] @relation("NestedFolder")
  dokumen      DokumenHukum[]
}

model DokumenHukum {
  // ...existing fields
  folder_id    String?
  folder       FolderDokumen?
}
```

## Performance Tips

1. **Cache Folder Tree**:
   - Folders don't change often
   - Cache tree structure in client state

2. **Lazy Load Documents**:
   - Only fetch documents for current folder
   - Don't load all documents upfront

3. **Optimize Database Queries**:
   - Use indexes on `folder_id` and `perkara_id`
   - Use `_count` for document counts
