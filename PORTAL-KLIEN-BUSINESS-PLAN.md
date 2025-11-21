# 🏢 PORTAL KLIEN - COMPLETE BUSINESS & IMPLEMENTATION PLAN

**Firma Hukum PERARI - Client Self-Service Portal**

---

## 📋 TABLE OF CONTENTS

1. [Business Overview](#business-overview)
2. [Problem & Solution](#problem--solution)
3. [User Journey](#user-journey)
4. [Architecture Design](#architecture-design)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Security & Isolation](#security--isolation)
8. [Implementation Phases](#implementation-phases)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## 1️⃣ BUSINESS OVERVIEW

### 🎯 Vision
Portal self-service yang memungkinkan klien untuk:
- ✅ Upload dokumen legal dengan mudah
- ✅ Track status dokumen mereka
- ✅ View history upload
- ✅ Download dokumen yang sudah diupload
- ❌ **TIDAK bisa** lihat data klien lain (100% isolated)

### 👥 Target User
**KLIEN** = Client eksternal firma hukum yang:
- Butuh upload dokumen untuk kasus mereka
- Ingin track progress dokumen
- Tidak perlu (dan tidak boleh) akses data internal kantor

### 🔐 Security Principle
**"Zero Trust - Data Isolation by User ID"**
- Setiap klien HANYA bisa akses data mereka sendiri
- No shared data antar klien
- Backend filter by `req.user.id` di SEMUA query
- Database constraint: `WHERE klien_id = current_user_id()`

---

## 2️⃣ PROBLEM & SOLUTION

### ❌ Problems (Before Portal Klien)

1. **Manual Upload Process:**
   - Klien kirim dokumen via email/WA
   - Staff harus manual download & upload ke sistem
   - Time consuming & error prone

2. **No Visibility for Klien:**
   - Klien tidak tahu status dokumen
   - Harus telpon/email untuk tanya progress
   - No self-service capability

3. **Security Risk:**
   - Dokumen via email bisa bocor
   - No audit trail
   - Sulit track siapa upload apa

4. **Scalability Issue:**
   - 1 staff handle 50+ klien
   - Bottleneck saat banyak klien upload sekaligus

### ✅ Solutions (Portal Klien)

1. **Self-Service Upload:**
   - Klien upload sendiri ke portal
   - Auto-detect document type
   - Bulk upload (multiple files)
   - Direct to Google Drive

2. **Real-Time Visibility:**
   - Dashboard: Total dokumen, upload bulan ini
   - Timeline view: History semua upload
   - Status tracking per dokumen

3. **Enhanced Security:**
   - JWT authentication
   - Data isolation by user ID
   - Encrypted upload (HTTPS)
   - Audit trail otomatis

4. **Scalability:**
   - Unlimited concurrent users
   - Cloud storage (Google Drive)
   - Async processing
   - Auto-scaling backend

---

## 3️⃣ USER JOURNEY

### 🚀 Flow 1: First Time User (Registration)

```
Step 1: Landing Page
   ↓
   User clicks "Daftar"
   ↓
Step 2: Registration Form
   ├─ Nama Lengkap
   ├─ Email (unique)
   ├─ No. HP (optional)
   ├─ Password (min 6 chars)
   └─ Confirm Password
   ↓
Step 3: Backend Process
   ├─ Validate input
   ├─ Check email not exists
   ├─ Hash password (bcrypt)
   ├─ Create user with role = 'KLIEN'
   └─ Generate JWT token
   ↓
Step 4: Auto Login
   ├─ Save token to localStorage
   ├─ Save user data to localStorage
   └─ Redirect to /dashboard
   ↓
Step 5: Welcome Screen
   ├─ Show empty state
   └─ CTA: "Upload Dokumen Pertama Anda"
```

---

### 📂 Flow 2: Upload Dokumen (Core Feature)

```
Step 1: Dashboard
   ↓
   User clicks "Upload" tab
   ↓
Step 2: Bulk Upload Page
   ├─ Drag & Drop zone
   ├─ Or click to browse
   └─ Multiple file selection
   ↓
Step 3: File Validation (Frontend)
   ├─ Check file size (max 10MB per file)
   ├─ Check file type (PDF, DOC, DOCX, JPG, PNG, etc)
   ├─ Auto-detect document type from filename
   │  ├─ "Surat_Kuasa_2024.pdf" → Type: Surat Kuasa
   │  ├─ "Gugatan_ABC.docx" → Type: Gugatan
   │  └─ "Bukti_A.jpg" → Type: Bukti
   └─ Show preview & detected type
   ↓
Step 4: Review Files
   ├─ List all files to upload
   ├─ Show detected type per file
   ├─ Option to remove before upload
   └─ Click "Upload Semua (X files)"
   ↓
Step 5: Upload Process (Sequential)
   For each file:
   ├─ Status: "Uploading..."
   ├─ Progress bar: 0% → 100%
   ├─ Upload to backend (multipart/form-data)
   ├─ Backend uploads to Google Drive
   ├─ Backend saves metadata to database
   │  ├─ klien_id = req.user.id (IMPORTANT!)
   │  ├─ nama_dokumen = filename
   │  ├─ tipe_dokumen = auto-detected
   │  ├─ google_drive_file_id
   │  ├─ file_url
   │  └─ uploaded_at = now()
   ├─ Status: "Success" ✅
   └─ Show success message
   ↓
Step 6: Upload Complete
   ├─ Show summary: "X files berhasil, Y gagal"
   ├─ Option to view uploaded files
   ├─ Option to upload more
   └─ Auto-redirect to Dashboard (after 3s)
```

---

### 📊 Flow 3: View Dashboard

```
Step 1: Login Success
   ↓
   Auto redirect to /dashboard
   ↓
Step 2: Load Dashboard Data
   Backend queries:
   ├─ SELECT COUNT(*) FROM dokumen_klien 
   │  WHERE klien_id = req.user.id
   │  → Total Dokumen
   │
   ├─ SELECT COUNT(*) FROM dokumen_klien 
   │  WHERE klien_id = req.user.id 
   │  AND uploaded_at >= start_of_month
   │  → Dokumen Bulan Ini
   │
   ├─ SELECT COUNT(*) FROM dokumen_klien 
   │  WHERE klien_id = req.user.id 
   │  AND uploaded_at >= start_of_week
   │  → Dokumen Minggu Ini
   │
   └─ SELECT * FROM dokumen_klien 
      WHERE klien_id = req.user.id 
      ORDER BY uploaded_at DESC 
      LIMIT 10
      → Recent Documents
   ↓
Step 3: Display Dashboard
   ├─ Stats Cards (3 cards)
   │  ├─ 📄 Total Dokumen: 25
   │  ├─ ✅ Bulan Ini: 8
   │  └─ ⏰ Minggu Ini: 3
   │
   ├─ CTA Button
   │  └─ "Upload Dokumen Baru" (prominent)
   │
   └─ Recent Documents List
      For each document:
      ├─ 📄 Icon
      ├─ Nama Dokumen
      ├─ Type Badge (colored)
      ├─ Upload Date & Time
      └─ Actions:
         ├─ 👁️ View (opens Google Drive)
         ├─ 📥 Download
         └─ 🗑️ Delete (with confirmation)
```

---

### 📜 Flow 4: View History Timeline

```
Step 1: Dashboard
   ↓
   User clicks "Riwayat" tab
   ↓
Step 2: Load All Documents
   Backend query:
   SELECT * FROM dokumen_klien 
   WHERE klien_id = req.user.id 
   ORDER BY uploaded_at DESC
   ↓
Step 3: Group by Date
   Frontend groups documents:
   {
     "Senin, 21 November 2024": [doc1, doc2, doc3],
     "Minggu, 20 November 2024": [doc4, doc5],
     "Jumat, 18 November 2024": [doc6, doc7, doc8, doc9]
   }
   ↓
Step 4: Display Timeline
   For each date:
   ├─ 📅 Date Header
   │  └─ "Senin, 21 November 2024 (3 dokumen)"
   │
   └─ Timeline Items (vertical line)
      For each document:
      ├─ ● Timeline Dot
      │  └─ │ Connecting Line
      │     │
      ├─ Document Card
      │  ├─ 📄 Icon + Name
      │  ├─ Type Badge
      │  ├─ Upload Time (HH:MM)
      │  ├─ ✅ Success Status
      │  └─ Actions:
      │     ├─ 👁️ Lihat
      │     └─ 📥 Download
      │
      └─ │ Next document...
```

---

### 🔍 Flow 5: Search & Filter

```
Step 1: Dashboard
   ↓
   User types in search box
   ↓
Step 2: Real-time Search
   Frontend filters:
   documents.filter(doc => 
     doc.nama_dokumen
       .toLowerCase()
       .includes(searchQuery.toLowerCase())
   )
   ↓
Step 3: Apply Filter
   User selects document type:
   ├─ Semua Tipe
   ├─ Surat Kuasa
   ├─ Gugatan
   ├─ Putusan
   ├─ Bukti
   ├─ Kontrak
   └─ Lainnya
   ↓
Step 4: Display Results
   Show filtered & searched documents
   If no results:
   └─ Empty state: "Tidak ada dokumen yang cocok"
```

---

## 4️⃣ ARCHITECTURE DESIGN

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PORTAL KLIEN                           │
│                   (Next.js - Port 3002)                     │
│                                                             │
│  Pages:                                                     │
│  ├─ / (Landing)                                            │
│  ├─ /login                                                 │
│  ├─ /register                                              │
│  ├─ /dashboard (Protected)                                 │
│  ├─ /upload (Protected)                                    │
│  └─ /history (Protected)                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS + JWT
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│                  (NestJS - Port 3000)                       │
│                                                             │
│  Modules:                                                   │
│  ├─ auth/                                                   │
│  │  ├─ POST /auth/register                                 │
│  │  ├─ POST /auth/login                                    │
│  │  └─ GET  /auth/profile                                  │
│  │                                                          │
│  └─ dokumen-klien/ (NEW - ISOLATED)                        │
│     ├─ POST   /dokumen-klien/upload                        │
│     ├─ GET    /dokumen-klien/my-documents                  │
│     ├─ GET    /dokumen-klien/stats                         │
│     ├─ GET    /dokumen-klien/:id                           │
│     └─ DELETE /dokumen-klien/:id                           │
│                                                             │
│  Guards:                                                    │
│  ├─ JwtAuthGuard (All protected routes)                    │
│  ├─ RolesGuard (@Roles('KLIEN'))                          │
│  └─ OwnershipGuard (Check: doc.klien_id === user.id)      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ↓                       ↓
    ┌─────────────────────┐ ┌─────────────────────┐
    │   DATABASE          │ │   GOOGLE DRIVE      │
    │   (PostgreSQL)      │ │   (Cloud Storage)   │
    │                     │ │                     │
    │  Tables:            │ │  Folders:           │
    │  ├─ users           │ │  └─ Klien-{id}/     │
    │  └─ dokumen_klien   │ │     ├─ doc1.pdf     │
    │                     │ │     ├─ doc2.docx    │
    └─────────────────────┘ └─────────────────────┘
```

---

### 🔒 Data Isolation Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA ISOLATION LAYERS                    │
└─────────────────────────────────────────────────────────────┘

Layer 1: JWT Authentication
├─ Every request must have valid JWT token
├─ Token contains: { userId, email, role }
└─ Invalid token = 401 Unauthorized

Layer 2: Role-Based Access Control (RBAC)
├─ @Roles('KLIEN') decorator on controller
├─ Only users with role = 'KLIEN' can access
└─ Other roles = 403 Forbidden

Layer 3: Ownership Verification (CRITICAL!)
├─ EVERY query filters by user ID:
│  └─ WHERE klien_id = req.user.id
│
├─ Example (Get All):
│  SELECT * FROM dokumen_klien 
│  WHERE klien_id = $1
│  → Returns ONLY user's documents
│
├─ Example (Get One):
│  SELECT * FROM dokumen_klien 
│  WHERE id = $1 AND klien_id = $2
│  → If not owned by user: 404 Not Found
│
└─ Example (Delete):
   DELETE FROM dokumen_klien 
   WHERE id = $1 AND klien_id = $2
   → If not owned by user: 404 Not Found

Layer 4: Database Constraints
├─ Foreign key: dokumen_klien.klien_id → users.id
├─ NOT NULL constraint on klien_id
└─ Index on (klien_id, uploaded_at) for performance

Layer 5: Google Drive Isolation
├─ Each klien has separate folder: /Klien-{userId}/
├─ No shared folders between klien
└─ Permissions: Only backend service account can access
```

---

## 5️⃣ DATABASE DESIGN

### 📊 Table: dokumen_klien

```sql
CREATE TABLE dokumen_klien (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership (CRITICAL - For Isolation)
  klien_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Document Info
  nama_dokumen VARCHAR(255) NOT NULL,
  tipe_dokumen VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  kategori VARCHAR(100),
  tags TEXT[],
  
  -- File Storage
  google_drive_file_id VARCHAR(255) NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Metadata
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete (Optional)
  deleted_at TIMESTAMP,
  
  -- Indexes for Performance
  CONSTRAINT dokumen_klien_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- INDEXES (CRITICAL FOR PERFORMANCE)
-- ============================================================================

-- Index 1: Query by klien_id (most common query)
CREATE INDEX idx_dokumen_klien_klien_id 
ON dokumen_klien(klien_id) 
WHERE deleted_at IS NULL;

-- Index 2: Query by klien_id + date (for dashboard stats)
CREATE INDEX idx_dokumen_klien_klien_date 
ON dokumen_klien(klien_id, uploaded_at DESC) 
WHERE deleted_at IS NULL;

-- Index 3: Query by klien_id + type (for filtering)
CREATE INDEX idx_dokumen_klien_klien_type 
ON dokumen_klien(klien_id, tipe_dokumen) 
WHERE deleted_at IS NULL;

-- Index 4: Full-text search on nama_dokumen
CREATE INDEX idx_dokumen_klien_search 
ON dokumen_klien USING gin(to_tsvector('indonesian', nama_dokumen));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL BUT RECOMMENDED
-- ============================================================================

-- Enable RLS
ALTER TABLE dokumen_klien ENABLE ROW LEVEL SECURITY;

-- Policy: Klien can only see their own documents
CREATE POLICY dokumen_klien_isolation ON dokumen_klien
  FOR ALL
  USING (klien_id = current_setting('app.current_user_id')::UUID);

-- Policy: Klien can only insert with their own ID
CREATE POLICY dokumen_klien_insert ON dokumen_klien
  FOR INSERT
  WITH CHECK (klien_id = current_setting('app.current_user_id')::UUID);
```

---

### 📈 Example Queries

```sql
-- ============================================================================
-- QUERY 1: Get All Documents for Klien
-- ============================================================================
SELECT 
  id,
  nama_dokumen,
  tipe_dokumen,
  file_url,
  file_size,
  uploaded_at
FROM dokumen_klien
WHERE klien_id = $1 -- req.user.id
  AND deleted_at IS NULL
ORDER BY uploaded_at DESC;

-- ============================================================================
-- QUERY 2: Get Dashboard Stats
-- ============================================================================
-- Total documents
SELECT COUNT(*) as total
FROM dokumen_klien
WHERE klien_id = $1 AND deleted_at IS NULL;

-- Documents this month
SELECT COUNT(*) as bulan_ini
FROM dokumen_klien
WHERE klien_id = $1 
  AND deleted_at IS NULL
  AND uploaded_at >= date_trunc('month', CURRENT_TIMESTAMP);

-- Documents this week
SELECT COUNT(*) as minggu_ini
FROM dokumen_klien
WHERE klien_id = $1 
  AND deleted_at IS NULL
  AND uploaded_at >= date_trunc('week', CURRENT_TIMESTAMP);

-- ============================================================================
-- QUERY 3: Get Single Document (with Ownership Check)
-- ============================================================================
SELECT *
FROM dokumen_klien
WHERE id = $1 
  AND klien_id = $2 -- CRITICAL: Ownership check
  AND deleted_at IS NULL;

-- If no rows returned = Either not exists OR not owned by user
-- Both cases return 404 (don't leak existence info)

-- ============================================================================
-- QUERY 4: Search Documents
-- ============================================================================
SELECT *
FROM dokumen_klien
WHERE klien_id = $1
  AND deleted_at IS NULL
  AND (
    nama_dokumen ILIKE $2 -- '%search%'
    OR deskripsi ILIKE $2
  )
ORDER BY uploaded_at DESC;

-- ============================================================================
-- QUERY 5: Filter by Type
-- ============================================================================
SELECT *
FROM dokumen_klien
WHERE klien_id = $1
  AND deleted_at IS NULL
  AND tipe_dokumen = $2
ORDER BY uploaded_at DESC;

-- ============================================================================
-- QUERY 6: Delete Document (with Ownership Check)
-- ============================================================================
-- Soft delete (recommended)
UPDATE dokumen_klien
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 
  AND klien_id = $2 -- CRITICAL: Ownership check
  AND deleted_at IS NULL;

-- Hard delete (not recommended)
DELETE FROM dokumen_klien
WHERE id = $1 
  AND klien_id = $2 -- CRITICAL: Ownership check
  AND deleted_at IS NULL;
```

---

## 6️⃣ API ENDPOINTS

### 🔐 Authentication Endpoints

```typescript
// ============================================================================
// POST /api/v1/auth/register
// ============================================================================
// Purpose: Register new klien
// Access: Public
// Request:
{
  "email": "klien@example.com",
  "password": "securepassword",
  "nama_lengkap": "John Doe",
  "no_hp": "08123456789" // optional
}

// Response: 201 Created
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "klien@example.com",
      "nama_lengkap": "John Doe",
      "role": "KLIEN",
      "no_hp": "08123456789",
      "created_at": "2024-11-21T10:00:00Z"
    }
  },
  "timestamp": "2024-11-21T10:00:00Z"
}

// Error: 400 Bad Request
{
  "success": false,
  "error": "Email already exists",
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// POST /api/v1/auth/login
// ============================================================================
// Purpose: Login klien
// Access: Public
// Request:
{
  "email": "klien@example.com",
  "password": "securepassword"
}

// Response: 200 OK
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "klien@example.com",
      "nama_lengkap": "John Doe",
      "role": "KLIEN"
    }
  },
  "timestamp": "2024-11-21T10:00:00Z"
}

// Error: 401 Unauthorized
{
  "success": false,
  "error": "Invalid credentials",
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// GET /api/v1/auth/profile
// ============================================================================
// Purpose: Get current user profile
// Access: Protected (JWT required)
// Headers: Authorization: Bearer {token}
// Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "klien@example.com",
    "nama_lengkap": "John Doe",
    "role": "KLIEN",
    "no_hp": "08123456789",
    "created_at": "2024-11-21T10:00:00Z"
  },
  "timestamp": "2024-11-21T10:00:00Z"
}
```

---

### 📂 Dokumen Klien Endpoints

```typescript
// ============================================================================
// POST /api/v1/dokumen-klien/upload
// ============================================================================
// Purpose: Bulk upload documents
// Access: Protected (KLIEN role only)
// Headers: 
//   Authorization: Bearer {token}
//   Content-Type: multipart/form-data
// Request Body (FormData):
{
  files: File[],              // Multiple files
  nama_dokumen: string,       // Optional: Override filename
  tipe_dokumen: string,       // Optional: Override auto-detect
  deskripsi: string,          // Optional
  kategori: string,           // Optional
  tags: string[]              // Optional
}

// Response: 201 Created
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "id": "uuid-1",
        "nama_dokumen": "Surat_Kuasa_2024.pdf",
        "tipe_dokumen": "surat_kuasa",
        "google_drive_file_id": "1abc...",
        "file_url": "https://drive.google.com/file/d/1abc.../view",
        "file_size": 1024000,
        "uploaded_at": "2024-11-21T10:00:00Z"
      },
      {
        "id": "uuid-2",
        "nama_dokumen": "KTP.jpg",
        "tipe_dokumen": "bukti",
        "google_drive_file_id": "2def...",
        "file_url": "https://drive.google.com/file/d/2def.../view",
        "file_size": 512000,
        "uploaded_at": "2024-11-21T10:00:01Z"
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "success": 2,
      "failed": 0
    }
  },
  "timestamp": "2024-11-21T10:00:01Z"
}

// Error: 400 Bad Request (validation failed)
{
  "success": false,
  "error": "File size exceeds 10MB limit",
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// GET /api/v1/dokumen-klien/my-documents
// ============================================================================
// Purpose: Get all documents for current klien
// Access: Protected (KLIEN role only)
// Query Params:
//   - search: string (optional) - Search by nama_dokumen
//   - tipe_dokumen: string (optional) - Filter by type
//   - page: number (optional, default: 1)
//   - limit: number (optional, default: 20)
//   - sort: string (optional, default: 'uploaded_at:desc')
// Headers: Authorization: Bearer {token}

// Response: 200 OK
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "nama_dokumen": "Surat_Kuasa_2024.pdf",
        "tipe_dokumen": "surat_kuasa",
        "deskripsi": "Surat kuasa untuk perkara ABC",
        "kategori": "Legal",
        "tags": ["urgent", "perkara-abc"],
        "file_url": "https://drive.google.com/...",
        "file_size": 1024000,
        "mime_type": "application/pdf",
        "uploaded_at": "2024-11-21T10:00:00Z"
      }
      // ... more documents
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// GET /api/v1/dokumen-klien/stats
// ============================================================================
// Purpose: Get dashboard statistics
// Access: Protected (KLIEN role only)
// Headers: Authorization: Bearer {token}

// Response: 200 OK
{
  "success": true,
  "data": {
    "total_dokumen": 50,
    "dokumen_bulan_ini": 12,
    "dokumen_minggu_ini": 3,
    "by_type": {
      "surat_kuasa": 10,
      "gugatan": 5,
      "bukti": 20,
      "kontrak": 8,
      "lainnya": 7
    },
    "total_size": 52428800, // bytes (50MB)
    "recent_uploads": [
      {
        "id": "uuid",
        "nama_dokumen": "Latest_Doc.pdf",
        "uploaded_at": "2024-11-21T09:00:00Z"
      }
      // ... 4 more recent docs
    ]
  },
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// GET /api/v1/dokumen-klien/:id
// ============================================================================
// Purpose: Get single document details
// Access: Protected (KLIEN role only)
// Headers: Authorization: Bearer {token}
// Params: id (UUID)

// Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "nama_dokumen": "Surat_Kuasa_2024.pdf",
    "tipe_dokumen": "surat_kuasa",
    "deskripsi": "Surat kuasa untuk perkara ABC",
    "kategori": "Legal",
    "tags": ["urgent", "perkara-abc"],
    "google_drive_file_id": "1abc...",
    "file_url": "https://drive.google.com/file/d/1abc.../view",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "uploaded_at": "2024-11-21T10:00:00Z",
    "updated_at": "2024-11-21T10:00:00Z"
  },
  "timestamp": "2024-11-21T10:00:00Z"
}

// Error: 404 Not Found (either not exists or not owned by user)
{
  "success": false,
  "error": "Document not found",
  "timestamp": "2024-11-21T10:00:00Z"
}

// ============================================================================
// PATCH /api/v1/dokumen-klien/:id
// ============================================================================
// Purpose: Update document metadata (NOT the file itself)
// Access: Protected (KLIEN role only)
// Headers: Authorization: Bearer {token}
// Params: id (UUID)
// Request:
{
  "nama_dokumen": "Updated_Name.pdf", // optional
  "deskripsi": "Updated description", // optional
  "kategori": "Updated category",     // optional
  "tags": ["tag1", "tag2"]            // optional
}

// Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "nama_dokumen": "Updated_Name.pdf",
    "deskripsi": "Updated description",
    // ... full document object
    "updated_at": "2024-11-21T11:00:00Z"
  },
  "timestamp": "2024-11-21T11:00:00Z"
}

// ============================================================================
// DELETE /api/v1/dokumen-klien/:id
// ============================================================================
// Purpose: Delete document (soft delete recommended)
// Access: Protected (KLIEN role only)
// Headers: Authorization: Bearer {token}
// Params: id (UUID)

// Response: 200 OK
{
  "success": true,
  "message": "Document deleted successfully",
  "timestamp": "2024-11-21T10:00:00Z"
}

// Error: 404 Not Found (either not exists or not owned by user)
{
  "success": false,
  "error": "Document not found",
  "timestamp": "2024-11-21T10:00:00Z"
}
```

---

## 7️⃣ SECURITY & ISOLATION

### 🔒 Security Checklist

```typescript
// ============================================================================
// 1. JWT AUTHENTICATION
// ============================================================================

// Guards Implementation
@Controller('dokumen-klien')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('KLIEN')
export class DokumenKlienController {
  // All routes protected
}

// JWT Strategy
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: JwtPayload) {
    // Validate token
    // Return user object with id, email, role
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

// ============================================================================
// 2. OWNERSHIP VERIFICATION (CRITICAL!)
// ============================================================================

// Service Method Example
async findAllByUser(userId: string, filters?: any) {
  return this.prisma.dokumenKlien.findMany({
    where: {
      klien_id: userId,  // ✅ ALWAYS filter by user ID
      deleted_at: null,
      ...filters,
    },
    orderBy: { uploaded_at: 'desc' },
  });
}

async findOne(id: string, userId: string) {
  const doc = await this.prisma.dokumenKlien.findFirst({
    where: {
      id,
      klien_id: userId,  // ✅ CRITICAL: Ownership check
      deleted_at: null,
    },
  });
  
  if (!doc) {
    throw new NotFoundException('Document not found');
  }
  
  return doc;
}

async delete(id: string, userId: string) {
  // First verify ownership
  await this.findOne(id, userId);
  
  // Then delete
  return this.prisma.dokumenKlien.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

// ============================================================================
// 3. INPUT VALIDATION
// ============================================================================

// DTOs with class-validator
export class UploadDokumenDto {
  @IsString()
  @IsOptional()
  nama_dokumen?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  tipe_dokumen?: DocumentType;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  deskripsi?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

// File validation
const fileFilter = (req, file, callback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'image/jpeg',
    'image/png',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid file type'), false);
  }
};

const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 20, // Max 20 files per upload
};

// ============================================================================
// 4. RATE LIMITING
// ============================================================================

@Controller('dokumen-klien')
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
export class DokumenKlienController {
  
  @Post('upload')
  @Throttle(5, 60) // Stricter for upload: 5 per minute
  async upload() {
    // ...
  }
}

// ============================================================================
// 5. AUDIT LOGGING
// ============================================================================

// Log all actions
async logAction(action: string, userId: string, details: any) {
  await this.prisma.logAktivitas.create({
    data: {
      user_id: userId,
      aksi: action,
      jenis_entitas: 'DOKUMEN_KLIEN',
      detail: details,
      created_at: new Date(),
    },
  });
}

// Usage
async upload(files, dto, req) {
  const result = await this.uploadService.process(files, dto, req.user.id);
  
  await this.logAction('UPLOAD_DOKUMEN', req.user.id, {
    total_files: files.length,
    types: result.map(r => r.tipe_dokumen),
  });
  
  return result;
}

// ============================================================================
// 6. ERROR HANDLING (Don't Leak Info)
// ============================================================================

// BAD: Leaks existence
if (!doc) {
  throw new NotFoundException('Document exists but you dont have access');
}

// GOOD: Same error for both cases
if (!doc || doc.klien_id !== userId) {
  throw new NotFoundException('Document not found'); // Could mean not exists OR not owned
}
```

---

### 🛡️ Security Best Practices

```typescript
// ============================================================================
// CHECKLIST: Security Best Practices
// ============================================================================

✅ 1. Authentication
   ├─ JWT tokens with expiration (7 days)
   ├─ Refresh tokens (30 days)
   ├─ Secure password hashing (bcrypt, 10 rounds)
   └─ HTTPS only in production

✅ 2. Authorization
   ├─ Role-based access (@Roles('KLIEN'))
   ├─ Ownership verification (klien_id check)
   └─ Resource-level permissions

✅ 3. Input Validation
   ├─ DTO validation (class-validator)
   ├─ File type validation
   ├─ File size limits (10MB)
   └─ SQL injection prevention (Prisma ORM)

✅ 4. Output Sanitization
   ├─ Don't expose internal IDs unnecessarily
   ├─ Remove sensitive fields from responses
   └─ Consistent error messages (don't leak info)

✅ 5. Rate Limiting
   ├─ Global: 100 req/min
   ├─ Auth endpoints: 10 req/min
   └─ Upload endpoint: 5 req/min

✅ 6. CORS
   ├─ Whitelist specific origins
   ├─ Credentials: true
   └─ Allowed methods: GET, POST, PATCH, DELETE

✅ 7. Logging & Monitoring
   ├─ Log all auth attempts
   ├─ Log all document actions
   ├─ Monitor failed auth attempts
   └─ Alert on suspicious activity

✅ 8. Data Protection
   ├─ Encryption in transit (HTTPS/TLS)
   ├─ Encryption at rest (Google Drive encrypted)
   ├─ Regular backups (database + files)
   └─ Soft delete (keep audit trail)

✅ 9. Google Drive Security
   ├─ Service account with limited permissions
   ├─ Per-user folders (/Klien-{id}/)
   ├─ No public sharing links
   └─ Access only via backend API

✅ 10. Environment Security
   ├─ Secrets in environment variables
   ├─ Different keys for dev/staging/prod
   ├─ No credentials in code
   └─ Regular key rotation
```

---

## 8️⃣ IMPLEMENTATION PHASES

### 📅 Phase 1: Backend Foundation (Week 1)

**Day 1-2: Setup Module**
```bash
# Create module
nest g module dokumen-klien
nest g controller dokumen-klien
nest g service dokumen-klien
nest g dto create-dokumen-klien
nest g dto update-dokumen-klien

# Create database migration
npx prisma migrate dev --name add_dokumen_klien_table
```

**Day 3-4: Core Endpoints**
- ✅ POST /upload (with Google Drive integration)
- ✅ GET /my-documents (with pagination)
- ✅ GET /stats (dashboard data)
- ✅ GET /:id (single document)
- ✅ DELETE /:id (soft delete)

**Day 5: Testing & Security**
- ✅ Unit tests for service
- ✅ Integration tests for endpoints
- ✅ Security audit (ownership checks)
- ✅ Load testing (simulate 100 concurrent uploads)

---

### 📅 Phase 2: Frontend Implementation (Week 2)

**Day 1-2: Authentication**
- ✅ Login page
- ✅ Register page
- ✅ Auth hook (useAuth)
- ✅ Protected routes

**Day 3-4: Core Features**
- ✅ Dashboard page (stats + list)
- ✅ Upload page (bulk upload with drag & drop)
- ✅ History page (timeline view)

**Day 5: Polish & Testing**
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Responsive design
- ✅ End-to-end testing

---

### 📅 Phase 3: Integration & Testing (Week 3)

**Day 1-2: Integration Testing**
- ✅ Test all user flows
- ✅ Test error scenarios
- ✅ Test edge cases (large files, slow network, etc)

**Day 3-4: Performance Optimization**
- ✅ Database query optimization
- ✅ Frontend code splitting
- ✅ Image optimization
- ✅ Caching strategy

**Day 5: Security Audit**
- ✅ Penetration testing
- ✅ Code review
- ✅ Security checklist verification

---

### 📅 Phase 4: Deployment (Week 4)

**Day 1-2: Staging Deployment**
- ✅ Deploy backend to staging
- ✅ Deploy frontend to staging
- ✅ Test on staging environment
- ✅ User acceptance testing (UAT)

**Day 3-4: Production Deployment**
- ✅ Deploy backend to production
- ✅ Deploy frontend to production
- ✅ Monitor logs & metrics
- ✅ Setup alerts

**Day 5: Documentation & Handoff**
- ✅ API documentation (Swagger)
- ✅ User guide
- ✅ Admin guide
- ✅ Troubleshooting guide

---

## 9️⃣ TESTING STRATEGY

### 🧪 Test Cases

```typescript
// ============================================================================
// UNIT TESTS: Service Layer
// ============================================================================

describe('DokumenKlienService', () => {
  
  it('should upload document with correct klien_id', async () => {
    const userId = 'test-user-id';
    const file = mockFile();
    
    const result = await service.upload(file, {}, userId);
    
    expect(result.klien_id).toBe(userId);
    expect(result.google_drive_file_id).toBeDefined();
  });
  
  it('should only return user documents', async () => {
    const userId = 'test-user-id';
    
    const docs = await service.findAllByUser(userId);
    
    docs.forEach(doc => {
      expect(doc.klien_id).toBe(userId);
    });
  });
  
  it('should throw NotFoundException for other user document', async () => {
    const userId = 'user-1';
    const docId = 'doc-owned-by-user-2';
    
    await expect(
      service.findOne(docId, userId)
    ).rejects.toThrow(NotFoundException);
  });
});

// ============================================================================
// INTEGRATION TESTS: API Endpoints
// ============================================================================

describe('DokumenKlienController (e2e)', () => {
  
  it('POST /upload - should upload and return document', () => {
    return request(app.getHttpServer())
      .post('/dokumen-klien/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('files', './test-files/sample.pdf')
      .expect(201)
      .expect((res) => {
        expect(res.body.data.uploaded).toHaveLength(1);
        expect(res.body.data.uploaded[0].klien_id).toBe(userId);
      });
  });
  
  it('GET /my-documents - should return only user documents', () => {
    return request(app.getHttpServer())
      .get('/dokumen-klien/my-documents')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        const docs = res.body.data.documents;
        docs.forEach(doc => {
          expect(doc.klien_id).toBe(userId);
        });
      });
  });
  
  it('GET /:id - should return 404 for other user document', () => {
    const otherUserDocId = 'doc-owned-by-other-user';
    
    return request(app.getHttpServer())
      .get(`/dokumen-klien/${otherUserDocId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });
  
  it('DELETE /:id - should delete own document', () => {
    const ownDocId = 'doc-owned-by-user';
    
    return request(app.getHttpServer())
      .delete(`/dokumen-klien/${ownDocId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});

// ============================================================================
// SECURITY TESTS: Isolation Verification
// ============================================================================

describe('Security: Data Isolation', () => {
  
  it('should NOT allow access to other user documents', async () => {
    // User 1 uploads document
    const user1Token = await getTokenForUser('user-1');
    const uploadRes = await request(app)
      .post('/dokumen-klien/upload')
      .set('Authorization', `Bearer ${user1Token}`)
      .attach('files', './test.pdf');
    
    const docId = uploadRes.body.data.uploaded[0].id;
    
    // User 2 tries to access
    const user2Token = await getTokenForUser('user-2');
    await request(app)
      .get(`/dokumen-klien/${docId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(404); // Should NOT find
  });
  
  it('should NOT allow deleting other user documents', async () => {
    // Similar test for DELETE
  });
});

// ============================================================================
// LOAD TESTS: Performance
// ============================================================================

describe('Load Testing', () => {
  
  it('should handle 100 concurrent uploads', async () => {
    const promises = Array(100).fill(null).map(() =>
      request(app)
        .post('/dokumen-klien/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', './test.pdf')
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(res => {
      expect(res.status).toBe(201);
    });
  });
});
```

---

## 🔟 FUTURE ENHANCEMENTS

### 🚀 Phase 5: Advanced Features (Future)

```typescript
// ============================================================================
// 1. DOCUMENT PREVIEW (In-App)
// ============================================================================
// Preview PDF, DOCX, images without leaving app
GET /dokumen-klien/:id/preview
Response: {
  preview_url: "https://...", // Temporary signed URL
  expires_at: "2024-11-21T11:00:00Z"
}

// ============================================================================
// 2. DOCUMENT SHARING (Temporary Links)
// ============================================================================
// Generate temporary shareable link (expires in 24h)
POST /dokumen-klien/:id/share
Request: {
  expires_in_hours: 24,
  password_protected: true
}
Response: {
  share_link: "https://portal.perari.id/share/abc123",
  expires_at: "2024-11-22T10:00:00Z"
}

// ============================================================================
// 3. DOCUMENT CATEGORIES & TAGS
// ============================================================================
// Better organization
GET /dokumen-klien/categories
GET /dokumen-klien/tags
POST /dokumen-klien/:id/add-tag

// ============================================================================
// 4. NOTIFICATIONS
// ============================================================================
// Email/SMS when document processed
POST /dokumen-klien/:id/processed
→ Triggers email: "Your document has been reviewed by staff"

// ============================================================================
// 5. DOCUMENT VERSIONING
// ============================================================================
// Upload new version of existing document
POST /dokumen-klien/:id/versions
GET /dokumen-klien/:id/versions
Response: {
  versions: [
    { version: 1, uploaded_at: "...", file_url: "..." },
    { version: 2, uploaded_at: "...", file_url: "..." }
  ]
}

// ============================================================================
// 6. ADVANCED SEARCH
// ============================================================================
// Full-text search, date range, size range
GET /dokumen-klien/search?q=kontrak&date_from=2024-01-01&size_min=1mb

// ============================================================================
// 7. DOCUMENT ANALYTICS
// ============================================================================
// Track views, downloads
GET /dokumen-klien/:id/analytics
Response: {
  total_views: 10,
  total_downloads: 5,
  last_viewed_at: "2024-11-21T10:00:00Z"
}

// ============================================================================
// 8. BULK OPERATIONS
// ============================================================================
// Download multiple documents as ZIP
POST /dokumen-klien/bulk-download
Request: { document_ids: ["id1", "id2", "id3"] }
Response: { download_url: "https://..." }

// Delete multiple documents
POST /dokumen-klien/bulk-delete
Request: { document_ids: ["id1", "id2", "id3"] }

// ============================================================================
// 9. DOCUMENT TEMPLATES
// ============================================================================
// Pre-fill forms with klien data
GET /dokumen-klien/templates
POST /dokumen-klien/templates/:id/generate

// ============================================================================
// 10. MOBILE APP (React Native)
// ============================================================================
// Native mobile app for iOS & Android
// Features:
// - Camera integration (scan documents)
// - Offline mode (queue uploads)
// - Push notifications
// - Biometric authentication
```

---

## 📊 SUCCESS METRICS

### 🎯 KPIs to Track

```typescript
// ============================================================================
// USER METRICS
// ============================================================================
✅ Total registered klien
✅ Active klien (uploaded in last 30 days)
✅ New klien registrations per month
✅ User retention rate

// ============================================================================
// DOCUMENT METRICS
// ============================================================================
✅ Total documents uploaded
✅ Documents uploaded per day/week/month
✅ Average documents per klien
✅ Document types distribution
✅ Average file size
✅ Total storage used

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================
✅ Average upload time per document
✅ API response time (p50, p95, p99)
✅ Error rate (%)
✅ Uptime (%)

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================
✅ Login frequency
✅ Time spent in portal
✅ Features used most
✅ Search queries

// ============================================================================
// BUSINESS METRICS
// ============================================================================
✅ Staff time saved (hours/month)
✅ Cost savings (vs manual process)
✅ Client satisfaction score
✅ Support ticket reduction
```

---

## 📞 SUPPORT & MAINTENANCE

### 🛠️ Maintenance Plan

```typescript
// ============================================================================
// DAILY
// ============================================================================
✅ Monitor error logs
✅ Check system health
✅ Review failed uploads
✅ Check database backups

// ============================================================================
// WEEKLY
// ============================================================================
✅ Review performance metrics
✅ Check storage usage
✅ Update dependencies (security patches)
✅ Review user feedback

// ============================================================================
// MONTHLY
// ============================================================================
✅ Database optimization (vacuum, reindex)
✅ Clean up old logs
✅ Review and rotate API keys
✅ Security audit
✅ Performance tuning

// ============================================================================
// QUARTERLY
// ============================================================================
✅ Major version updates
✅ Feature planning
✅ User survey
✅ Disaster recovery drill
```

---

## 🎉 CONCLUSION

### ✅ Summary

Portal Klien adalah solusi **self-service** yang memungkinkan klien untuk:
- ✅ Upload dokumen dengan mudah (bulk upload, drag & drop)
- ✅ Track history dokumen mereka
- ✅ Download dokumen kapan saja
- ❌ **100% isolated** - tidak bisa lihat data klien lain

### 🔐 Key Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Role-Based Access Control** - Only KLIEN role can access
3. **Ownership Verification** - Every query filters by user ID
4. **Data Isolation** - Separate tables, separate folders
5. **Audit Logging** - Track all actions

### 🎯 Business Benefits

1. **Time Savings** - 80% reduction in manual upload time
2. **Better UX** - Klien dapat self-service 24/7
3. **Scalability** - Unlimited concurrent users
4. **Security** - Encrypted, audited, isolated
5. **Cost Savings** - Reduce staff workload

### 🚀 Next Steps

1. **Review this plan** with team
2. **Prioritize features** for Phase 1
3. **Setup development environment**
4. **Start implementation** Week 1
5. **Deploy to production** Week 4

---

**READY TO BUILD? LET'S GO! 🔥**

**Questions? Feedback? Let's discuss! 💬**

---

**Document Version:** 1.0  
**Last Updated:** November 21, 2024  
**Author:** Development Team  
**Status:** Ready for Implementation ✅