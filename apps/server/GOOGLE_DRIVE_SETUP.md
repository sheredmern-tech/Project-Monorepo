# 🚀 Google Drive API Setup Guide

Complete guide untuk setup Google Drive API integration untuk document storage.

## 📋 Table of Contents

1. [Why Google Drive?](#why-google-drive)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Google Cloud Project](#step-1-create-google-cloud-project)
4. [Step 2: Enable Google Drive API](#step-2-enable-google-drive-api)
5. [Step 3: Create Service Account](#step-3-create-service-account)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Run Database Migration](#step-5-run-database-migration)
8. [Step 6: Test the Integration](#step-6-test-the-integration)
9. [Troubleshooting](#troubleshooting)

---

## Why Google Drive?

### ✅ **Advantages**

| Feature | Local Storage | Google Drive API |
|---------|--------------|------------------|
| **Cost** | Server storage cost | **15GB FREE** |
| **Scalability** | Limited by disk | Unlimited (paid plans) |
| **Preview** | Manual implementation | **Built-in viewer** |
| **CDN** | Need setup | **Global CDN** |
| **Backup** | Manual backup | **Auto backup** |
| **Bandwidth** | Server bandwidth | Google bandwidth |
| **Management** | Code only | **Google Drive UI** |

### 💰 **Pricing**

- **FREE Tier**: 15 GB
- **Google Workspace Business Starter**: $6/user/month (30GB)
- **Google Workspace Business Standard**: $12/user/month (2TB)
- **Google Workspace Business Plus**: $18/user/month (5TB)

---

## Prerequisites

- Google Account (Gmail)
- Google Cloud Console access
- Project admin privileges

---

## Step 1: Create Google Cloud Project

### 1.1 Open Google Cloud Console

Go to: [https://console.cloud.google.com](https://console.cloud.google.com)

### 1.2 Create New Project

1. Click **"Select a project"** dropdown (top left)
2. Click **"NEW PROJECT"**
3. Fill in:
   - **Project name**: `firma-hukum-perari` (or your preferred name)
   - **Organization**: Select your organization (optional)
4. Click **"CREATE"**

### 1.3 Select the Project

After creation, make sure the new project is selected in the dropdown.

---

## Step 2: Enable Google Drive API

### 2.1 Navigate to APIs & Services

1. Click **☰ Menu** (hamburger icon, top left)
2. Navigate to: **APIs & Services** → **Library**

### 2.2 Enable Google Drive API

1. Search for: **"Google Drive API"**
2. Click on **"Google Drive API"** from results
3. Click **"ENABLE"** button
4. Wait for activation (usually instant)

---

## Step 3: Create Service Account

### 3.1 Navigate to Service Accounts

1. Click **☰ Menu** → **IAM & Admin** → **Service Accounts**
2. Click **"+ CREATE SERVICE ACCOUNT"**

### 3.2 Create Service Account

**Step 1: Service account details**
- **Service account name**: `firma-hukum-storage`
- **Service account ID**: `firma-hukum-storage` (auto-generated)
- **Description**: `Service account for document storage in Google Drive`
- Click **"CREATE AND CONTINUE"**

**Step 2: Grant access (Optional)**
- Skip this step (not required for Drive API)
- Click **"CONTINUE"**

**Step 3: Grant users access (Optional)**
- Skip this step
- Click **"DONE"**

### 3.3 Create Service Account Key

1. Click on the newly created service account email
2. Go to **"KEYS"** tab
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"CREATE"**

**✅ Download will start automatically!**

**⚠️ IMPORTANT:**
- Save this JSON file securely
- **NEVER commit** this file to Git
- Store in password manager if needed

The downloaded file looks like:
```json
{
  "type": "service_account",
  "project_id": "firma-hukum-perari-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firma-hukum-storage@firma-hukum-perari-123456.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Step 4: Configure Environment Variables

### 4.1 Convert JSON to Single Line

The credentials JSON must be **single line** for `.env` file.

**Option A: Manual (Simple)**
1. Open the downloaded JSON file
2. Copy entire content
3. Remove all newlines (make it single line)
4. Wrap in single quotes

**Option B: Using Command Line**
```bash
# Linux/Mac
cat /path/to/downloaded-credentials.json | tr -d '\n'

# Or use jq (if installed)
jq -c . /path/to/downloaded-credentials.json
```

### 4.2 Add to .env File

Open `apps/server/.env` and add:

```bash
# Google Drive API Credentials
GOOGLE_DRIVE_CREDENTIALS='{"type":"service_account","project_id":"firma-hukum-perari-123456","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firma-hukum-storage@firma-hukum-perari-123456.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**⚠️ IMPORTANT:**
- Wrap the entire JSON in **single quotes** `'...'`
- Keep the `\n` in the private_key (they're part of the key)
- **NO spaces** before or after the `=` sign

---

## Step 5: Run Database Migration

### 5.1 Generate Prisma Client

```bash
cd apps/server
npm run prisma:generate
```

### 5.2 Run Migration

```bash
npm run prisma:migrate:deploy
```

Or for development:
```bash
npm run prisma:migrate
```

### 5.3 Verify Migration

Check database to verify new columns exist:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dokumen_hukum'
  AND column_name IN ('google_drive_id', 'google_drive_link', 'embed_link');
```

Expected output:
```
     column_name     | data_type | is_nullable
---------------------+-----------+-------------
 google_drive_id     | text      | YES
 google_drive_link   | text      | YES
 embed_link          | text      | YES
```

---

## Step 6: Test the Integration

### 6.1 Start the Server

```bash
cd apps/server
npm run start:dev
```

Check logs for:
```
[GoogleDriveService] Google Drive API initialized successfully
```

**✅ If you see this → Setup successful!**

**❌ If you see error:**
- Check credentials format
- Verify API is enabled
- Check error details in logs

### 6.2 Test Upload

1. Start frontend: `cd apps/web && npm run dev`
2. Login to application
3. Navigate to: **Dashboard** → **Dokumen** → **Upload Baru**
4. Select a perkara
5. Upload a test file (PDF or image)
6. Click **"Upload Dokumen"**

### 6.3 Verify Upload

**In Application:**
- Check dokumen list
- Click on uploaded document
- Preview should show in Google Drive viewer

**In Google Drive:**
1. Login with service account email (won't work - service accounts don't have UI)
2. Alternative: Share folder with your personal Google account
   - Get service account email from credentials: `client_email`
   - In your Google Drive, create a folder
   - Share folder with service account email
   - Update `.env` with folder ID:
     ```bash
     GOOGLE_DRIVE_ROOT_FOLDER_ID=your-folder-id-here
     ```

---

## Troubleshooting

### Error: "Failed to initialize Google Drive API"

**Cause:** Invalid credentials format

**Solution:**
1. Verify credentials are valid JSON
2. Check single-line format (no newlines except in `private_key`)
3. Ensure wrapped in single quotes
4. Test JSON validity: `echo $GOOGLE_DRIVE_CREDENTIALS | jq .`

---

### Error: "Access Not Configured"

**Cause:** Google Drive API not enabled

**Solution:**
1. Go to Cloud Console
2. Navigate to **APIs & Services** → **Library**
3. Search "Google Drive API"
4. Click **ENABLE**

---

### Error: "Invalid JWT Signature"

**Cause:** Corrupted private key

**Solution:**
1. Re-download service account key
2. Ensure `\n` characters in private_key are preserved
3. Don't manually edit the JSON

---

### Error: "Insufficient Permission"

**Cause:** Service account lacks permissions

**Solution:**
1. Recreate service account key
2. Ensure Google Drive API is enabled
3. Check service account has "Service Account User" role

---

### Preview Not Working

**Cause:** Embed link restrictions

**Solution:**
1. Check file permissions (should be "anyone with link")
2. Verify `embed_link` in database
3. Check browser console for CORS errors

---

## 📊 Monitoring Usage

### View Quota Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **APIs & Services** → **Dashboard**
3. Click **Google Drive API**
4. View **Quotas & System Limits**

### Default Quotas

- **Queries per day**: 1,000,000,000
- **Queries per 100 seconds per user**: 1,000
- **Queries per 100 seconds**: 10,000

**For most applications, this is MORE than enough!**

---

## 🔐 Security Best Practices

1. **Never commit credentials to Git**
   - Add to `.gitignore`: `*.json` (service account keys)
   - Use environment variables only

2. **Rotate keys periodically**
   - Every 90 days recommended
   - Delete old keys after rotation

3. **Limit service account permissions**
   - Only enable Google Drive API
   - Don't grant unnecessary roles

4. **Monitor API usage**
   - Set up alerts for unusual activity
   - Review logs regularly

---

## 📝 Summary

**What You Accomplished:**

✅ Created Google Cloud Project
✅ Enabled Google Drive API
✅ Created Service Account with credentials
✅ Configured environment variables
✅ Ran database migration
✅ Integrated Google Drive for document storage

**Benefits:**

💰 **15GB FREE** storage
🚀 **Global CDN** for fast access
📊 **Built-in preview** for PDF, Word, Excel, images
🔄 **Auto backup** by Google
💾 **Save server resources** (no local storage needed)

---

## 🆘 Need Help?

- Google Drive API Docs: https://developers.google.com/drive/api/guides/about-sdk
- Service Accounts Guide: https://cloud.google.com/iam/docs/service-accounts
- Node.js Client Library: https://github.com/googleapis/google-api-nodejs-client

**Happy Coding! 🎉**
