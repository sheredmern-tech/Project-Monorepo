# 📄 MODULE DOKUMEN - COMPREHENSIVE E2E DOCUMENTATION

> **Version:** 2.0 (Latest - with Advanced Features)
> **Last Updated:** 2025
> **Status:** Production Ready ✅

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend API](#backend-api)
5. [Frontend Components](#frontend-components)
6. [State Management](#state-management)
7. [Features](#features)
8. [File Structure](#file-structure)
9. [Flow Diagrams](#flow-diagrams)
10. [Future Improvements](#future-improvements)

---

## 🎯 OVERVIEW

Module Dokumen adalah sistem **manajemen dokumen hukum** yang comprehensive dengan fitur-fitur advanced seperti:

- ✅ **Folder Management** (Tree structure, nested folders)
- ✅ **Bulk Operations** (Multi-select, bulk move, bulk delete)
- ✅ **Folder Statistics** (Size, count, last upload, file types)
- ✅ **Keyboard Shortcuts** (Ctrl+K, Ctrl+F, etc.)
- ✅ **Recent Folders** (Quick access history)
- ✅ **Smart Filter Presets** (Save & load filter combinations)
- ✅ **Advanced Search & Sort**
- ✅ **RBAC** (Role-based access control)

### Key Entities

- **DokumenHukum** - Legal documents (PDF, DOCX, images)
- **FolderDokumen** - Folder structure for organizing documents
- **Perkara** - Case (legal case) - parent entity
- **User** - Uploader (Staff/Advokat/Klien)

---

## 🏗️ ARCHITECTURE

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        WEB CLIENT                           │
│  ┌──────────────┬──────────────┬─────────────────────────┐ │
│  │   Pages      │  Components  │    State Management     │ │
│  │ /dokumen     │  FolderTree  │   dokumen.store.ts      │ │
│  │ /upload      │  BulkActions │   (Zustand)             │ │
│  │ /[id]        │  Modals      │                         │ │
│  └──────────────┴──────────────┴─────────────────────────┘ │
│                         ↕                                   │
│              ┌──────────────────────┐                       │
│              │   API Layer          │                       │
│              │  dokumen.api.ts      │                       │
│              │  folder.api.ts       │                       │
│              └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                          ↕  HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      SERVER (NestJS)                        │
│  ┌──────────────┬──────────────┬─────────────────────────┐ │
│  │ Controllers  │  Services    │     Database            │ │
│  │ Dokumen      │  Business    │   Prisma ORM            │ │
│  │ Folder       │  Logic       │   PostgreSQL            │ │
│  └──────────────┴──────────────┴─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   FILE STORAGE                              │
│           /uploads/dokumen/{perkaraId}/{filename}           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Zustand (State management)
- TanStack Table
- Radix UI + Tailwind CSS
- i18next (Internationalization)

**Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer (File upload)

---

## 💾 DATABASE SCHEMA

### DokumenHukum Table

```prisma
model DokumenHukum {
  id                String            @id @default(uuid())
  perkara_id        String
  folder_id         String?           // ✨ Nullable - for folder organization
  nama_dokumen      String
  kategori          KategoriDokumen
  tipe_file         String
  ukuran_file       BigInt?
  path_file         String
  nomor_bukti       String?
  keterangan        String?
  tanggal_upload    DateTime          @default(now())
  diupload_oleh     String

  // Relations
  perkara           Perkara           @relation(...)
  folder            FolderDokumen?    @relation(...) // ✨ Folder relation
  uploader          User              @relation(...)

  @@index([perkara_id])
  @@index([folder_id])  // ✨ Index for fast folder queries
  @@index([kategori])
}
```

### FolderDokumen Table

```prisma
model FolderDokumen {
  id            String            @id @default(uuid())
  perkara_id    String
  parent_id     String?           // ✨ For nested folders
  nama_folder   String
  warna         String?           // ✨ Custom folder color
  icon          String?           // ✨ Custom folder icon
  urutan        Int               @default(0)
  dibuat_oleh   String
  created_at    DateTime          @default(now())
  updated_at    DateTime          @updatedAt

  // Relations
  perkara       Perkara           @relation(...)
  parent        FolderDokumen?    @relation("FolderHierarchy", ...)
  children      FolderDokumen[]   @relation("FolderHierarchy") // ✨ Tree structure
  dokumen       DokumenHukum[]    // ✨ Documents in this folder
  pembuat       User              @relation(...)

  @@index([perkara_id])
  @@index([parent_id])
}
```

### Enum: KategoriDokumen

```typescript
enum KategoriDokumen {
  kontrak          // Contract
  surat_kuasa      // Power of Attorney
  bukti            // Evidence
  keputusan        // Decision/Verdict
  lainnya          // Other
}
```

---

## 🔌 BACKEND API

### Dokumen Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dokumen` | Get all documents (paginated, filtered) | ✅ |
| GET | `/dokumen/:id` | Get document by ID | ✅ |
| POST | `/dokumen` | Upload new document | ✅ |
| PATCH | `/dokumen/:id` | Update document metadata | ✅ |
| DELETE | `/dokumen/:id` | Delete document | ✅ |
| GET | `/dokumen/:id/download` | Download document file | ✅ |
| PATCH | `/dokumen/:id/move` | Move document to folder | ✅ |
| POST | `/dokumen/:id/copy` | Copy document | ✅ |

#### Query Parameters (GET /dokumen)

```typescript
interface QueryDokumenDto {
  page?: number;         // Pagination
  limit?: number;        // Items per page
  search?: string;       // Search in nama_dokumen, nomor_bukti
  kategori?: KategoriDokumen;  // Filter by category
  perkara_id?: string;   // Filter by case
  folder_id?: string;    // ✨ Filter by folder (null for root)
  sortBy?: string;       // ✨ Sort field (tanggal_upload, nama_dokumen, etc.)
  sortOrder?: 'asc' | 'desc';  // ✨ Sort direction
}
```

#### Response Format

```typescript
// Paginated response
{
  data: DokumenWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

### Folder Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/folders` | Get all folders (flat) | ✅ |
| GET | `/folders/tree/:perkaraId` | Get folder tree with statistics | ✅ |
| GET | `/folders/:id` | Get folder by ID | ✅ |
| POST | `/folders` | Create new folder | ✅ |
| PATCH | `/folders/:id` | Update folder | ✅ |
| DELETE | `/folders/:id` | Delete folder (moves docs to root) | ✅ |

#### Folder Tree Response (✨ With Statistics)

```typescript
interface FolderTreeNode {
  id: string;
  perkara_id: string;
  nama_folder: string;
  warna?: string;
  icon?: string;
  parent_id?: string;
  _count: {
    children: number;
    dokumen: number;
  };
  statistics: {  // ✨ NEW
    totalSize: number;
    lastUpload: string | null;
    fileTypes: Record<string, number>;  // { "pdf": 5, "docx": 3 }
    categories: Record<string, number>; // { "kontrak": 2, "bukti": 6 }
  };
  children: FolderTreeNode[];
}
```

---

## 🎨 FRONTEND COMPONENTS

### Page Components

#### 1. `/dashboard/dokumen/page.tsx` (Main Document List)

**Features:**
- Document table with pagination
- Folder tree sidebar (collapsible)
- Search & filters
- Sort controls
- Bulk selection mode
- Command palette (Ctrl+K)
- Keyboard shortcuts
- Filter presets

**State Management:**
```typescript
// Zustand store
const {
  search, setSearch,
  kategori, setKategori,
  folderId, setFolderId,
  sortBy, setSortBy,
  sortOrder, setSortOrder,
  selectedIds, toggleSelection,
  isSelectionMode, setSelectionMode,
} = useDokumenStore();
```

**Props Flow:**
```
page.tsx
  ↓
├─ FolderTree (sidebar)
├─ DokumenTable (main content)
├─ BulkActionBar (floating, conditional)
├─ CommandPalette (modal)
├─ KeyboardShortcutsHelp (modal)
└─ FilterPresetsBar (above table)
```

#### 2. `/dashboard/dokumen/upload/page.tsx` (Upload Document)

**Features:**
- Drag & drop upload
- Folder selection
- Category selection
- Form validation
- Progress indicator

#### 3. `/dashboard/dokumen/[id]/page.tsx` (Document Detail)

**Features:**
- Document preview (PDF viewer)
- Metadata display
- Edit/delete actions
- Download button
- Move to folder option

---

### Component Library

#### 📁 **FolderTree.tsx**

**Purpose:** Display hierarchical folder structure with statistics

**Features:**
- Tree structure (parent-child nesting)
- Expand/collapse folders
- Active folder highlighting
- ✨ **Folder statistics** (size, count, last upload, file types)
- ✨ **Recent folders section** (top 5 recently accessed)
- Create/rename/delete folder actions
- Color-coded folders

**Props:**
```typescript
interface FolderTreeProps {
  perkaraId: string;
  currentFolderId?: string | null;
  onFolderClick: (folderId: string | null) => void;
  onCreateFolder?: () => void;
}
```

**Key State:**
```typescript
const [folders, setFolders] = useState<Folder[]>([]);
const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
const { recentFolders, addRecentFolder } = useRecentFolders(perkaraId);
```

**Rendering Logic:**
```typescript
// Recursive rendering for tree structure
const renderFolder = (folder: Folder, level: number = 0) => {
  // Main row: folder name, icon, count
  // Statistics row: size, last upload, file types
  // Children: recursive render if expanded
};
```

---

#### 🔘 **BulkActionBar.tsx**

**Purpose:** Floating action bar for bulk operations

**Features:**
- Selection count badge
- Bulk move to folder
- Bulk delete
- Clear selection
- ✨ Fetches perkara_id from first document
- ✨ Better error handling (Promise.allSettled)

**UI:**
```
┌─────────────────────────────────────────────┐
│  🔵 5 terpilih  │  Pindahkan  Hapus  ✕     │
└─────────────────────────────────────────────┘
     (floating bottom-center)
```

**Props:**
```typescript
interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}
```

---

#### 🔀 **MoveFolderModal.tsx**

**Purpose:** Move/copy document(s) to folder

**Features:**
- Folder tree selection
- Support single & bulk operations
- Current folder indication (disabled)
- Auto-expand to current folder
- Loading states
- ✨ Better error handling for bulk ops

**Modes:**
- `mode: 'move'` - Move document(s)
- `mode: 'copy'` - Copy document(s)

**Props:**
```typescript
interface MoveFolderModalProps {
  dokumenId?: string;          // Single mode
  dokumentIds?: string[];      // Bulk mode
  isBulk?: boolean;
  perkaraId?: string;          // ✨ Required for folder loading
  currentFolderId?: string | null;
  mode?: 'move' | 'copy';
  onClose: () => void;
  onSuccess: () => void;
}
```

---

#### ⌨️ **CommandPalette.tsx**

**Purpose:** Quick action command palette (Ctrl+K)

**Features:**
- Searchable command list
- Categorized commands (Dokumen, Navigasi)
- Keyboard navigation
- Quick actions: Upload, Create Folder, Navigate

**Commands:**
```typescript
{
  id: 'upload-document',
  label: 'Upload Dokumen',
  icon: Upload,
  keywords: ['upload', 'dokumen', 'tambah'],
  action: () => router.push('/dashboard/dokumen/upload'),
  category: 'Dokumen',
}
```

---

#### 🎹 **KeyboardShortcutsHelp.tsx**

**Purpose:** Display all available keyboard shortcuts

**Shortcuts:**
- `Ctrl+K` - Command palette
- `Ctrl+F` - Focus search
- `?` - Show shortcuts help
- `N` - Create new folder
- `U` - Upload document
- `S` - Toggle selection mode

---

#### ⭐ **FilterPresetsBar.tsx**

**Purpose:** Save and load filter combinations

**Features:**
- Display saved presets as pills
- One-click apply preset
- Save current filters
- Delete preset
- Preview filters in save dialog

**Storage:**
```typescript
// localStorage
{
  id: 'preset-123',
  name: 'Client PDFs Only',
  filters: {
    kategori: 'kontrak',
    uploaderFilter: 'client',
    sortBy: 'tanggal_upload',
    sortOrder: 'desc'
  }
}
```

---

#### 📊 **DokumenTable.tsx**

**Purpose:** Display documents in table format

**Features:**
- Sortable columns
- Pagination
- Row selection (bulk mode)
- Click to preview
- Action dropdown (edit, delete, move)
- ✨ Folder path display
- ✨ Selection mode with checkboxes

**Columns:**
- Checkbox (selection mode only)
- Nama Dokumen
- Kategori
- Ukuran File
- Tanggal Upload
- Diunggah Oleh
- Folder
- Actions

---

## 🗄️ STATE MANAGEMENT

### Zustand Store (`dokumen.store.ts`)

```typescript
interface DokumenStore {
  // Filters
  search: string;
  kategori: string;
  perkaraId: string | null;
  folderId: string | null;

  // ✨ Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // ✨ Bulk Selection
  selectedIds: Set<string>;
  isSelectionMode: boolean;

  // Actions
  setSearch: (search: string) => void;
  setKategori: (kategori: string) => void;
  setFolderId: (folderId: string | null) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectionMode: (mode: boolean) => void;
  reset: () => void;
}
```

### Custom Hooks

#### `use-dokumen.ts`
```typescript
const { dokumen, loading, error, fetchDokumen, totalPages } = useDokumen();
```
Fetches documents with filters, pagination, and sorting.

#### `use-recent-folders.ts` ✨
```typescript
const { recentFolders, addRecentFolder, clearRecentFolders } = useRecentFolders(perkaraId);
```
Tracks recently accessed folders in localStorage.

#### `use-filter-presets.ts` ✨
```typescript
const { presets, addPreset, updatePreset, deletePreset } = useFilterPresets();
```
Manages saved filter presets in localStorage.

#### `use-keyboard-shortcuts.ts` ✨
```typescript
useKeyboardShortcuts([
  { key: 'k', ctrlKey: true, handler: () => openCommandPalette() },
  { key: 'f', ctrlKey: true, handler: () => focusSearch() },
]);
```
Global keyboard shortcut management.

---

## ✨ FEATURES

### 1. Folder Management ✅

**Tree Structure:**
- Nested folders (parent-child)
- Unlimited depth
- Drag indicator for hierarchy

**Operations:**
- Create folder (with color picker)
- Rename folder
- Delete folder (moves docs to parent/root)
- Move folder

**UI:**
- Collapsible tree
- Color-coded folders
- Document count badges

---

### 2. Bulk Operations ✅

**Selection Mode:**
- Toggle with button or `S` key
- Checkboxes appear in table
- Multi-select with checkboxes
- Select all checkbox in header

**Actions:**
- Bulk move to folder
- Bulk delete
- Clear selection

**Error Handling:**
- Partial success support
- Shows "3 success, 2 failed" toast
- Modal stays open on error for retry

---

### 3. Folder Statistics ✅

**Metrics:**
- Total size (KB, MB, GB)
- Document count
- Last upload date (relative time)
- File type breakdown (PDF ×5, DOCX ×3)

**Display:**
- Shown below folder name in tree
- Compact two-row layout
- Icon indicators (HardDrive, Clock)
- Tooltips for details

---

### 4. Keyboard Shortcuts ✅

**Global Shortcuts:**
- `Ctrl+K` - Command palette
- `Ctrl+F` - Focus search
- `?` - Show shortcuts help
- `Esc` - Close modals

**Context Shortcuts:**
- `N` - Create new folder
- `U` - Upload document
- `S` - Toggle selection mode

**Navigation:**
- `G+D` - Go to Dashboard
- `G+P` - Go to Perkara
- `G+K` - Go to Klien

---

### 5. Recent Folders ✅

**Features:**
- Tracks last 5 accessed folders
- Per-perkara isolation
- Persistent in localStorage
- Relative time display ("2 hours ago")

**UI:**
- "Recent" section at top of tree
- Quick access buttons
- History icon indicator

---

### 6. Smart Filter Presets ✅

**Features:**
- Save current filter combination
- Quick apply with one click
- Name presets
- Visual preview of filters
- Unlimited presets

**Use Cases:**
- "Client PDFs Only"
- "Recent Staff Uploads"
- "Contract Documents"

**Storage:**
- localStorage
- Per-user persistence

---

### 7. Advanced Search & Sort ✅

**Search:**
- Search in document name
- Search in evidence number (nomor_bukti)
- Debounced input (300ms)

**Sort Options:**
- Tanggal Upload
- Nama Dokumen
- Ukuran File
- Ascending / Descending

**Filters:**
- Category (Kontrak, Bukti, etc.)
- Uploader role (Client/Staff)
- Folder selection

---

### 8. RBAC (Role-Based Access Control) ✅

**Permissions:**

| Role | View | Upload | Edit | Delete | Manage Folders |
|------|------|--------|------|--------|----------------|
| **Super Admin** | ✅ All | ✅ | ✅ All | ✅ All | ✅ |
| **Admin** | ✅ All | ✅ | ✅ All | ✅ All | ✅ |
| **Advokat** | ✅ All | ✅ | ✅ Own | ✅ Own | ✅ |
| **Staff** | ✅ All | ✅ | ✅ Own | ✅ Own | ✅ |
| **Klien** | ✅ Own Case | ✅ | ❌ | ❌ | ❌ |

**Implementation:**
- Backend: `@UseGuards(JwtAuthGuard, RolesGuard)`
- Frontend: `usePermission()` hook
- Conditional UI rendering

---

## 📂 FILE STRUCTURE

```
apps/
├── web/                             # Frontend
│   └── src/
│       ├── app/
│       │   └── dashboard/
│       │       └── dokumen/
│       │           ├── page.tsx                 # ✨ Main document list (latest)
│       │           ├── upload/page.tsx          # Upload page
│       │           ├── [id]/page.tsx            # Document detail
│       │           └── [id]/edit/page.tsx       # Edit document
│       │
│       ├── components/
│       │   └── dokumen/
│       │       ├── FolderTree.tsx               # ✨ With statistics & recent
│       │       ├── CreateFolderModal.tsx
│       │       ├── RenameFolderModal.tsx
│       │       ├── MoveFolderModal.tsx          # ✨ With bulk support
│       │       ├── BulkActionBar.tsx            # ✨ Bulk operations
│       │       ├── CommandPalette.tsx           # ✨ Ctrl+K palette
│       │       ├── KeyboardShortcutsHelp.tsx    # ✨ Shortcuts modal
│       │       └── FilterPresetsBar.tsx         # ✨ Filter presets
│       │
│       ├── lib/
│       │   ├── api/
│       │   │   ├── dokumen.api.ts               # Dokumen API client
│       │   │   └── folder.api.ts                # Folder API client
│       │   ├── stores/
│       │   │   └── dokumen.store.ts             # ✨ Zustand store (with bulk)
│       │   ├── hooks/
│       │   │   ├── use-dokumen.ts
│       │   │   ├── use-recent-folders.ts        # ✨ Recent folders
│       │   │   ├── use-filter-presets.ts        # ✨ Filter presets
│       │   │   └── use-keyboard-shortcuts.ts    # ✨ Shortcuts
│       │   └── schemas/
│       │       └── dokumen.schema.ts
│       │
│       └── docs/
│           └── modules/
│               └── DOKUMEN_MODULE.md            # 📖 This document
│
└── server/                          # Backend
    └── src/
        └── modules/
            ├── dokumen/
            │   ├── dokumen.controller.ts
            │   ├── dokumen.service.ts           # ✨ With sorting, filtering
            │   ├── dokumen.module.ts
            │   └── dto/
            │       ├── create-dokumen.dto.ts
            │       ├── update-dokumen.dto.ts
            │       └── query-dokumen.dto.ts     # ✨ With sort params
            │
            └── folder/
                ├── folder.controller.ts
                ├── folder.service.ts            # ✨ With statistics
                ├── folder.module.ts
                └── dto/
                    ├── create-folder.dto.ts
                    ├── update-folder.dto.ts
                    └── query-folder.dto.ts
```

---

## 📊 FLOW DIAGRAMS

### Document Upload Flow

```
User → Upload Page
  ↓
Select File(s) + Fill Form
  ↓
Submit
  ↓
POST /dokumen (multipart/form-data)
  ↓
Backend: Validate + Save File + Create DB Record
  ↓
Response: Document Created
  ↓
Redirect to Document List
  ↓
Show Success Toast
```

### Bulk Move Flow

```
User → Document List
  ↓
Click "Pilih" (Selection Mode ON)
  ↓
Check Multiple Documents
  ↓
Click "Pindahkan" (Bulk Action Bar)
  ↓
Fetch perkara_id from First Document  # ✨ NEW
  ↓
Open MoveFolderModal with perkaraId   # ✨ Fixed
  ↓
Load Folder Tree
  ↓
Select Target Folder
  ↓
Confirm Move
  ↓
Promise.allSettled([                   # ✨ Better error handling
  PATCH /dokumen/{id1}/move,
  PATCH /dokumen/{id2}/move,
  ...
])
  ↓
Show Success/Fail Count                # ✨ "3 success, 2 failed"
  ↓
Refresh Document List
  ↓
Clear Selection
```

### Folder Statistics Calculation

```
GET /folders/tree/:perkaraId
  ↓
Backend: Fetch All Folders + Documents
  ↓
For Each Folder:
  ├─ totalSize = SUM(dokumen.ukuran_file)
  ├─ lastUpload = MAX(dokumen.tanggal_upload)
  ├─ fileTypes = COUNT GROUP BY tipe_file
  └─ categories = COUNT GROUP BY kategori
  ↓
Build Tree Structure with Statistics
  ↓
Return Nested Array
  ↓
Frontend: Render in FolderTree
```

---

## 🚀 FUTURE IMPROVEMENTS

### Phase 1: Document Workflow (Staging & Approval)

**Goal:** Add document approval workflow before publishing

#### New Database Tables

```prisma
model DokumenStatus {
  id          String   @id @default(uuid())
  dokumen_id  String   @unique
  status      WorkflowStatus @default(DRAFT)
  submitted_at   DateTime?
  reviewed_at    DateTime?
  approved_at    DateTime?
  rejected_at    DateTime?
  submitted_by   String?
  reviewed_by    String?
  rejection_note String?

  dokumen     DokumenHukum @relation(...)
  submitter   User?        @relation("Submitter", ...)
  reviewer    User?        @relation("Reviewer", ...)
}

enum WorkflowStatus {
  DRAFT          // Initial upload (not visible to klien)
  SUBMITTED      // Submitted for review
  IN_REVIEW      // Being reviewed by admin/advokat
  APPROVED       // Approved (visible to all)
  REJECTED       // Rejected (back to draft)
  ARCHIVED       // Archived/soft deleted
}
```

#### New Features

**1. Document States:**
- **DRAFT** - Staff uploads, not visible to client yet
- **SUBMITTED** - Staff submits for approval
- **IN_REVIEW** - Admin/Advokat reviewing
- **APPROVED** - Published, visible to client
- **REJECTED** - Needs revision

**2. Approval Workflow:**
```
Staff Upload → DRAFT
  ↓
Staff Submit → SUBMITTED
  ↓
Admin Review → IN_REVIEW
  ↓
  ├─ Approve → APPROVED (visible to client)
  └─ Reject → REJECTED (with notes)
       ↓
     Staff Revise → DRAFT (cycle repeats)
```

**3. UI Changes:**

**For Staff:**
```
┌─────────────────────────────────────┐
│ Document Actions:                   │
│  [Submit for Review]  (DRAFT only)  │
│  [Revise]             (REJECTED)    │
└─────────────────────────────────────┘
```

**For Admin/Advokat:**
```
┌─────────────────────────────────────┐
│ Review Queue:                       │
│  📄 Contract.pdf (SUBMITTED)        │
│  📄 Evidence.pdf (SUBMITTED)        │
│                                     │
│  [Approve] [Reject with Note]      │
└─────────────────────────────────────┘
```

**For Client:**
```
Only see APPROVED documents
Hide DRAFT, SUBMITTED, IN_REVIEW, REJECTED
```

**4. New Endpoints:**

```typescript
// Admin/Advokat only
POST   /dokumen/:id/submit         // Submit for review
POST   /dokumen/:id/approve        // Approve document
POST   /dokumen/:id/reject         // Reject with note
GET    /dokumen/pending-review     // Get review queue

// Staff
GET    /dokumen/my-drafts          // Get my draft documents
POST   /dokumen/:id/revise         // Revise rejected document
```

**5. Notifications:**
- Email notification on status change
- In-app notification badge
- Real-time updates (WebSocket/SSE)

**6. Audit Trail:**
```typescript
model DokumenAuditLog {
  id          String   @id @default(uuid())
  dokumen_id  String
  action      string   // "submitted", "approved", "rejected"
  performed_by String
  notes       String?
  timestamp   DateTime @default(now())

  dokumen     DokumenHukum @relation(...)
  user        User         @relation(...)
}
```

---

### Phase 2: Advanced Features

**1. Version Control:**
- Track document versions
- Compare versions
- Restore previous version
- Version history timeline

**2. Document Templates:**
- Pre-filled document templates
- Variable placeholders
- Auto-generate from template

**3. OCR (Optical Character Recognition):**
- Extract text from scanned documents
- Search within PDF content
- Highlight search results

**4. Digital Signatures:**
- E-signature integration
- Signature verification
- Signature audit trail

**5. Document Collaboration:**
- Comments on documents
- Annotations
- @mentions
- Discussion threads

**6. Advanced Analytics:**
- Document usage statistics
- Most accessed documents
- Storage usage charts
- Upload trends

**7. Automated Categorization:**
- AI-based category suggestion
- Auto-tagging
- Smart folder recommendation

---

### Phase 3: Integration & Automation

**1. Email Integration:**
- Forward emails to create documents
- Email to folder mapping
- Auto-extract attachments

**2. Cloud Storage Sync:**
- Google Drive integration
- Dropbox sync
- OneDrive connector

**3. Webhook Events:**
- Document uploaded webhook
- Document approved webhook
- Custom webhook triggers

**4. API Enhancements:**
- GraphQL API
- Bulk upload API
- Export API (ZIP download)

---

## 📝 DEVELOPMENT NOTES

### Performance Optimizations

1. **Database Indexing:**
   ```sql
   -- Already implemented
   CREATE INDEX idx_dokumen_perkara ON dokumen_hukum(perkara_id);
   CREATE INDEX idx_dokumen_folder ON dokumen_hukum(folder_id);
   CREATE INDEX idx_dokumen_kategori ON dokumen_hukum(kategori);
   ```

2. **Query Optimization:**
   - Use `select` to limit fields
   - Implement cursor-based pagination for large datasets
   - Cache folder tree (Redis)

3. **File Storage:**
   - Consider CDN for file serving
   - Implement file compression
   - Use cloud storage (S3, GCS) for production

4. **Frontend:**
   - Lazy load components
   - Virtual scrolling for large tables
   - Debounce search input (already implemented)
   - React.memo for expensive components

### Security Considerations

1. **File Upload:**
   - Validate file types (whitelist)
   - Scan for malware
   - Limit file size (configurable)
   - Sanitize filenames

2. **Access Control:**
   - Implement row-level security
   - Audit all document access
   - Rate limiting on API

3. **Data Privacy:**
   - Encrypt sensitive documents
   - GDPR compliance (data export, deletion)
   - Access logs

### Testing Strategy

1. **Unit Tests:**
   - Service layer logic
   - Utility functions
   - Hooks

2. **Integration Tests:**
   - API endpoints
   - Database operations
   - File upload/download

3. **E2E Tests:**
   - Upload workflow
   - Bulk operations
   - Folder management
   - Search & filter

---

## 🎓 USAGE EXAMPLES

### Example 1: Upload Document to Folder

```typescript
// 1. User navigates to upload page
router.push('/dashboard/dokumen/upload');

// 2. Fill form
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('perkara_id', perkaraId);
formData.append('folder_id', folderId);  // ✨ Optional
formData.append('kategori', 'kontrak');
formData.append('nama_dokumen', 'Contract Agreement');

// 3. Upload
const response = await dokumenApi.upload(formData);

// 4. Success
toast.success('Dokumen berhasil diunggah');
router.push('/dashboard/dokumen');
```

### Example 2: Create Nested Folder

```typescript
// 1. Select parent folder in tree
onFolderClick(parentFolderId);

// 2. Click "New Folder"
setShowCreateFolder(true);

// 3. Fill form
const data = {
  perkara_id: selectedPerkaraId,
  parent_id: parentFolderId,  // ✨ Creates nested folder
  nama_folder: 'Contracts 2024',
  warna: '#3b82f6',           // Blue
};

// 4. Create
await folderApi.create(data);

// 5. Reload tree
loadFolders();
```

### Example 3: Bulk Move Documents

```typescript
// 1. Enable selection mode
setSelectionMode(true);

// 2. Select documents
toggleSelection(doc1Id);
toggleSelection(doc2Id);
toggleSelection(doc3Id);

// 3. Click "Pindahkan"
// BulkActionBar fetches perkara_id automatically

// 4. Select target folder in modal
setSelectedFolder(targetFolderId);

// 5. Confirm move
// Backend processes all documents
const results = await Promise.allSettled([
  dokumenApi.move(doc1Id, targetFolderId),
  dokumenApi.move(doc2Id, targetFolderId),
  dokumenApi.move(doc3Id, targetFolderId),
]);

// 6. Show results
toast.success('3 dokumen berhasil dipindahkan');
```

### Example 4: Save Filter Preset

```typescript
// 1. Apply filters
setKategori('kontrak');
setUploaderFilter('client');
setSortBy('tanggal_upload');
setSortOrder('desc');

// 2. Click "Simpan Filter"
setShowSaveDialog(true);

// 3. Name preset
setPresetName('Client Contracts - Latest');

// 4. Save
const preset = addPreset('Client Contracts - Latest', {
  kategori: 'kontrak',
  uploaderFilter: 'client',
  sortBy: 'tanggal_upload',
  sortOrder: 'desc',
});

// 5. Preset saved to localStorage
// 6. Show as pill in FilterPresetsBar
```

---

## 🐛 KNOWN ISSUES & FIXES

### Issue 1: Folder Tree Not Loading in Bulk Move ✅ FIXED

**Problem:** MoveFolderModal tidak menerima `perkaraId`, jadi folder tree tidak load.

**Solution:**
```typescript
// BulkActionBar fetches perkara_id first
const firstDoc = await dokumenApi.getById(selectedIds[0]);
setPerkaraId(firstDoc.perkara_id);

// Then passes to modal
<MoveFolderModal perkaraId={perkaraId} ... />
```

### Issue 2: False Success Toast ✅ FIXED

**Problem:** Toast sukses muncul padahal error.

**Solution:**
```typescript
// Use Promise.allSettled instead of Promise.all
const results = await Promise.allSettled(...);

// Count success vs failed
const successCount = results.filter(r => r.status === 'fulfilled').length;
const failCount = results.filter(r => r.status === 'rejected').length;

// Show appropriate toast
if (successCount > 0) toast.success(`${successCount} success`);
if (failCount > 0) toast.error(`${failCount} failed`);
```

---

## 📞 SUPPORT & MAINTENANCE

### Common Commands

```bash
# Development
npm run dev            # Start dev server

# Database
npx prisma migrate dev # Run migrations
npx prisma studio      # Open Prisma Studio
npx prisma generate    # Generate Prisma Client

# Build
npm run build          # Production build
npm run start          # Start production server

# Testing
npm run test           # Run tests
npm run test:e2e       # E2E tests
```

### Environment Variables

```bash
# Required for Dokumen module
DATABASE_URL=postgresql://...
JWT_SECRET=...
UPLOAD_PATH=/uploads/dokumen
MAX_FILE_SIZE=10485760  # 10MB
```

---

## 📚 REFERENCES

- [Prisma Docs](https://www.prisma.io/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TanStack Table](https://tanstack.com/table)

---

**Document Version:** 2.0
**Last Updated:** 2025
**Maintained By:** Development Team
**Status:** ✅ Production Ready with Advanced Features
