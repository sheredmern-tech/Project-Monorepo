# 🚨 **IMPORTANT: Service Account Storage Limitation**

## ❌ **Problem: Service Account Has NO Storage Quota**

Error message:
```
Service Accounts do not have storage quota.
```

**Root Cause:**
- Service accounts are for **authentication only**
- They don't have Google Drive storage
- Cannot upload files to "My Drive"

---

## ✅ **SOLUTION: Use Shared Folder (FREE)**

Upload files to a folder in YOUR personal Google Drive that's shared with the service account.

---

## 📋 **STEP-BY-STEP SETUP (5 Minutes)**

### **Step 1: Login to Google Drive**

Go to: https://drive.google.com

Login with your **personal Google account** (Gmail account that has free 15GB storage).

### **Step 2: Create Folder**

1. Click **"New"** → **"Folder"**
2. Name it: **"Firma Hukum Documents"** (or any name)
3. Click **"Create"**

### **Step 3: Share Folder with Service Account**

1. **Right-click** the folder
2. Click **"Share"**
3. In "Add people and groups":
   - Enter: `firma-hukum-storage@firma-hukum-perari.iam.gserviceaccount.com`
   - Change permission to: **Editor** (important!)
4. **Uncheck** "Notify people" (service account doesn't read emails)
5. Click **"Share"**

### **Step 4: Get Folder ID**

1. Open the folder you just created
2. Look at URL in browser:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                           ^^^^^^^^^^^^^^^^^^^^
                                           This is your Folder ID
   ```
3. **Copy the Folder ID** (the random string after `/folders/`)

Example:
- URL: `https://drive.google.com/drive/folders/1Abc2Def3Ghi4Jkl5Mno`
- Folder ID: `1Abc2Def3Ghi4Jkl5Mno`

### **Step 5: Add to .env File**

Open `apps/server/.env` and add:

```bash
GOOGLE_DRIVE_ROOT_FOLDER_ID=1Abc2Def3Ghi4Jkl5Mno
```

Replace `1Abc2Def3Ghi4Jkl5Mno` with YOUR folder ID.

### **Step 6: Restart Server**

```bash
# Stop server
# Restart:
npm run start:dev
```

### **Step 7: Test Upload**

1. Login to app
2. Go to: **Dashboard** → **Dokumen** → **Upload Baru**
3. Select perkara
4. Upload a file
5. **Should work now!** ✅

---

## 🎯 **VERIFICATION**

After setup, files will be uploaded to the shared folder in YOUR Google Drive!

You can verify by:
1. Go to Google Drive
2. Open "Firma Hukum Documents" folder
3. You'll see uploaded files there!

---

## 💾 **STORAGE QUOTA**

**With this approach:**
- ✅ Files stored in YOUR personal Google Drive
- ✅ Uses YOUR 15GB free quota
- ✅ Can upgrade YOUR account if needed (100GB for $1.99/month)
- ✅ You control the storage, not service account

---

## 🔐 **SECURITY**

**Permissions:**
- Service account: **Editor** access to folder (can create/delete files)
- Users: Access via app only (backend controls who can upload)
- Public: Files are NOT publicly listable (only those with link can view)

---

## 📊 **ALTERNATIVE OPTIONS**

If you don't want to use personal Google Drive:

### **Option 1: Google Workspace (PAID)**
- Cost: $6/user/month
- Storage: 30GB - 5TB (depending on plan)
- Use Shared Drives
- Better for enterprise

### **Option 2: Switch to Cloudinary (FREE TIER)**
- 25GB free storage
- Built-in CDN
- Image optimization
- Easier setup

### **Option 3: Supabase Storage (FREE TIER)**
- 1GB free storage
- PostgreSQL integration
- Simple API

---

## ❓ **FAQ**

**Q: Can I use a different Google account?**
A: Yes! Use any Google account you own. Just share the folder with the service account email.

**Q: What if I run out of 15GB?**
A: You can:
1. Upgrade to Google One (100GB for $1.99/month)
2. Use multiple Google accounts with different folders
3. Switch to paid cloud storage

**Q: Is this secure?**
A: Yes! Only the service account has access to the folder, and app controls who can upload via RBAC.

**Q: Can I organize files into subfolders?**
A: Yes! You can create subfolders for each perkara. The code supports it.

---

## 🎉 **AFTER SETUP**

Once configured, the system will:
1. ✅ Upload files to your shared folder
2. ✅ Generate shareable links
3. ✅ Enable preview via Google Drive embed
4. ✅ Track metadata in database
5. ✅ Free 15GB storage!

---

**That's it! Now try uploading a document!** 🚀
