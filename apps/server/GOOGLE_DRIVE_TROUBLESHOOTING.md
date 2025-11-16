# 🔧 Google Drive API - Quick Troubleshooting

## 🚨 Common Error: "Failed to upload file to Google Drive"

Jika Anda mendapat error ini, kemungkinan besar **Google Drive API belum diaktifkan**.

---

## ✅ **SOLUTION - Enable Google Drive API**

### **Step 1: Go to Google Cloud Console**

Buka link ini (ganti `fibidy-studio` dengan project ID Anda):

```
https://console.cloud.google.com/apis/library/drive.googleapis.com?project=fibidy-studio
```

Atau manual:
1. Go to: https://console.cloud.google.com
2. Select project: **fibidy-studio**
3. Navigate to: **APIs & Services** → **Library**
4. Search: **"Google Drive API"**

### **Step 2: Enable the API**

1. Click on **"Google Drive API"**
2. Click **"ENABLE"** button
3. Wait 1-2 minutes for activation

### **Step 3: Verify Activation**

Check if API is enabled:
```
https://console.cloud.google.com/apis/api/drive.googleapis.com?project=fibidy-studio
```

You should see: **"API enabled"** ✅

---

## 🧪 **TEST CONNECTION**

After enabling the API, test the connection:

### **Using API Endpoint:**

```bash
# GET request (requires admin login)
GET /api/v1/dokumen/test/google-drive-connection

# Expected response if successful:
{
  "success": true,
  "message": "Google Drive API connection successful",
  "details": {
    "user": {
      "emailAddress": "firma-hukum-storage@fibidy-studio.iam.gserviceaccount.com"
    },
    "storageQuota": {...}
  }
}

# Expected response if API not enabled:
{
  "success": false,
  "message": "Google Drive API connection failed",
  "details": {
    "error": "API has not been used...",
    "code": 403,
    "hint": "API not enabled. Enable Google Drive API at: https://console.cloud.google.com/apis/library/drive.googleapis.com"
  }
}
```

---

## 📋 **CHECKLIST**

Before uploading documents, ensure:

- [ ] Google Cloud Project created (`fibidy-studio` ✅)
- [ ] Service Account created (`firma-hukum-storage@fibidy-studio.iam.gserviceaccount.com` ✅)
- [ ] Service Account Key downloaded ✅
- [ ] **Google Drive API ENABLED** ⚠️ (Most common issue!)
- [ ] Credentials added to `.env` file ✅
- [ ] Server restarted after adding credentials

---

## 🔍 **DETAILED ERROR CODES**

### Error 403: Access Denied
**Cause:** Google Drive API not enabled

**Solution:**
```
1. Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=fibidy-studio
2. Click ENABLE
3. Wait 1-2 minutes
4. Try upload again
```

### Error 401: Unauthorized
**Cause:** Invalid credentials

**Solution:**
```
1. Check GOOGLE_DRIVE_CREDENTIALS in .env
2. Ensure JSON is valid (single line, wrapped in quotes)
3. Restart server
```

### Error 400: Bad Request
**Cause:** Various issues (check server logs)

**Solution:**
```
1. Check server logs for detailed error
2. Verify credentials format
3. Test connection using /test/google-drive-connection endpoint
```

---

## 📞 **Your Current Setup**

Based on your credentials:

- **Project ID:** `fibidy-studio`
- **Service Account:** `firma-hukum-storage@fibidy-studio.iam.gserviceaccount.com`
- **Credentials:** ✅ Valid format

**Next Step:** Enable Google Drive API at the link above!

---

## 🎯 **Quick Fix (Most Common Issue)**

**90% of errors are solved by:**

1. **Enable Google Drive API**
   ```
   https://console.cloud.google.com/apis/library/drive.googleapis.com?project=fibidy-studio
   ```

2. **Click "ENABLE"**

3. **Wait 1-2 minutes**

4. **Try upload again**

That's it! 🎉

---

## 🆘 **Still Having Issues?**

Check server logs for detailed error:

```bash
# Check logs
docker compose logs api --tail=100

# Look for:
# - "Google Drive API initialized successfully" ✅
# - "Failed to upload file" ❌
# - Error code (403, 401, 400)
```

Or test connection:
```bash
# Using curl (replace TOKEN with your JWT)
curl -X GET http://localhost:3000/api/v1/dokumen/test/google-drive-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Good luck! 🚀**
