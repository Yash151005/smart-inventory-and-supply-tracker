# Troubleshooting Guide

## Common Issues and Solutions

---

## Installation Issues

### ❌ "npm: command not found"

**Problem**: Node.js/npm is not installed

**Solution**:
```powershell
# Download and install Node.js from https://nodejs.org/
# Or use winget:
winget install OpenJS.NodeJS

# Verify installation:
node --version
npm --version
```

---

### ❌ "npm install" fails

**Problem**: Network issues or corrupted cache

**Solution**:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -Force

# Reinstall
npm install
```

---

### ❌ "Permission denied" during npm install

**Problem**: Insufficient permissions

**Solution**:
```powershell
# Run PowerShell as Administrator
# Or change npm global directory:
npm config set prefix ~\AppData\Roaming\npm
```

---

## Database Issues

### ❌ "SQLITE_CANTOPEN: unable to open database file"

**Problem**: Database directory doesn't exist

**Solution**:
```powershell
# Create data directory manually
New-Item -ItemType Directory -Path "data" -Force

# Re-run initialization
npm run init-db
```

---

### ❌ "SQLITE_BUSY: database is locked"

**Problem**: Another process is using the database

**Solution**:
```powershell
# Stop the server (Ctrl+C)
# Wait a few seconds
# Restart the server
npm start

# If persists, delete and recreate database:
Remove-Item "data\inventory.db" -Force
npm run init-db
```

---

### ❌ "Database already contains data"

**Problem**: Running init-db when database already exists

**Solution**:
This is not an error! The script skips seeding to prevent duplicates.

To reset the database:
```powershell
Remove-Item "data\inventory.db" -Force
npm run init-db
```

---

## Server Issues

### ❌ "Port 3000 is already in use"

**Problem**: Another application is using port 3000

**Solution 1** - Kill the process:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

**Solution 2** - Change port:
```powershell
# Edit .env file
# Change: PORT=3000
# To: PORT=3001

# Restart server
npm start
```

---

### ❌ "Cannot find module 'express'"

**Problem**: Dependencies not installed

**Solution**:
```powershell
npm install
```

---

### ❌ Server starts but shows errors

**Problem**: Missing environment variables

**Solution**:
```powershell
# Ensure .env file exists
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}

# Restart server
npm start
```

---

## Frontend Issues

### ❌ Blank page / Nothing loads

**Problem**: JavaScript errors or API connection issues

**Solution**:
1. Open browser console (F12)
2. Check for errors in Console tab
3. Check Network tab for failed API calls
4. Verify server is running on http://localhost:3000

---

### ❌ "Failed to fetch" errors

**Problem**: Backend server is not running

**Solution**:
```powershell
# Start the backend server
npm start

# Verify it's running:
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

---

### ❌ Data doesn't load / Empty table

**Problem**: Database is empty or API connection failed

**Solution**:
```powershell
# Check if database is initialized
npm run init-db

# Test API directly
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory"

# Check browser console (F12) for errors
```

---

### ❌ Styles not loading / Ugly UI

**Problem**: Tailwind CSS CDN not loading

**Solution**:
1. Check internet connection (Tailwind loads from CDN)
2. Check browser console for CDN errors
3. Try refreshing the page (Ctrl+F5)
4. Check if firewall is blocking CDN

---

### ❌ Icons not showing

**Problem**: Font Awesome CDN not loading

**Solution**:
Same as Tailwind CSS issue above - check internet and CDN access

---

## API Issues

### ❌ "404 Not Found" on API calls

**Problem**: Incorrect API endpoint or server not running

**Solution**:
```powershell
# Verify server is running
# Check the URL matches: http://localhost:3000/api/...

# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

---

### ❌ "500 Internal Server Error"

**Problem**: Server-side error

**Solution**:
1. Check server console for error messages
2. Check browser console (F12) for details
3. Verify request body format is correct
4. Check server logs in terminal

---

### ❌ "UNIQUE constraint failed: inventory_items.sku"

**Problem**: Trying to create item with duplicate SKU

**Solution**:
- Use a different SKU
- Or delete the existing item first
- SKUs must be unique

---

### ❌ "Name, SKU, and quantity are required fields"

**Problem**: Missing required fields in form

**Solution**:
Ensure you fill in:
- Item Name
- SKU
- Quantity

---

## Performance Issues

### ❌ Slow page load

**Problem**: Large dataset or slow queries

**Solution**:
```powershell
# Check number of items
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/stats"

# If > 1000 items, consider pagination
# Or use filters to reduce dataset
```

---

### ❌ Auto-refresh causing lag

**Problem**: Too many requests

**Solution**:
Increase refresh interval in `public/js/app.js`:
```javascript
// Change from 30000 (30 sec) to 60000 (60 sec)
setInterval(() => {
    loadStats();
    loadAlerts();
}, 60000);
```

---

## Development Issues

### ❌ Changes not reflecting

**Problem**: Browser cache or need server restart

**Solution**:
```powershell
# For frontend changes:
# Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)

# For backend changes:
# Stop server (Ctrl+C)
# Start again
npm start

# Or use nodemon for auto-restart:
npm run dev
```

---

### ❌ "nodemon: command not found"

**Problem**: Dev dependency not installed

**Solution**:
```powershell
npm install
# Or install nodemon globally:
npm install -g nodemon
```

---

## Browser-Specific Issues

### ❌ Works in Chrome but not in Edge/Firefox

**Problem**: Browser compatibility

**Solution**:
- Ensure browser is up to date
- Clear browser cache
- Check browser console for specific errors
- Use Chrome or Edge (Chromium) for best compatibility

---

### ❌ CORS errors in browser console

**Problem**: Cross-origin request blocked

**Solution**:
This shouldn't happen with current setup, but if it does:
1. Verify server.js has `app.use(cors())`
2. Restart the server
3. Clear browser cache

---

## Data Issues

### ❌ Alerts not appearing for low stock items

**Problem**: Alert service not triggered or thresholds wrong

**Solution**:
```powershell
# Check item threshold settings
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1"

# Ensure: quantity <= min_threshold

# Update stock to trigger alert
$body = @{ quantity = 1; operation = "remove" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1/stock" `
    -Method PATCH -Body $body -ContentType "application/json"

# Check alerts
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/active"
```

---

### ❌ Statistics not updating

**Problem**: Cache or auto-refresh not working

**Solution**:
- Manually refresh browser (F5)
- Check browser console for errors
- Verify auto-refresh is running (check console logs)

---

## Advanced Troubleshooting

### Enable Detailed Logging

Edit `.env`:
```
ENABLE_LOGGING=true
LOG_LEVEL=debug
```

Restart server to see detailed logs.

---

### Database Inspection

```powershell
# Install SQLite viewer (optional)
# DB Browser for SQLite: https://sqlitebrowser.org/

# Or use command line:
sqlite3 data/inventory.db

# Then run SQL queries:
.tables
SELECT * FROM inventory_items;
SELECT * FROM alerts WHERE is_resolved = 0;
.exit
```

---

### Test API with Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import collection:
   - Create new request
   - Set URL: http://localhost:3000/api/inventory
   - Set method: GET
   - Send request

---

### Check File Permissions

```powershell
# Ensure you have write permissions
# Right-click folder > Properties > Security
# Ensure your user has "Full Control"
```

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check browser console (F12)
3. ✅ Check server console output
4. ✅ Verify all files exist (see PROJECT_COMPLETE.md)
5. ✅ Try the QUICKSTART.md steps from scratch

### What to Include When Reporting Issues

- **Error message** (exact text)
- **Browser console** errors (screenshot)
- **Server console** output
- **Steps to reproduce**
- **OS and Node.js version**
- **What you've tried**

### Quick Diagnostics

Run this diagnostic script:
```powershell
# Check Node.js
Write-Host "Node version:" (node --version)
Write-Host "NPM version:" (npm --version)

# Check files
Write-Host "Files exist:"
Test-Path "server.js"
Test-Path "package.json"
Test-Path ".env"

# Check server
Write-Host "Testing server..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Server not responding" -ForegroundColor Red
}
```

---

## Emergency Reset

If nothing works, complete reset:

```powershell
# Stop server (Ctrl+C)

# Delete everything except source files
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force data
Remove-Item package-lock.json -Force

# Reinstall
npm install
npm run init-db
npm start
```

---

## Prevention Tips

1. **Keep Node.js updated** - Check for updates monthly
2. **Use version control** - Git commit working states
3. **Regular backups** - Backup database periodically
4. **Monitor logs** - Check server output regularly
5. **Test changes** - Test in development before production

---

## Still Having Issues?

1. Re-read the QUICKSTART.md guide
2. Check the API_DOCUMENTATION.md for correct usage
3. Review PROJECT_COMPLETE.md for file structure
4. Try the Emergency Reset procedure above

---

**Most issues are resolved by:**
- ✅ Ensuring Node.js is installed
- ✅ Running `npm install`
- ✅ Running `npm run init-db`
- ✅ Starting server with `npm start`
- ✅ Hard refreshing browser (Ctrl+F5)

---

**Happy troubleshooting! 🔧**
