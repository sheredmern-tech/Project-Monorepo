# 🔄 DOKUMEN WORKFLOW - STAGING & APPROVAL SYSTEM

> **Roadmap untuk implementasi sistem approval dokumen**
> **Priority:** HIGH
> **Complexity:** Medium
> **Estimated:** 2-3 weeks

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Business Requirements](#business-requirements)
3. [Database Design](#database-design)
4. [Workflow States](#workflow-states)
5. [API Design](#api-design)
6. [Frontend Components](#frontend-components)
7. [Permission Matrix](#permission-matrix)
8. [Implementation Plan](#implementation-plan)
9. [Testing Strategy](#testing-strategy)

---

## 🎯 OVERVIEW

### Problem Statement

**Current State:**
- Semua dokumen yang diupload langsung visible ke semua user termasuk klien
- Tidak ada quality control sebelum dokumen dipublish
- Risk: Dokumen yang salah/belum siap bisa terlihat klien

**Desired State:**
- Dokumen harus melalui approval sebelum visible ke klien
- Staff upload → Admin/Advokat review & approve → Klien bisa lihat
- Ada audit trail untuk semua perubahan status

### Solution

Implementasi **Document Workflow System** dengan states:
- **DRAFT** - Initial upload, only visible to uploader & admins
- **SUBMITTED** - Submitted for review, visible to reviewers
- **IN_REVIEW** - Being reviewed by admin/advokat
- **APPROVED** - Approved, visible to everyone including klien
- **REJECTED** - Rejected with notes, back to staff for revision
- **ARCHIVED** - Soft deleted, not visible to anyone

---

## 📊 BUSINESS REQUIREMENTS

### User Stories

#### Staff/Advokat
```
AS A staff member
I WANT TO upload documents in draft mode
SO THAT I can review before publishing to client

AS A staff member
I WANT TO submit documents for approval
SO THAT admin can review before client sees

AS A staff member
I WANT TO see rejection notes
SO THAT I know what to fix

AS A staff member
I WANT TO revise rejected documents
SO THAT I can resubmit after corrections
```

#### Admin/Super Advokat
```
AS AN admin
I WANT TO see all pending documents
SO THAT I can review and approve/reject

AS AN admin
I WANT TO add notes when rejecting
SO THAT staff knows what to fix

AS AN admin
I WANT TO see document history
SO THAT I know who uploaded and when

AS AN admin
I WANT TO approve multiple documents at once
SO THAT I can work faster
```

#### Client
```
AS A client
I WANT TO see only approved documents
SO THAT I only see final/official documents

AS A client
I DON'T WANT TO see draft/rejected documents
SO THAT I'm not confused by work-in-progress
```

---

## 💾 DATABASE DESIGN

### New Table: dokumen_status

```prisma
model DokumenStatus {
  id                String          @id @default(uuid())
  dokumen_id        String          @unique
  status            WorkflowStatus  @default(DRAFT)

  // Timestamps
  submitted_at      DateTime?
  reviewed_at       DateTime?
  approved_at       DateTime?
  rejected_at       DateTime?
  archived_at       DateTime?

  // Actors
  submitted_by      String?
  reviewed_by       String?
  approved_by       String?  // Same as reviewed_by but explicit
  rejected_by       String?  // Same as reviewed_by but explicit
  archived_by       String?

  // Notes
  submission_notes  String?
  rejection_notes   String?
  approval_notes    String?

  // Versioning (for future)
  version           Int             @default(1)

  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt

  // Relations
  dokumen           DokumenHukum    @relation(fields: [dokumen_id], references: [id], onDelete: Cascade)
  submitter         User?           @relation("Submitter", fields: [submitted_by], references: [id])
  reviewer          User?           @relation("Reviewer", fields: [reviewed_by], references: [id])

  @@index([dokumen_id])
  @@index([status])
}

enum WorkflowStatus {
  DRAFT       // Initial upload (visible: uploader, admins)
  SUBMITTED   // Awaiting review (visible: uploader, admins, reviewers)
  IN_REVIEW   // Being reviewed (visible: uploader, admins, reviewers)
  APPROVED    // Approved (visible: everyone)
  REJECTED    // Rejected (visible: uploader, admins, reviewers)
  ARCHIVED    // Soft deleted (visible: admins only)
}
```

### New Table: dokumen_audit_log

```prisma
model DokumenAuditLog {
  id            String      @id @default(uuid())
  dokumen_id    String
  action        AuditAction
  from_status   WorkflowStatus?
  to_status     WorkflowStatus?
  performed_by  String
  notes         String?
  metadata      Json?       // Additional data (IP, user agent, etc.)
  timestamp     DateTime    @default(now())

  // Relations
  dokumen       DokumenHukum @relation(fields: [dokumen_id], references: [id], onDelete: Cascade)
  user          User         @relation(fields: [performed_by], references: [id])

  @@index([dokumen_id])
  @@index([performed_by])
  @@index([action])
  @@index([timestamp])
}

enum AuditAction {
  CREATED       // Document created
  SUBMITTED     // Submitted for review
  REVIEWED      // Review started
  APPROVED      // Approved
  REJECTED      // Rejected
  REVISED       // Revised after rejection
  ARCHIVED      // Archived
  RESTORED      // Restored from archive
  DELETED       // Permanently deleted
}
```

### Migration Plan

```sql
-- Step 1: Create new tables
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'REVISED', 'ARCHIVED', 'RESTORED', 'DELETED');

CREATE TABLE "dokumen_status" (...);
CREATE TABLE "dokumen_audit_log" (...);

-- Step 2: Migrate existing documents to APPROVED status
INSERT INTO "dokumen_status" (id, dokumen_id, status, approved_at, approved_by)
SELECT gen_random_uuid(), id, 'APPROVED', tanggal_upload, diupload_oleh
FROM "dokumen_hukum";

-- Step 3: Create audit log for existing documents
INSERT INTO "dokumen_audit_log" (id, dokumen_id, action, to_status, performed_by, timestamp)
SELECT gen_random_uuid(), id, 'CREATED', 'APPROVED', diupload_oleh, tanggal_upload
FROM "dokumen_hukum";
```

---

## 🔄 WORKFLOW STATES

### State Diagram

```
                    ┌─────────────┐
                    │    DRAFT    │ ← Initial state (upload)
                    └──────┬──────┘
                           │ Submit
                           ↓
                    ┌─────────────┐
                    │  SUBMITTED  │
                    └──────┬──────┘
                           │ Start Review
                           ↓
                    ┌─────────────┐
              ┌────→│  IN_REVIEW  │────┐
              │     └─────────────┘    │
              │                        │
           Reject                   Approve
              │                        │
              ↓                        ↓
       ┌─────────────┐          ┌─────────────┐
       │  REJECTED   │          │  APPROVED   │ → Visible to Client
       └──────┬──────┘          └─────────────┘
              │
           Revise
              │
              ↓
       ┌─────────────┐
       │    DRAFT    │ (cycle repeats)
       └─────────────┘

       Any State → ARCHIVED (soft delete)
```

### State Transitions

| From | To | Action | Who Can Do |
|------|----|---------| ----------|
| DRAFT | SUBMITTED | Submit for Review | Uploader, Admin |
| SUBMITTED | IN_REVIEW | Start Review | Admin, Advokat |
| IN_REVIEW | APPROVED | Approve | Admin, Advokat |
| IN_REVIEW | REJECTED | Reject | Admin, Advokat |
| REJECTED | DRAFT | Revise | Uploader, Admin |
| APPROVED | ARCHIVED | Archive | Admin |
| Any | ARCHIVED | Archive | Admin |
| ARCHIVED | Previous | Restore | Admin |

---

## 🔌 API DESIGN

### New Endpoints

#### 1. Submit Document for Review

```http
POST /dokumen/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Please review this contract"
}
```

**Response:**
```json
{
  "id": "uuid-dokumen",
  "status": {
    "status": "SUBMITTED",
    "submitted_at": "2024-01-15T10:30:00Z",
    "submitted_by": "uuid-user",
    "submission_notes": "Please review this contract"
  }
}
```

#### 2. Start Review

```http
POST /dokumen/:id/review/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-dokumen",
  "status": {
    "status": "IN_REVIEW",
    "reviewed_at": "2024-01-15T10:35:00Z",
    "reviewed_by": "uuid-admin"
  }
}
```

#### 3. Approve Document

```http
POST /dokumen/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Approved. Document is correct."
}
```

**Response:**
```json
{
  "id": "uuid-dokumen",
  "status": {
    "status": "APPROVED",
    "approved_at": "2024-01-15T10:40:00Z",
    "approved_by": "uuid-admin",
    "approval_notes": "Approved. Document is correct."
  }
}
```

#### 4. Reject Document

```http
POST /dokumen/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Please fix the date on page 2"
}
```

**Response:**
```json
{
  "id": "uuid-dokumen",
  "status": {
    "status": "REJECTED",
    "rejected_at": "2024-01-15T10:40:00Z",
    "rejected_by": "uuid-admin",
    "rejection_notes": "Please fix the date on page 2"
  }
}
```

#### 5. Revise Rejected Document

```http
POST /dokumen/:id/revise
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-dokumen",
  "status": {
    "status": "DRAFT",
    "version": 2
  }
}
```

#### 6. Get Pending Review Queue

```http
GET /dokumen/pending-review?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "nama_dokumen": "Contract.pdf",
      "status": {
        "status": "SUBMITTED",
        "submitted_at": "2024-01-15T10:30:00Z",
        "submission_notes": "Please review"
      },
      "uploader": { ... },
      "perkara": { ... }
    }
  ],
  "meta": { "total": 15, "page": 1, ... }
}
```

#### 7. Get Document Audit Log

```http
GET /dokumen/:id/audit-log
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid-audit-1",
    "action": "CREATED",
    "to_status": "DRAFT",
    "performed_by": "John Doe",
    "timestamp": "2024-01-15T10:00:00Z"
  },
  {
    "id": "uuid-audit-2",
    "action": "SUBMITTED",
    "from_status": "DRAFT",
    "to_status": "SUBMITTED",
    "performed_by": "John Doe",
    "notes": "Please review",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid-audit-3",
    "action": "APPROVED",
    "from_status": "IN_REVIEW",
    "to_status": "APPROVED",
    "performed_by": "Admin",
    "notes": "Looks good",
    "timestamp": "2024-01-15T10:40:00Z"
  }
]
```

#### 8. Bulk Approve/Reject

```http
POST /dokumen/bulk-approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "notes": "Batch approved"
}
```

**Response:**
```json
{
  "successCount": 3,
  "failCount": 0,
  "results": [
    { "id": "uuid-1", "status": "APPROVED" },
    { "id": "uuid-2", "status": "APPROVED" },
    { "id": "uuid-3", "status": "APPROVED" }
  ]
}
```

### Modified Endpoints

#### GET /dokumen

**Add query param:**
- `status` - Filter by workflow status

**Response includes status:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "nama_dokumen": "Contract.pdf",
      "status": {
        "status": "APPROVED",
        "approved_at": "2024-01-15T10:40:00Z"
      },
      ...
    }
  ]
}
```

---

## 🎨 FRONTEND COMPONENTS

### 1. Document Status Badge

```tsx
<StatusBadge status={dokumen.status} />
```

**Visual:**
```
DRAFT     → 🟡 Draft
SUBMITTED → 🔵 Submitted
IN_REVIEW → 🟣 In Review
APPROVED  → 🟢 Approved
REJECTED  → 🔴 Rejected
ARCHIVED  → ⚫ Archived
```

### 2. Workflow Actions Component

```tsx
<WorkflowActions dokumen={dokumen} onStatusChange={handleStatusChange} />
```

**For DRAFT:**
```
┌─────────────────────────────────┐
│ [Submit for Review]             │
└─────────────────────────────────┘
```

**For SUBMITTED/IN_REVIEW (Admin):**
```
┌─────────────────────────────────┐
│ [Approve]  [Reject]             │
└─────────────────────────────────┘
```

**For REJECTED (Staff):**
```
┌─────────────────────────────────┐
│ ⚠️ Rejected: Fix date on page 2 │
│ [Revise & Resubmit]             │
└─────────────────────────────────┘
```

### 3. Review Queue Page

**Path:** `/dashboard/dokumen/review-queue`

```tsx
<ReviewQueuePage>
  <Tabs>
    <Tab label="Pending" count={15} />
    <Tab label="In Review" count={3} />
    <Tab label="History" />
  </Tabs>

  <ReviewQueueTable>
    {/* Sortable by date, uploader, perkara */}
    {/* Bulk select for batch approve */}
    {/* Quick action buttons */}
  </ReviewQueueTable>
</ReviewQueuePage>
```

### 4. Audit Log Timeline

```tsx
<AuditLogTimeline dokumenId={id} />
```

**Visual:**
```
🟢 Approved by Admin
   Jan 15, 2024 10:40 AM
   "Looks good"

🟣 Review started by Admin
   Jan 15, 2024 10:35 AM

🔵 Submitted by John Doe
   Jan 15, 2024 10:30 AM
   "Please review this contract"

🟡 Created by John Doe
   Jan 15, 2024 10:00 AM
```

### 5. Rejection Modal

```tsx
<RejectDocumentModal
  dokumenId={id}
  onReject={(notes) => handleReject(id, notes)}
/>
```

**UI:**
```
┌──────────────────────────────────────┐
│ Reject Document                      │
├──────────────────────────────────────┤
│ Please provide a reason for          │
│ rejection:                           │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [Text area for notes]            │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│      [Cancel]  [Reject Document]    │
└──────────────────────────────────────┘
```

### 6. Submission Modal

```tsx
<SubmitDocumentModal
  dokumenId={id}
  onSubmit={(notes) => handleSubmit(id, notes)}
/>
```

---

## 🔐 PERMISSION MATRIX

### View Documents by Status

| Role | DRAFT | SUBMITTED | IN_REVIEW | APPROVED | REJECTED | ARCHIVED |
|------|-------|-----------|-----------|----------|----------|----------|
| **Client** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Staff** | ✅ Own | ✅ Own | ✅ Own | ✅ All | ✅ Own | ❌ |
| **Advokat** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ |
| **Admin** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ |
| **Super Admin** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ |

### Actions by Role

| Action | Client | Staff | Advokat | Admin | Super Admin |
|--------|--------|-------|---------|-------|-------------|
| Upload (→ DRAFT) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit | ❌ | ✅ Own | ✅ Own | ✅ All | ✅ All |
| Start Review | ❌ | ❌ | ✅ | ✅ | ✅ |
| Approve | ❌ | ❌ | ✅ | ✅ | ✅ |
| Reject | ❌ | ❌ | ✅ | ✅ | ✅ |
| Revise | ❌ | ✅ Own | ✅ Own | ✅ All | ✅ All |
| Archive | ❌ | ❌ | ❌ | ✅ | ✅ |
| Restore | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Audit Log | ❌ | ✅ Own | ✅ All | ✅ All | ✅ All |
| Bulk Approve | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 📅 IMPLEMENTATION PLAN

### Phase 1: Database & Backend (Week 1)

**Tasks:**
1. ✅ Create Prisma schema for dokumen_status
2. ✅ Create Prisma schema for dokumen_audit_log
3. ✅ Run migration
4. ✅ Migrate existing documents to APPROVED status
5. ✅ Create WorkflowService
6. ✅ Create AuditLogService
7. ✅ Implement state transition logic
8. ✅ Add workflow endpoints to DokumenController
9. ✅ Add RBAC guards for new endpoints
10. ✅ Write unit tests

**Deliverables:**
- Working API endpoints for workflow
- Audit log tracking
- RBAC enforcement

---

### Phase 2: Frontend Components (Week 2)

**Tasks:**
1. ✅ Create StatusBadge component
2. ✅ Create WorkflowActions component
3. ✅ Create RejectDocumentModal
4. ✅ Create SubmitDocumentModal
5. ✅ Create AuditLogTimeline component
6. ✅ Update DokumenTable to show status
7. ✅ Add workflow actions to document detail page
8. ✅ Create ReviewQueuePage
9. ✅ Update dokumen.api.ts with new endpoints
10. ✅ Write component tests

**Deliverables:**
- All UI components
- Review queue page
- Updated document list & detail pages

---

### Phase 3: Integration & Polish (Week 3)

**Tasks:**
1. ✅ Add status filter to document list
2. ✅ Implement bulk approve/reject
3. ✅ Add notifications for status changes
4. ✅ Add email notifications (optional)
5. ✅ Update documentation
6. ✅ Integration testing
7. ✅ E2E testing
8. ✅ Performance testing
9. ✅ Bug fixes
10. ✅ Deploy to staging

**Deliverables:**
- Fully integrated workflow system
- All tests passing
- Production-ready code

---

## 🧪 TESTING STRATEGY

### Unit Tests

**Backend:**
```typescript
describe('WorkflowService', () => {
  it('should submit document for review', async () => {
    const result = await workflowService.submitForReview(dokumenId, userId, notes);
    expect(result.status).toBe('SUBMITTED');
  });

  it('should reject invalid state transition', async () => {
    // APPROVED → SUBMITTED should fail
    await expect(
      workflowService.submitForReview(approvedDokumenId, userId)
    ).rejects.toThrow('Invalid state transition');
  });

  it('should create audit log on approval', async () => {
    await workflowService.approve(dokumenId, adminId, notes);
    const logs = await auditLogService.getLogsForDokumen(dokumenId);
    expect(logs[0].action).toBe('APPROVED');
  });
});
```

**Frontend:**
```typescript
describe('WorkflowActions', () => {
  it('should show submit button for DRAFT status', () => {
    render(<WorkflowActions dokumen={draftDokumen} />);
    expect(screen.getByText('Submit for Review')).toBeInTheDocument();
  });

  it('should show approve/reject for admin on SUBMITTED', () => {
    render(<WorkflowActions dokumen={submittedDokumen} user={adminUser} />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('Document Workflow Integration', () => {
  it('should complete full workflow: draft → submit → review → approve', async () => {
    // 1. Upload (creates DRAFT)
    const doc = await uploadDocument(file, data);
    expect(doc.status.status).toBe('DRAFT');

    // 2. Submit
    await submitDocument(doc.id);
    const submitted = await getDocument(doc.id);
    expect(submitted.status.status).toBe('SUBMITTED');

    // 3. Review
    await startReview(doc.id);
    const reviewing = await getDocument(doc.id);
    expect(reviewing.status.status).toBe('IN_REVIEW');

    // 4. Approve
    await approveDocument(doc.id);
    const approved = await getDocument(doc.id);
    expect(approved.status.status).toBe('APPROVED');

    // 5. Check audit log
    const logs = await getAuditLog(doc.id);
    expect(logs).toHaveLength(4); // CREATED, SUBMITTED, REVIEWED, APPROVED
  });
});
```

### E2E Tests (Playwright)

```typescript
test('Staff can submit and admin can approve document', async ({ page }) => {
  // 1. Login as staff
  await loginAs(page, 'staff@example.com');

  // 2. Upload document
  await page.goto('/dashboard/dokumen/upload');
  await uploadDocument(page, 'test.pdf');

  // 3. Verify DRAFT status
  await expect(page.locator('.status-badge')).toHaveText('Draft');

  // 4. Submit for review
  await page.click('button:has-text("Submit for Review")');
  await page.fill('textarea[name="notes"]', 'Please review');
  await page.click('button:has-text("Submit")');
  await expect(page.locator('.status-badge')).toHaveText('Submitted');

  // 5. Logout and login as admin
  await logout(page);
  await loginAs(page, 'admin@example.com');

  // 6. Go to review queue
  await page.goto('/dashboard/dokumen/review-queue');
  await expect(page.locator('table tbody tr')).toHaveCount(1);

  // 7. Approve document
  await page.click('button:has-text("Approve")');
  await page.fill('textarea[name="notes"]', 'Looks good');
  await page.click('button:has-text("Approve Document")');

  // 8. Verify APPROVED status
  await expect(page.locator('.status-badge')).toHaveText('Approved');

  // 9. Login as client and verify visibility
  await logout(page);
  await loginAs(page, 'client@example.com');
  await page.goto('/dashboard/dokumen');
  await expect(page.locator('table tbody tr')).toHaveCount(1);
});
```

---

## 📊 METRICS & MONITORING

### KPIs to Track

1. **Workflow Efficiency:**
   - Average time from SUBMITTED → APPROVED
   - Rejection rate (% of documents rejected)
   - Revision rate (% requiring multiple rounds)

2. **Queue Health:**
   - Number of documents in review queue
   - Oldest pending document age
   - Reviewer workload distribution

3. **User Behavior:**
   - Documents uploaded per day by status
   - Most common rejection reasons
   - Busiest review times

### Monitoring Dashboard

```
┌─────────────────────────────────────────┐
│ Workflow Metrics                        │
├─────────────────────────────────────────┤
│ Pending Review: 15 📋                   │
│ In Review: 3 🔍                         │
│ Avg Approval Time: 2.5 hours ⏱️        │
│ Rejection Rate: 12% 📊                  │
│                                         │
│ Reviewer Performance:                   │
│  Admin 1: 45 approved, 3 pending        │
│  Admin 2: 32 approved, 12 pending       │
└─────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Run all tests (unit, integration, E2E)
- [ ] Database migration tested on staging
- [ ] Rollback plan prepared
- [ ] Documentation updated
- [ ] User training materials prepared
- [ ] Stakeholder sign-off

### Deployment

- [ ] Deploy to staging
- [ ] Smoke tests on staging
- [ ] Performance tests on staging
- [ ] Security audit
- [ ] Deploy to production (off-peak hours)
- [ ] Monitor error logs
- [ ] Verify key workflows

### Post-Deployment

- [ ] Monitor metrics dashboard
- [ ] Check user feedback
- [ ] Fix any critical bugs
- [ ] Document lessons learned
- [ ] Plan next iteration

---

## 📝 NOTES

### Design Decisions

**Why separate `dokumen_status` table?**
- Keeps `dokumen_hukum` table clean
- Easier to query by status
- Can add more workflow metadata without cluttering main table

**Why audit log table?**
- Compliance requirement (who changed what when)
- Debugging workflow issues
- Analytics on approval patterns

**Why DRAFT as default instead of SUBMITTED?**
- Gives uploader chance to review before submitting
- Reduces noise in review queue
- Allows bulk upload then batch submit

### Future Enhancements

1. **Version Control:**
   - Track document versions
   - Compare versions
   - Restore previous version

2. **Automated Rules:**
   - Auto-approve for certain categories
   - Auto-assign reviewers based on perkara
   - SLA enforcement (auto-escalate if not reviewed in 24h)

3. **Advanced Notifications:**
   - Email on status change
   - Slack integration
   - Mobile push notifications

4. **Analytics:**
   - Approval rate by category
   - Reviewer performance metrics
   - Bottleneck identification

---

**Roadmap Version:** 1.0
**Created:** 2025
**Status:** 📋 Ready for Implementation
**Priority:** 🔥 HIGH
