# 🔌 DOKUMEN MODULE - API REFERENCE

> Complete API documentation for Dokumen & Folder endpoints

---

## 📋 BASE URL

```
Development: http://localhost:3000/api
Production:  https://yourdomain.com/api
```

## 🔐 AUTHENTICATION

All endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer <jwt_token>
```

---

## 📄 DOKUMEN ENDPOINTS

### 1. Get All Documents (Paginated)

**Endpoint:** `GET /dokumen`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `search` | string | No | - | Search in nama_dokumen, nomor_bukti |
| `kategori` | enum | No | - | Filter by category |
| `perkara_id` | uuid | No | - | Filter by case ID |
| `folder_id` | uuid | No | - | Filter by folder (null for root) |
| `sortBy` | string | No | tanggal_upload | Sort field |
| `sortOrder` | asc\|desc | No | desc | Sort direction |

**Request Example:**

```http
GET /dokumen?page=1&limit=20&search=contract&kategori=kontrak&sortBy=tanggal_upload&sortOrder=desc
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "perkara_id": "uuid-perkara",
      "folder_id": "uuid-folder",
      "nama_dokumen": "Contract Agreement 2024.pdf",
      "kategori": "kontrak",
      "tipe_file": "pdf",
      "ukuran_file": 2048576,
      "path_file": "/uploads/dokumen/uuid-perkara/file.pdf",
      "nomor_bukti": "BKT-001/2024",
      "keterangan": "Initial contract",
      "tanggal_upload": "2024-01-15T10:30:00Z",
      "diupload_oleh": "uuid-user",
      "perkara": {
        "id": "uuid-perkara",
        "nomor_perkara": "001/PDT.G/2024/PN.JKT",
        "judul": "Case Title"
      },
      "folder": {
        "id": "uuid-folder",
        "nama_folder": "Contracts",
        "warna": "#3b82f6"
      },
      "uploader": {
        "id": "uuid-user",
        "nama_lengkap": "John Doe",
        "role": "staff"
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 2. Get Document by ID

**Endpoint:** `GET /dokumen/:id`

**Path Parameters:**
- `id` (uuid) - Document ID

**Response:**

```json
{
  "id": "uuid-1",
  "perkara_id": "uuid-perkara",
  "folder_id": "uuid-folder",
  "nama_dokumen": "Contract Agreement 2024.pdf",
  "kategori": "kontrak",
  "tipe_file": "pdf",
  "ukuran_file": 2048576,
  "path_file": "/uploads/dokumen/uuid-perkara/file.pdf",
  "nomor_bukti": "BKT-001/2024",
  "keterangan": "Initial contract",
  "tanggal_upload": "2024-01-15T10:30:00Z",
  "diupload_oleh": "uuid-user",
  "perkara": { ... },
  "folder": { ... },
  "uploader": { ... }
}
```

---

### 3. Upload Document

**Endpoint:** `POST /dokumen`

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Document file (PDF, DOCX, images) |
| `perkara_id` | uuid | Yes | Case ID |
| `folder_id` | uuid | No | Folder ID (null for root) |
| `nama_dokumen` | string | Yes | Document name |
| `kategori` | enum | Yes | Document category |
| `nomor_bukti` | string | No | Evidence number |
| `keterangan` | string | No | Notes |

**Request Example:**

```typescript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('perkara_id', 'uuid-perkara');
formData.append('folder_id', 'uuid-folder');
formData.append('nama_dokumen', 'Contract 2024');
formData.append('kategori', 'kontrak');
formData.append('nomor_bukti', 'BKT-001/2024');

const response = await fetch('/dokumen', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

**Response:**

```json
{
  "id": "uuid-new",
  "perkara_id": "uuid-perkara",
  "folder_id": "uuid-folder",
  "nama_dokumen": "Contract 2024.pdf",
  "kategori": "kontrak",
  "tipe_file": "pdf",
  "ukuran_file": 2048576,
  "path_file": "/uploads/dokumen/uuid-perkara/uuid-new.pdf",
  "tanggal_upload": "2024-01-15T10:30:00Z",
  ...
}
```

---

### 4. Update Document Metadata

**Endpoint:** `PATCH /dokumen/:id`

**Path Parameters:**
- `id` (uuid) - Document ID

**Request Body:**

```json
{
  "nama_dokumen": "Updated Contract Name",
  "kategori": "kontrak",
  "nomor_bukti": "BKT-002/2024",
  "keterangan": "Updated notes"
}
```

**Response:**

```json
{
  "id": "uuid-1",
  "nama_dokumen": "Updated Contract Name",
  ...
}
```

---

### 5. Delete Document

**Endpoint:** `DELETE /dokumen/:id`

**Path Parameters:**
- `id` (uuid) - Document ID

**Response:**

```json
{
  "message": "Dokumen berhasil dihapus"
}
```

**Note:** Also deletes the physical file from storage.

---

### 6. Download Document

**Endpoint:** `GET /dokumen/:id/download`

**Path Parameters:**
- `id` (uuid) - Document ID

**Response:**
- Content-Type: `application/pdf` or `application/octet-stream`
- File download stream

**Usage:**

```typescript
const response = await fetch(`/dokumen/${id}/download`, {
  headers: { 'Authorization': 'Bearer <token>' }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
window.open(url);
```

---

### 7. Move Document to Folder

**Endpoint:** `PATCH /dokumen/:id/move`

**Path Parameters:**
- `id` (uuid) - Document ID

**Request Body:**

```json
{
  "folder_id": "uuid-folder"  // or null for root
}
```

**Response:**

```json
{
  "id": "uuid-1",
  "folder_id": "uuid-folder",
  "message": "Dokumen berhasil dipindahkan"
}
```

---

### 8. Copy Document

**Endpoint:** `POST /dokumen/:id/copy`

**Path Parameters:**
- `id` (uuid) - Document ID

**Request Body:**

```json
{
  "folder_id": "uuid-target-folder",  // optional
  "nama_dokumen": "Copy of Contract"   // optional
}
```

**Response:**

```json
{
  "id": "uuid-new-copy",
  "nama_dokumen": "Copy of Contract.pdf",
  "folder_id": "uuid-target-folder",
  ...
}
```

**Note:** Creates a physical copy of the file.

---

## 📁 FOLDER ENDPOINTS

### 1. Get All Folders (Flat List)

**Endpoint:** `GET /folders`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `perkara_id` | uuid | No | Filter by case |
| `parent_id` | uuid\|'null' | No | Filter by parent (use 'null' for root) |

**Response:**

```json
[
  {
    "id": "uuid-1",
    "perkara_id": "uuid-perkara",
    "parent_id": null,
    "nama_folder": "Contracts",
    "warna": "#3b82f6",
    "icon": null,
    "urutan": 0,
    "dibuat_oleh": "uuid-user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "_count": {
      "children": 2,
      "dokumen": 5
    },
    "perkara": { ... },
    "pembuat": { ... }
  }
]
```

---

### 2. Get Folder Tree (with Statistics)

**Endpoint:** `GET /folders/tree/:perkaraId`

**Path Parameters:**
- `perkaraId` (uuid) - Case ID

**Response:**

```json
[
  {
    "id": "uuid-1",
    "perkara_id": "uuid-perkara",
    "parent_id": null,
    "nama_folder": "Contracts",
    "warna": "#3b82f6",
    "icon": null,
    "urutan": 0,
    "_count": {
      "children": 2,
      "dokumen": 5
    },
    "statistics": {
      "totalSize": 10485760,
      "lastUpload": "2024-01-15T10:30:00Z",
      "fileTypes": {
        "pdf": 3,
        "docx": 2
      },
      "categories": {
        "kontrak": 4,
        "bukti": 1
      }
    },
    "children": [
      {
        "id": "uuid-2",
        "parent_id": "uuid-1",
        "nama_folder": "2024 Contracts",
        "children": [],
        ...
      }
    ]
  }
]
```

---

### 3. Get Folder by ID

**Endpoint:** `GET /folders/:id`

**Path Parameters:**
- `id` (uuid) - Folder ID

**Response:**

```json
{
  "id": "uuid-1",
  "perkara_id": "uuid-perkara",
  "parent_id": null,
  "nama_folder": "Contracts",
  "warna": "#3b82f6",
  "icon": null,
  "urutan": 0,
  "_count": {
    "children": 2,
    "dokumen": 5
  },
  "perkara": { ... },
  "pembuat": { ... },
  "parent": null,
  "children": [ ... ],
  "dokumen": [ ... ]
}
```

---

### 4. Create Folder

**Endpoint:** `POST /folders`

**Request Body:**

```json
{
  "perkara_id": "uuid-perkara",
  "parent_id": "uuid-parent",  // optional, null for root
  "nama_folder": "New Folder",
  "warna": "#3b82f6",          // optional
  "icon": "folder-icon",       // optional
  "urutan": 0                  // optional
}
```

**Response:**

```json
{
  "id": "uuid-new",
  "perkara_id": "uuid-perkara",
  "parent_id": "uuid-parent",
  "nama_folder": "New Folder",
  "warna": "#3b82f6",
  "created_at": "2024-01-15T10:30:00Z",
  ...
}
```

---

### 5. Update Folder

**Endpoint:** `PATCH /folders/:id`

**Path Parameters:**
- `id` (uuid) - Folder ID

**Request Body:**

```json
{
  "nama_folder": "Updated Folder Name",
  "warna": "#ef4444",
  "urutan": 1
}
```

**Response:**

```json
{
  "id": "uuid-1",
  "nama_folder": "Updated Folder Name",
  "warna": "#ef4444",
  ...
}
```

---

### 6. Delete Folder

**Endpoint:** `DELETE /folders/:id`

**Path Parameters:**
- `id` (uuid) - Folder ID

**Response:**

```json
{
  "success": true,
  "message": "Folder berhasil dihapus"
}
```

**Behavior:**
- Documents inside → moved to parent folder (or root if no parent)
- Subfolders → moved to parent folder (or root if no parent)
- Folder deleted permanently

---

## 📊 DATA TYPES

### KategoriDokumen Enum

```typescript
enum KategoriDokumen {
  kontrak = 'kontrak',           // Contract
  surat_kuasa = 'surat_kuasa',   // Power of Attorney
  bukti = 'bukti',               // Evidence
  keputusan = 'keputusan',       // Decision/Verdict
  lainnya = 'lainnya'            // Other
}
```

### Allowed File Types

```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif'
];
```

### File Size Limits

```typescript
MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## ❌ ERROR RESPONSES

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "errors": {
    "nama_dokumen": "Nama dokumen harus diisi"
  }
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki akses untuk melakukan aksi ini"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Dokumen tidak ditemukan"
}
```

### 413 Payload Too Large

```json
{
  "statusCode": 413,
  "message": "Ukuran file melebihi batas maksimal (10MB)"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Terjadi kesalahan pada server"
}
```

---

## 🔒 RBAC PERMISSIONS

### Permission Matrix

| Endpoint | Super Admin | Admin | Advokat | Staff | Klien |
|----------|-------------|-------|---------|-------|-------|
| GET /dokumen | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Own Case |
| GET /dokumen/:id | ✅ | ✅ | ✅ | ✅ | ✅ Own Case |
| POST /dokumen | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /dokumen/:id | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |
| DELETE /dokumen/:id | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |
| GET /dokumen/:id/download | ✅ | ✅ | ✅ | ✅ | ✅ Own Case |
| PATCH /dokumen/:id/move | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |
| POST /dokumen/:id/copy | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |
| GET /folders | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Own Case |
| GET /folders/tree/:perkaraId | ✅ | ✅ | ✅ | ✅ | ✅ Own Case |
| POST /folders | ✅ | ✅ | ✅ | ✅ | ❌ |
| PATCH /folders/:id | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |
| DELETE /folders/:id | ✅ All | ✅ All | ✅ Own | ✅ Own | ❌ |

---

## 💡 USAGE EXAMPLES

### Example 1: Upload Document with Folder

```typescript
const uploadDocument = async (file: File, data: {
  perkara_id: string;
  folder_id?: string;
  kategori: KategoriDokumen;
}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('perkara_id', data.perkara_id);
  if (data.folder_id) {
    formData.append('folder_id', data.folder_id);
  }
  formData.append('nama_dokumen', file.name);
  formData.append('kategori', data.kategori);

  const response = await fetch('/api/dokumen', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### Example 2: Get Documents with Filters

```typescript
const getDocuments = async (filters: {
  perkaraId?: string;
  folderId?: string;
  search?: string;
  kategori?: KategoriDokumen;
  page?: number;
}) => {
  const params = new URLSearchParams();
  if (filters.perkaraId) params.append('perkara_id', filters.perkaraId);
  if (filters.folderId !== undefined) params.append('folder_id', filters.folderId || 'null');
  if (filters.search) params.append('search', filters.search);
  if (filters.kategori) params.append('kategori', filters.kategori);
  params.append('page', String(filters.page || 1));
  params.append('limit', '20');

  const response = await fetch(`/api/dokumen?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
```

### Example 3: Bulk Move Documents

```typescript
const bulkMoveDocuments = async (
  documentIds: string[],
  targetFolderId: string | null
) => {
  const results = await Promise.allSettled(
    documentIds.map(id =>
      fetch(`/api/dokumen/${id}/move`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_id: targetFolderId })
      }).then(res => res.json())
    )
  );

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failCount = results.filter(r => r.status === 'rejected').length;

  return { successCount, failCount };
};
```

### Example 4: Create Nested Folder

```typescript
const createNestedFolder = async (data: {
  perkara_id: string;
  parent_id?: string;
  nama_folder: string;
  warna?: string;
}) => {
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.json();
};

// Usage
await createNestedFolder({
  perkara_id: 'uuid-perkara',
  parent_id: 'uuid-parent-folder',  // null for root level
  nama_folder: '2024 Contracts',
  warna: '#3b82f6'
});
```

---

## 🚀 RATE LIMITING

| Endpoint Type | Rate Limit |
|---------------|------------|
| Read (GET) | 100 requests/minute |
| Write (POST/PATCH/DELETE) | 30 requests/minute |
| Upload | 10 uploads/minute |
| Download | 50 downloads/minute |

---

## 📝 CHANGELOG

### Version 2.0 (Latest)
- ✅ Added folder statistics in tree endpoint
- ✅ Added sortBy & sortOrder query params
- ✅ Improved error responses
- ✅ Better RBAC enforcement

### Version 1.5
- ✅ Added folder management endpoints
- ✅ Added move & copy document endpoints

### Version 1.0
- ✅ Initial document CRUD endpoints
- ✅ Upload & download functionality
- ✅ Basic search & filter

---

**API Version:** 2.0
**Last Updated:** 2025
**Status:** ✅ Production Ready
