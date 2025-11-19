# 🎯 FIRMA MOBILE - CLIENT APP ARCHITECTURE

**Purpose:** Mobile app KHUSUS untuk KLIEN (bukan admin/advokat)
**Philosophy:** Browse first, login when needed, offline-first

---

## 🚨 MISMATCH YANG DIPERBAIKI

### ❌ SEBELUM (Wrong Approach)
```
App Launch → Login Screen (forced)
           ↓
       Dashboard (role-based)
           ↓
    Admin/Lawyer features visible
```

**Problems:**
- Login wall immediately
- Shows admin/lawyer features
- Role-based permissions (unnecessary)
- Can't browse without account

### ✅ SEKARANG (Client-Only Approach)
```
App Launch → Home (Browse mode, no login)
           ↓
    User explores services
           ↓
    Wants to view cases/upload → Login prompt
           ↓
    After login → My Cases only
```

**Benefits:**
- Browse without login ✅
- Client-focused features only ✅
- Contextual login ✅
- Offline-first ✅

---

## 🎯 CLIENT-ONLY FEATURES

### ✅ Public (No Login Required)
- View app introduction
- See services offered
- Check document requirements
- Contact firma
- View FAQ

### 🔐 Protected (Login Required)
- View **MY** cases (not all cases)
- Upload **MY** documents
- Track **MY** case progress
- Get **MY** notifications
- Chat with firma about **MY** case

### ❌ NOT Available (Admin Features)
- View all cases
- Manage team
- Assign lawyers
- Approve documents
- Change case status
- View reports

---

## 🏗️ APP STRUCTURE

### Navigation Flow

```
┌─────────────────────────────────────┐
│         PUBLIC STACK                │
│  (No authentication required)       │
├─────────────────────────────────────┤
│  • Welcome Screen                   │
│  • Services List                    │
│  • Requirements Guide               │
│  • Contact Firma                    │
└─────────────────────────────────────┘
              ↓
      [User wants to login]
              ↓
┌─────────────────────────────────────┐
│          AUTH STACK                 │
├─────────────────────────────────────┤
│  • Login Screen                     │
│  • Register Screen                  │
│  • Forgot Password                  │
└─────────────────────────────────────┘
              ↓
       [After login]
              ↓
┌─────────────────────────────────────┐
│       PROTECTED STACK               │
│   (Authenticated users only)        │
├─────────────────────────────────────┤
│  • My Cases (client's cases only)   │
│  • Case Detail                      │
│  • Upload Documents                 │
│  • Notifications/Inbox              │
│  • My Profile                       │
└─────────────────────────────────────┘
```

---

## 🔧 API ENDPOINTS (Client-Specific)

### Base URL
```typescript
const API_URL = 'http://YOUR_IP:3000/api/v1'; // ← api/v1 not api!
```

### Client Endpoints

#### Authentication (Public)
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/forgot-password
```

#### Client Profile (Protected)
```
GET    /api/v1/klien/profile       // Get my profile
PATCH  /api/v1/klien/profile       // Update my profile
```

#### My Cases (Protected)
```
GET    /api/v1/klien/my-cases      // Get MY cases only
GET    /api/v1/klien/cases/:id     // Get MY case detail
```

#### Documents (Protected)
```
POST   /api/v1/dokumen             // Upload document
GET    /api/v1/dokumen/my-documents // Get MY documents
DELETE /api/v1/dokumen/:id         // Delete MY document
```

#### Notifications (Protected)
```
GET    /api/v1/notifications/me    // Get MY notifications
```

---

## 📱 UX/UI PRINCIPLES

### 1. **Browse First**
Don't force login immediately. Let user:
- See what services firma offers
- Understand the process
- Check requirements
- Explore features

**Then** encourage to create account.

### 2. **Contextual Login**
Show login prompt **only when needed**:

```typescript
// User clicks "My Cases"
if (!isLoggedIn) {
  Alert.alert(
    'Login Required',
    'Please login to view your cases',
    [
      { text: 'Cancel' },
      { text: 'Login', onPress: () => navigate('Login') }
    ]
  );
}
```

### 3. **Value First**
Show value before asking for commitment:
1. Here's what we can do for you
2. Here's how it works
3. Here's what you need
4. Ready? Create an account!

### 4. **Progressive Disclosure**
```
Step 1: Browse (no account needed)
Step 2: Register (when interested)
Step 3: Submit case (when ready)
Step 4: Track progress (ongoing)
```

---

## 💾 OFFLINE-FIRST STRATEGY

### Cached for Offline Use
```typescript
{
  myCases: [],           // Client's cases
  caseDetails: {},       // Case details
  uploadedDocs: [],      // Documents uploaded
  requirements: [],      // What docs are needed
}
```

### Requires Online
```typescript
{
  login: true,           // Must be online
  register: true,        // Must be online
  uploadNewDoc: true,    // Must be online
  submitNewCase: true,   // Must be online
}
```

### Offline Queue
When offline, queue these actions:
```typescript
{
  documentUploads: [],   // Retry when online
  profileUpdates: [],    // Retry when online
  messages: [],          // Retry when online
}
```

---

## 🎨 UI SCREENS (Client-Only)

### Home Screen (No Login)
```
┌────────────────────────────────┐
│  FIRMA                      👤 │
│  Legal Services             Login
├────────────────────────────────┤
│                                │
│  🏢 Our Services               │
│    • Land Certification        │
│    • Business Setup            │
│    • Legal Consultation        │
│                                │
│  📋 How It Works               │
│    1. Submit your request      │
│    2. Upload documents         │
│    3. Track progress           │
│    4. Get your results         │
│                                │
│  📞 Contact Us                 │
│                                │
└────────────────────────────────┘
```

### My Cases Screen (After Login)
```
┌────────────────────────────────┐
│  My Cases               🔔    ⚙️
├────────────────────────────────┤
│                                │
│  🏡 Land Certification         │
│  Case #LC-2024-001            │
│  Phase 2 of 3 ●●○             │
│  Updated 2 days ago           │
│                                │
│  ⚖️ Legal Consultation         │
│  Case #LC-2024-042            │
│  Phase 3 of 3 ●●●             │
│  Completed ✓                  │
│                                │
└────────────────────────────────┘
```

---

## ✅ CHECKLIST: CLIENT-ONLY COMPLIANCE

### Architecture
- [ ] Remove role-based checks (no admin/lawyer checks)
- [ ] Remove multi-role navigation
- [ ] Simplify to client features only
- [ ] Fix API endpoints (`/api/v1` not `/api`)

### UX Flow
- [ ] Home screen accessible without login
- [ ] Login prompt only when needed
- [ ] Clear "what you can do" messaging
- [ ] Easy contact/help access

### Features
- [ ] View **MY** cases (not all cases)
- [ ] Upload docs to **MY** cases only
- [ ] Track **MY** progress
- [ ] **MY** notifications only

### Offline
- [ ] Cache my cases
- [ ] Queue uploads
- [ ] Show offline indicator
- [ ] Sync when back online

### API
- [ ] Use `/api/v1` prefix
- [ ] Use client-specific endpoints
- [ ] Handle 401 gracefully
- [ ] No admin endpoints

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Fix Endpoints (DONE)
```typescript
// FIXED:
export const API_URL = 'http://IP:3000/api/v1'; // ✅ api/v1
```

### Phase 2: Redesign Navigation
1. Create `WelcomeScreen` (no login)
2. Make `LoginScreen` modal (contextual)
3. Simplify bottom tabs (client-only)
4. Remove admin features

### Phase 3: Update Screens
1. **Home:** Browse mode (no login)
2. **My Cases:** Show after login
3. **Upload:** Require login first
4. **Profile:** Client profile only

### Phase 4: Test Flow
1. Launch app → See welcome (no login)
2. Browse services → OK
3. Click "My Cases" → Prompt login
4. Login → See my cases
5. Go offline → Still works (cached)

---

## 📚 REFERENCE

### Client Can Do
✅ View their own cases
✅ Upload documents
✅ Track progress
✅ Get notifications
✅ Contact firma

### Client Cannot Do
❌ View other clients' cases
❌ Manage users
❌ Assign lawyers
❌ Approve documents
❌ Change case status
❌ Access admin panel

---

## 💡 TIPS

### Good Client UX
```typescript
// ✅ DO THIS
if (!isLoggedIn && wantsToViewCases) {
  showLoginPrompt('Login to view your cases');
}

// ❌ DON'T DO THIS
if (!isLoggedIn) {
  forceLoginImmediately(); // Bad UX!
}
```

### Client-Friendly Messages
```typescript
// ✅ DO THIS
"Login to view your cases and track progress"

// ❌ DON'T DO THIS
"Unauthorized. Access denied. Error 401"
```

### Offline Handling
```typescript
// ✅ DO THIS
"You're offline. Viewing cached cases. Upload will sync when online."

// ❌ DON'T DO THIS
"Network error. Please try again."
```

---

## 🎯 SUCCESS CRITERIA

App is **client-ready** when:
- [ ] Can browse without login
- [ ] Login is contextual (not forced)
- [ ] Shows only client features
- [ ] Uses correct API endpoints (`/api/v1`)
- [ ] Works offline (cached data)
- [ ] No admin/role references
- [ ] Clear, client-friendly UI

---

**Remember:** Firma-mobile = CLIENT APP
**Not:** Admin panel, lawyer dashboard, or multi-role system

Keep it **simple**, **focused**, and **client-first**! 🚀
