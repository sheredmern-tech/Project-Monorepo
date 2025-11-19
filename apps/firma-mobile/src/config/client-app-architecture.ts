/**
 * 🎯 FIRMA MOBILE - CLIENT APP ARCHITECTURE
 *
 * Purpose: Mobile app KHUSUS untuk KLIEN (Client-only)
 * NOT for admin/advokat/paralegal (they use web dashboard)
 */

// ============================================================================
// CLIENT-ONLY FEATURES
// ============================================================================

export const CLIENT_FEATURES = {
  // ✅ Can do WITHOUT login (Browse mode)
  publicFeatures: [
    'View app introduction',
    'See services offered',
    'Contact firma',
    'View FAQ',
    'Check requirements',
  ],

  // 🔐 Requires login (My account)
  authFeatures: [
    'View my cases',
    'Upload documents',
    'Track case progress',
    'Get notifications',
    'Chat with firma',
    'View case history',
  ],
};

// ============================================================================
// APP FLOW DESIGN
// ============================================================================

/**
 * CORRECT FLOW (Client-focused):
 *
 * 1. App Launch
 *    ↓
 * 2. Home Screen (No login required)
 *    - Browse services
 *    - See what firma offers
 *    - Contact info
 *    ↓
 * 3. User wants to:
 *    - Submit new case → Show login/register
 *    - View my cases → Show login
 *    - Upload document → Show login
 *    ↓
 * 4. After login → Access to My Cases
 */

// ============================================================================
// NAVIGATION STRUCTURE (Client-only)
// ============================================================================

export const CLIENT_APP_STRUCTURE = {
  // Public Stack (No auth needed)
  publicStack: {
    screens: [
      'Welcome',       // Intro to firma services
      'Services',      // Available legal services
      'Requirements',  // What documents needed
      'Contact',       // Contact firma
    ],
  },

  // Protected Stack (Auth required)
  protectedStack: {
    screens: [
      'MyCases',       // Client's cases
      'CaseDetail',    // Case detail & timeline
      'UploadDoc',     // Upload documents
      'Notifications', // Inbox/notifications
      'Profile',       // Client profile
    ],
  },

  // Auth Stack
  authStack: {
    screens: [
      'Login',
      'Register',
      'ForgotPassword',
    ],
  },
};

// ============================================================================
// CLIENT PERMISSIONS (What client CAN'T do)
// ============================================================================

export const CLIENT_RESTRICTIONS = [
  // ❌ Cannot manage other users
  'create_users',
  'edit_users',
  'delete_users',

  // ❌ Cannot access admin features
  'view_all_cases',      // Only their own cases
  'manage_team',
  'assign_lawyers',
  'view_reports',

  // ❌ Cannot edit case status
  'change_case_status',
  'approve_documents',
  'manage_phases',

  // ✅ Can only:
  // - View their own cases
  // - Upload documents for their cases
  // - Track progress
  // - Communicate with firma
];

// ============================================================================
// API ENDPOINTS (Client-specific)
// ============================================================================

export const CLIENT_API_ENDPOINTS = {
  // Auth (public)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Client profile (protected)
  MY_PROFILE: '/klien/profile',          // GET own profile
  UPDATE_PROFILE: '/klien/profile',      // PATCH own profile

  // Client's cases (protected)
  MY_CASES: '/klien/my-cases',           // GET own cases only
  CASE_DETAIL: '/klien/cases/:id',       // GET own case detail

  // Documents (protected)
  UPLOAD_DOCUMENT: '/dokumen',           // POST upload doc
  MY_DOCUMENTS: '/dokumen/my-documents', // GET own docs

  // Communication (protected)
  MY_NOTIFICATIONS: '/notifications/me', // GET own notifications
  SEND_MESSAGE: '/messages',             // POST message to firma
};

// ============================================================================
// OFFLINE-FIRST STRATEGY (Client app)
// ============================================================================

export const OFFLINE_STRATEGY = {
  // What's cached for offline use
  cachedData: [
    'my_cases',          // Client's cases list
    'case_details',      // Details of each case
    'uploaded_docs',     // Documents already uploaded
    'requirements',      // What docs are needed
  ],

  // What requires online
  requiresOnline: [
    'login',             // Must be online to login
    'register',          // Must be online to register
    'upload_new_doc',    // Must be online to upload
    'submit_new_case',   // Must be online to submit
  ],

  // Queue for offline actions
  offlineQueue: [
    'document_uploads',  // Queue uploads for later
    'profile_updates',   // Queue profile edits
    'messages',          // Queue messages to firma
  ],
};

// ============================================================================
// UI/UX FLOW (Client-first approach)
// ============================================================================

export const UX_PRINCIPLES = {
  // 1. Browse First (No login wall)
  browseFirst: {
    allow: [
      'See services offered',
      'Understand process',
      'Check requirements',
      'Contact info',
    ],
    principle: 'Let user explore before committing to login',
  },

  // 2. Contextual Login
  contextualLogin: {
    triggers: [
      'User clicks "My Cases"',
      'User wants to upload document',
      'User wants to submit new case',
    ],
    message: 'Login to access your cases and upload documents',
  },

  // 3. Clear Value Proposition
  valueFirst: {
    show: [
      'What firma can do for you',
      'How the process works',
      'What documents you need',
    ],
    then: 'Encourage to create account',
  },

  // 4. Progressive Disclosure
  progressive: {
    step1: 'Browse services (no account)',
    step2: 'Register/Login (when interested)',
    step3: 'Submit case (when ready)',
    step4: 'Track progress (ongoing)',
  },
};

// ============================================================================
// ERROR HANDLING (Client-friendly messages)
// ============================================================================

export const CLIENT_ERROR_MESSAGES = {
  // Network errors
  offline: 'No internet connection. You can still view your cached cases.',
  timeout: 'Request timed out. Please check your connection.',

  // Auth errors
  notLoggedIn: 'Please login to access your cases',
  sessionExpired: 'Your session has expired. Please login again.',
  invalidCredentials: 'Invalid email or password',

  // Upload errors
  uploadFailed: 'Failed to upload document. It will be retried when you\'re online.',
  fileTooBig: 'File is too large. Maximum size is 10MB.',

  // Generic
  somethingWrong: 'Something went wrong. Please try again later.',
};

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * CLIENT-ONLY APP PRINCIPLES:
 *
 * ✅ DO:
 * - Show value before asking for login
 * - Allow browsing without account
 * - Make login contextual (when needed)
 * - Cache data for offline use
 * - Show clear progress tracking
 * - Simple, focused features
 *
 * ❌ DON'T:
 * - Force login on app start
 * - Show admin/lawyer features
 * - Use role-based permissions
 * - Assume always online
 * - Overwhelm with features
 * - Use technical jargon
 *
 * 🎯 FOCUS:
 * - Client can view THEIR cases
 * - Client can upload THEIR documents
 * - Client can track THEIR progress
 * - Client can communicate with firma
 *
 * That's it. Keep it simple!
 */

export default {
  CLIENT_FEATURES,
  CLIENT_APP_STRUCTURE,
  CLIENT_RESTRICTIONS,
  CLIENT_API_ENDPOINTS,
  OFFLINE_STRATEGY,
  UX_PRINCIPLES,
  CLIENT_ERROR_MESSAGES,
};
