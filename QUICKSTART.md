# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```powershell
npm install
```

### Step 2: Create Environment File (30 sec)
The `.env` file is already created with default settings. You're ready to go!

### Step 3: Initialize Database (1 min)
```powershell
npm run init-db
```

You should see:
```
Initializing database...
Seeding database with sample data...
  ✓ Added: Wireless Mouse
  ✓ Added: Office Paper A4
  ✓ Added: USB-C Cable
  ...
✓ Database seeded successfully!
```

### Step 4: Start the Server (30 sec)
```powershell
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   Smart Inventory & Supply Tracker MVP                    ║
║   Server running on http://localhost:3000                 ║
║   Environment: development                                ║
║   Database: SQLite (Local)                                ║
║   Ready for Azure Cloud Migration                         ║
╚════════════════════════════════════════════════════════════╝
```

### Step 5: Open in Browser (10 sec)
Navigate to: **http://localhost:3000**

---

## 🎯 What You'll See

### Dashboard Features
1. **Statistics Cards** (Top)
   - Total Items
   - Low Stock Items
   - Total Inventory Value
   - Active Alerts

2. **Alert Section** (if any low stock items)
   - Color-coded by severity
   - Real-time updates

3. **Action Bar**
   - Search inventory
   - Filter by category
   - Show only low stock items
   - Add new item button

4. **Inventory Table**
   - All items with details
   - Stock status indicators
   - Quick actions (Update Stock, Edit, Delete)

---

## 📝 Try These Actions

### Add a New Item
1. Click **"Add Item"** button
2. Fill in the form:
   - **Name**: "Laptop Battery"
   - **SKU**: "BAT-001"
   - **Quantity**: 5
   - **Min Threshold**: 10
3. Click **"Save Item"**
4. Watch the alert appear (quantity below threshold!)

### Update Stock
1. Find any item in the table
2. Click the **exchange icon** (↔)
3. Choose "Add Stock" or "Remove Stock"
4. Enter quantity
5. Click **"Update"**
6. Watch the statistics update in real-time

### Search & Filter
- **Search**: Type in the search box to find items by name, SKU, or category
- **Category Filter**: Select a category from the dropdown
- **Low Stock Filter**: Click to show only items below minimum threshold

### Resolve Alerts
1. Find an active alert
2. Click the **X** button on the right
3. Alert is resolved and removed from view

---

## 🧪 Pre-loaded Sample Data

The database comes with 8 sample items:

| Item | SKU | Stock | Status |
|------|-----|-------|--------|
| Wireless Mouse | MOUSE-001 | 45 | ✅ In Stock |
| Office Paper A4 | PAPER-A4-001 | 8 | ⚠️ Low Stock |
| USB-C Cable | CABLE-USBC-001 | 120 | ✅ Overstock |
| Ballpoint Pens | PEN-BLUE-001 | 5 | ⚠️ Low Stock |
| Laptop Stand | STAND-001 | 32 | ✅ In Stock |
| Sticky Notes | STICKY-001 | 3 | 🔴 Critical |
| HDMI Cable | HDMI-001 | 67 | ✅ In Stock |
| Desk Organizer | ORG-001 | 18 | ✅ In Stock |

---

## 🔧 Development Commands

```powershell
# Start server (production mode)
npm start

# Start with auto-reload (development)
npm run dev

# Reset database
Remove-Item "data/inventory.db" -Force
npm run init-db

# Check for errors
# Open browser console (F12) and check for errors
```

---

## 🌐 API Testing with PowerShell

### Get All Items
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" -Method GET
```

### Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/stats" -Method GET
```

### Create New Item
```powershell
$body = @{
    name = "Test Item"
    sku = "TEST-001"
    quantity = 50
    category = "Test"
    min_threshold = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Get Active Alerts
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/active" -Method GET
```

---

## 📱 Mobile Responsive

The UI is fully responsive! Try:
1. Press **F12** to open DevTools
2. Click the **device toggle** button (phone icon)
3. Select different device sizes
4. See how the layout adapts

---

## 🎨 UI Color Coding

- **🟢 Green**: In Stock (normal levels)
- **🟡 Yellow**: Low Stock (at or below minimum)
- **🔴 Red**: Out of Stock or Critical
- **🟣 Purple**: Overstock (at or above maximum)

---

## ⚡ Performance

- **Auto-refresh**: Dashboard updates every 30 seconds
- **Real-time alerts**: Instant notification when stock changes
- **Fast search**: Client-side filtering for instant results
- **Optimized queries**: Indexed database searches

---

## 🐛 Common Issues

### "Port 3000 is already in use"
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change port in .env file
# PORT=3001
```

### "Cannot find module"
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Database not created
```powershell
# Manually create data directory
New-Item -ItemType Directory -Path "data" -Force
npm run init-db
```

---

## 🎓 Next Steps

1. ✅ Explore all CRUD operations
2. ✅ Test the alert system
3. ✅ Try different filters and searches
4. ✅ Check the API endpoints with PowerShell
5. 📚 Read the full README.md for detailed documentation
6. ☁️ Review AZURE_MIGRATION.md for cloud deployment

---

## 📞 Need Help?

- **Check Logs**: Server logs appear in the terminal
- **Browser Console**: Press F12 and check Console tab
- **Network Tab**: See API requests in DevTools > Network
- **Health Check**: Visit http://localhost:3000/api/health

---

**You're all set! Start managing your inventory! 🎉**
