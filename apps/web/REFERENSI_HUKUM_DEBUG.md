# Referensi Hukum - Debug Guide

## API Endpoints

Base URL: `http://localhost:3000/api/v1/external-data`

### Available Endpoints

1. **Health Check**
   ```bash
   curl http://localhost:3000/api/v1/external-data/health | jq .
   ```

2. **Pancasila**
   ```bash
   curl http://localhost:3000/api/v1/external-data/pancasila | jq .
   ```

3. **UUD 1945**
   ```bash
   curl http://localhost:3000/api/v1/external-data/uud1945 | jq .
   ```

4. **KUHP**
   ```bash
   curl http://localhost:3000/api/v1/external-data/kuhp | jq .
   ```

5. **KUH Perdata**
   ```bash
   curl http://localhost:3000/api/v1/external-data/kuhperdata | jq .
   ```

6. **KUHD**
   ```bash
   curl http://localhost:3000/api/v1/external-data/kuhd | jq .
   ```

7. **KUHAP**
   ```bash
   curl http://localhost:3000/api/v1/external-data/kuhap | jq .
   ```

## Expected Response Structure

All endpoints return data wrapped by `TransformInterceptor`:

```json
{
  "success": true,
  "data": [...],  // Array of legal items from npoint.io
  "timestamp": "2025-11-19T17:41:59.646Z"
}
```

## Frontend Implementation

### File Structure

```
apps/web/src/
├── app/referensi-hukum/
│   └── page.tsx                          # Server Component (data fetching)
├── components/referensi-hukum/
│   └── legal-reference-client.tsx        # Client Component (interactive UI)
├── types/
│   └── external-data.ts                  # Type definitions
└── components/ui/
    └── accordion.tsx                     # shadcn/ui component
```

### How It Works

1. **Server Component** (`page.tsx`)
   - Fetches data from all 6 endpoints in parallel
   - Handles response wrapping from `TransformInterceptor`
   - Supports multiple response structures:
     - Direct array: `json.data` (most common)
     - Double wrapped: `json.data.data`
     - Object: wraps in array
   - Passes data to Client Component

2. **Client Component** (`legal-reference-client.tsx`)
   - Renders interactive UI with tabs, search, accordion
   - Handles copy, share functionality
   - Real-time filtering based on search query

### Debug Logs

Check server logs when visiting `http://localhost:3001/referensi-hukum`:

```
[Referensi Hukum] Fetching pancasila from http://localhost:3000/api/v1/external-data/pancasila
[Referensi Hukum] Response for pancasila: {"success":true,"data":[...],"timestamp":"..."}
[Referensi Hukum] pancasila: Found 5 items
```

## Testing

### 1. Test Backend Directly

```bash
# Test all endpoints
for endpoint in pancasila uud1945 kuhp kuhperdata kuhd kuhap; do
  echo "Testing $endpoint..."
  curl -s http://localhost:3000/api/v1/external-data/$endpoint | jq '.success, (.data | length)'
done
```

### 2. Test Frontend

1. Start backend server:
   ```bash
   cd apps/server
   npm run dev
   ```

2. Start frontend server:
   ```bash
   cd apps/web
   npm run dev
   ```

3. Visit: `http://localhost:3001/referensi-hukum`

4. Check browser console for logs:
   - Look for `[Referensi Hukum]` prefixed messages
   - Verify data fetching and parsing

### 3. Common Issues

**Issue: No data showing**
- Check if backend server is running on port 3000
- Check browser console for fetch errors
- Verify API endpoints are accessible via curl
- Check server logs for errors

**Issue: CORS errors**
- Verify `corsOrigins` includes `http://localhost:3001` in backend config
- Check `apps/server/.env` or config files

**Issue: Wrong data structure**
- Check debug logs in server console
- Verify response structure matches expected format
- Frontend handles multiple response structures automatically

## Environment Variables

### Frontend (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1/external-data
```

If not set, defaults to `http://localhost:3000/api/v1/external-data`

## Features Implemented

✅ Server-side data fetching with ISR (revalidate: 3600s)
✅ 6 legal categories with tabs navigation
✅ Real-time search across all content
✅ Copy to clipboard functionality
✅ Share functionality (native + fallback)
✅ Responsive design (mobile, tablet, desktop)
✅ Loading states and error handling
✅ Badge counters for search results
✅ Accordion for clean content display
✅ Icons and modern UI with shadcn/ui

## Troubleshooting

1. **Clear Next.js cache**
   ```bash
   cd apps/web
   rm -rf .next
   npm run dev
   ```

2. **Check TypeScript compilation**
   ```bash
   npx tsc --noEmit
   ```

3. **Verify backend is healthy**
   ```bash
   curl http://localhost:3000/health
   ```

4. **Test specific endpoint manually**
   ```bash
   curl -v http://localhost:3000/api/v1/external-data/pancasila
   ```
