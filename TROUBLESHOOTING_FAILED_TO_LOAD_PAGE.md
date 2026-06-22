# Troubleshooting: “failed to load page” (School ERP)

## What to check (fast)
1. Open the page that fails.
2. DevTools → **Network** tab.
3. Reload (Ctrl+R).
4. Click the **first failed request** (red).
5. Record:
   - Request URL
   - Status code (404/500/etc)
   - Response text (if any)

## Common causes in this repo
### 1) Static assets path mismatch
The Express server serves files only from:
- `frontend/` via `express.static(path.join(__dirname, '../frontend'))`

So these relative links must resolve correctly from each dashboard HTML page:
- `../script.js`
- `../style.css`
- `./staff-dashboard.js`

### 2) Uploads not exposed via Express
If a dashboard tries to link to files under `uploads/...`, they will **404** unless the server has:
- `app.use('/uploads', express.static(...))`

Your server currently does not mount `uploads`.

## Server-side quick verification
Run the backend and check console output:
- It should print `🚀 Server running on port 5000`
- If MongoDB fails, API calls may fail, but static pages should still load.

## If you provide the first failing Network request
I can patch the exact path/server static mounting required.

