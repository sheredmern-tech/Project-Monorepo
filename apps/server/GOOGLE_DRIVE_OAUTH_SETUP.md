# 🔐 Google Drive OAuth Setup - Admin Authorization Guide

## 📖 Overview

This guide will help you set up **OAuth Backend-Only** integration with Google Drive.

**How it works:**
1. **You (admin/developer)** authorize Google Drive **ONCE**
2. OAuth refresh token is stored in backend `.env` file
3. **All users** upload documents → stored in **YOUR Google Drive** (15GB free)
4. **Users login with email/password** (NOT Google OAuth)
5. **Centralized storage** - all files in one admin Google Drive account

**Benefits:**
- ✅ Free 15GB Google Drive storage
- ✅ No per-user Google account required
- ✅ Simple setup - one-time admin authorization
- ✅ Built-in Google Drive viewer for document preview
- ✅ Automatic link generation and file management

---

## 🎯 Prerequisites

Before starting, ensure you have:

- [ ] **Google Account** with free Google Drive (15GB)
- [ ] **Google Cloud Project** created
- [ ] **Server running** on `http://localhost:3000` (or your domain)

---

## 📋 Step-by-Step Setup

### **Step 1: Create OAuth 2.0 Credentials in Google Cloud Console**

#### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com

Login with your Google account.

#### 1.2 Select or Create Project

If you don't have a project:
1. Click **"Select a project"** → **"New Project"**
2. Project name: `firma-hukum-perari` (or any name)
3. Click **"Create"**

#### 1.3 Enable Google Drive API

1. Go to **APIs & Services** → **Library**
2. Search: **"Google Drive API"**
3. Click on **"Google Drive API"**
4. Click **"ENABLE"**
5. Wait 1-2 minutes for activation

Direct link:
```
https://console.cloud.google.com/apis/library/drive.googleapis.com?project=YOUR_PROJECT_ID
```

#### 1.4 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** (for personal Gmail accounts)
3. Click **"Create"**

Fill in the form:
- **App name**: `Firma Hukum PERARI`
- **User support email**: Your email
- **Developer contact email**: Your email
- Click **"Save and Continue"**

4. **Scopes**: Click **"Add or Remove Scopes"**
   - Search: `drive`
   - Check: `https://www.googleapis.com/auth/drive`
   - Check: `https://www.googleapis.com/auth/drive.file`
   - Click **"Update"**
   - Click **"Save and Continue"**

5. **Test users**: Click **"Add Users"**
   - Add your Google email address
   - Click **"Add"**
   - Click **"Save and Continue"**

6. Review and click **"Back to Dashboard"**

#### 1.5 Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Application type: **"Web application"**
4. Name: `Firma Hukum OAuth Client`

5. **Authorized redirect URIs**: Click **"+ ADD URI"**

   For development:
   ```
   http://localhost:3000/api/v1/google-drive/oauth/callback
   ```

   For production (replace with your domain):
   ```
   https://your-api-domain.com/api/v1/google-drive/oauth/callback
   ```

6. Click **"Create"**

7. **IMPORTANT**: Copy the credentials displayed:
   - **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`

---

### **Step 2: Configure Environment Variables**

Open `apps/server/.env` and add:

```bash
# ============================================================================
# GOOGLE DRIVE OAUTH (REQUIRED FOR DOCUMENT STORAGE)
# ============================================================================

GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/v1/google-drive/oauth/callback

# Leave this empty for now - will be filled in Step 3
GOOGLE_OAUTH_REFRESH_TOKEN=
```

**Replace** `123456789-abcdefg.apps.googleusercontent.com` and `GOCSPX-...` with your actual credentials from Step 1.5.

---

### **Step 3: Start Server**

Restart your server to load the new environment variables:

```bash
# Stop server if running (Ctrl+C)

# Start server
npm run start:dev

# Expected log:
# ⚠️  OAuth configured but no refresh token found
# 👉 Visit: http://localhost:3000/api/v1/google-drive/oauth/authorize
```

---

### **Step 4: Authorize Google Drive (One-Time Setup)**

#### 4.1 Get Authorization URL

Open your browser or use curl:

**Browser**: Visit
```
http://localhost:3000/api/v1/google-drive/oauth/authorize
```

**Or using curl**:
```bash
curl http://localhost:3000/api/v1/google-drive/oauth/authorize
```

You will see a JSON response with an authorization URL:
```json
{
  "success": true,
  "message": "Please visit this URL to authorize",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...",
  "instructions": [
    "1. Visit the URL above",
    "2. Login with your Google account",
    "3. Grant permissions",
    "4. You will be redirected back with authorization code",
    "5. The refresh token will be displayed - copy it to .env file"
  ]
}
```

#### 4.2 Visit Authorization URL

1. **Copy the `authUrl`** from the response
2. **Paste it in your browser**
3. **Login** with your Google account (the one with 15GB free Drive)
4. **Grant permissions**:
   - Allow access to Google Drive
   - Click **"Continue"**
   - Click **"Allow"**

#### 4.3 Get Refresh Token

After granting permissions, you will be **redirected** to:
```
http://localhost:3000/api/v1/google-drive/oauth/callback?code=...
```

The page will display a **success message** with your **refresh token**.

**Example page content:**
```
✅ Authorization Successful!

📋 Your Refresh Token:
1//0gAbCdEfGhIjKlMnOpQrStUvWxYz-1234567890

🔧 Setup Instructions:
Step 1: Open your apps/server/.env file

Step 2: Add this line (or update if it exists):
GOOGLE_OAUTH_REFRESH_TOKEN=1//0gAbCdEfGhIjKlMnOpQrStUvWxYz-1234567890

Step 3: Restart your server
```

#### 4.4 Copy Refresh Token to .env

1. **Copy the refresh token** from the success page
2. Open `apps/server/.env`
3. **Update** the line:
   ```bash
   GOOGLE_OAUTH_REFRESH_TOKEN=1//0gAbCdEfGhIjKlMnOpQrStUvWxYz-1234567890
   ```
4. **Save** the file

---

### **Step 5: Restart Server**

Restart your server to use the new refresh token:

```bash
# Stop server (Ctrl+C)

# Start server
npm run start:dev

# Expected logs:
# ✅ Google Drive API initialized with OAuth
# 📦 Using admin's Google Drive for centralized storage
# 💾 15GB free quota available
```

---

## ✅ Verification

### Test 1: Check Server Logs

Your server logs should show:
```
✅ Google Drive API initialized with OAuth
📦 Using admin's Google Drive for centralized storage
💾 15GB free quota available
```

If you see these logs, OAuth is configured correctly! ✅

### Test 2: Upload a Document

1. Login to your application
2. Go to **Dashboard** → **Dokumen** → **Upload Baru**
3. Select a perkara
4. Upload a test file (PDF, DOC, etc.)
5. Check if upload succeeds

### Test 3: Verify in Google Drive

1. Go to https://drive.google.com
2. Login with the **same Google account** you authorized
3. You should see uploaded files in:
   - **My Drive** (root folder)
   - Or in a specific folder if `GOOGLE_DRIVE_ROOT_FOLDER_ID` is set

---

## 📁 Optional: Organize Files in a Folder

To keep things organized, you can upload files to a specific folder:

### Create Folder

1. Go to https://drive.google.com
2. Click **"New"** → **"Folder"**
3. Name: `Firma Hukum Documents`
4. Click **"Create"**

### Get Folder ID

1. Open the folder you just created
2. Look at the URL:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                           ^^^^^^^^^^^^^^^^^^^^
                                           This is the Folder ID
   ```
3. Copy the Folder ID (the random string after `/folders/`)

### Add to .env

Open `apps/server/.env` and add:
```bash
GOOGLE_DRIVE_ROOT_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

Restart server and all new uploads will go to this folder!

---

## 🔧 Troubleshooting

### Error: "OAuth not configured"

**Cause**: Missing `GOOGLE_OAUTH_CLIENT_ID` or `GOOGLE_OAUTH_CLIENT_SECRET`

**Solution**:
1. Check `.env` file has both variables
2. Restart server
3. Try again

---

### Error: "No refresh token received"

**Cause**: Not first-time authorization or consent screen skipped

**Solution**:
1. Revoke access at: https://myaccount.google.com/permissions
2. Find "Firma Hukum PERARI"
3. Click **"Remove access"**
4. **Start over** from Step 4.1 (get new auth URL)
5. Make sure to **grant permissions** again

---

### Error: "Failed to upload file to Google Drive"

**Cause**: Various issues

**Solution**:
1. Check server logs for detailed error
2. Verify Google Drive API is enabled (Step 1.3)
3. Verify refresh token is correct in `.env`
4. Try revoking and re-authorizing

---

### Error: "Token expired"

**Cause**: Access token expired (normal behavior)

**Solution**:
- Access tokens expire after 1 hour
- Backend **automatically refreshes** using refresh token
- No action needed!

---

## 🎉 Success!

Once configured, your system will:

1. ✅ Store all documents in **YOUR Google Drive** (15GB free)
2. ✅ Users upload via app → no Google login needed
3. ✅ Automatic file management and link generation
4. ✅ Built-in Google Drive preview for documents
5. ✅ Centralized storage - easy to manage

**All users** can now upload documents without connecting their own Google accounts!

---

## 🔐 Security Notes

**Keep these secrets safe:**
- `GOOGLE_OAUTH_CLIENT_SECRET` - Never commit to Git
- `GOOGLE_OAUTH_REFRESH_TOKEN` - Allows access to your Google Drive

**Recommendations:**
1. ✅ Add `.env` to `.gitignore` (already done)
2. ✅ Use environment variables in production (Railway, Vercel, etc.)
3. ✅ Never share refresh token publicly
4. ✅ Revoke access if token is compromised: https://myaccount.google.com/permissions

---

## 📊 Storage Quota

**With OAuth Backend-Only:**
- ✅ Uses YOUR personal Google Drive
- ✅ 15GB free quota (Google One)
- ✅ Can upgrade: 100GB for $1.99/month
- ✅ All users share this quota

**Monitor usage**:
1. Go to https://drive.google.com/settings/storage
2. Check storage used

---

## 🆘 Still Having Issues?

Check server logs:
```bash
# Development
npm run start:dev

# Production
docker compose logs api --tail=100
```

Or reach out with:
- Error message from server logs
- Screenshot of OAuth consent screen
- `.env` configuration (REDACT secrets!)

---

**🚀 That's it! Your Google Drive OAuth is now configured!**

Users can start uploading documents immediately! 📄✨
