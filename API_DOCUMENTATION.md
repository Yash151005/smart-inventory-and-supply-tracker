# API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication
Currently, the API does not require authentication. For production deployment, implement JWT or OAuth2.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development mode
}
```

---

## Endpoints

### 1. Inventory Management

#### 1.1 Get All Inventory Items

**GET** `/inventory`

**Query Parameters:**
- `category` (optional): Filter by category
- `low_stock` (optional): Set to "true" to show only low stock items

**Example Request:**
```powershell
# Get all items
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory"

# Filter by category
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory?category=Electronics"

# Get low stock items
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory?low_stock=true"
```

**Example Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with USB receiver",
      "sku": "MOUSE-001",
      "quantity": 45,
      "unit": "pieces",
      "category": "Electronics",
      "min_threshold": 15,
      "max_threshold": 100,
      "unit_price": 24.99,
      "supplier": "Tech Supplies Inc.",
      "location": "Warehouse A - Shelf 12",
      "created_at": "2025-11-01 10:00:00",
      "updated_at": "2025-11-01 10:00:00"
    }
  ]
}
```

---

#### 1.2 Get Single Item

**GET** `/inventory/:id`

**URL Parameters:**
- `id` (required): Item ID

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "sku": "MOUSE-001",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Item not found"
}
```

---

#### 1.3 Create New Item

**POST** `/inventory`

**Request Body:**
```json
{
  "name": "Laptop Charger",          // Required
  "sku": "CHRG-001",                 // Required
  "quantity": 25,                    // Required
  "description": "65W USB-C charger",
  "unit": "pieces",
  "category": "Electronics",
  "min_threshold": 10,
  "max_threshold": 50,
  "unit_price": 49.99,
  "supplier": "Tech Supplies Inc.",
  "location": "Warehouse A - Shelf 10"
}
```

**Example Request:**
```powershell
$body = @{
    name = "Laptop Charger"
    sku = "CHRG-001"
    quantity = 25
    description = "65W USB-C charger"
    category = "Electronics"
    min_threshold = 10
    unit_price = 49.99
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Example Response (201):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 9,
    "name": "Laptop Charger",
    ...
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Name, SKU, and quantity are required fields"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "SKU already exists"
}
```

---

#### 1.4 Update Item

**PUT** `/inventory/:id`

**URL Parameters:**
- `id` (required): Item ID

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "quantity": 50,
  "unit_price": 59.99,
  ...
}
```

**Example Request:**
```powershell
$body = @{
    quantity = 50
    unit_price = 59.99
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "quantity": 50,
    ...
  }
}
```

---

#### 1.5 Update Stock Quantity

**PATCH** `/inventory/:id/stock`

**URL Parameters:**
- `id` (required): Item ID

**Request Body:**
```json
{
  "quantity": 10,              // Required: Amount to add or remove
  "operation": "add"           // Required: "add" or "remove"
}
```

**Example Request:**
```powershell
# Add stock
$body = @{
    quantity = 10
    operation = "add"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1/stock" `
    -Method PATCH `
    -Body $body `
    -ContentType "application/json"

# Remove stock
$body = @{
    quantity = 5
    operation = "remove"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1/stock" `
    -Method PATCH `
    -Body $body `
    -ContentType "application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": 1,
    "quantity": 55,
    ...
  }
}
```

---

#### 1.6 Delete Item

**DELETE** `/inventory/:id`

**URL Parameters:**
- `id` (required): Item ID

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1" -Method DELETE
```

**Example Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

#### 1.7 Get Inventory Statistics

**GET** `/inventory/stats`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/stats"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 8,
    "low_stock_items": 3,
    "total_inventory_value": "2457.84",
    "categories": [
      {
        "category": "Electronics",
        "count": 4
      },
      {
        "category": "Office Supplies",
        "count": 4
      }
    ]
  }
}
```

---

### 2. Alert Management

#### 2.1 Get All Alerts

**GET** `/alerts`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts"
```

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "item_id": 2,
      "alert_type": "LOW_STOCK",
      "message": "Low stock alert: Office Paper A4 (SKU: PAPER-A4-001) has only 8 reams remaining.",
      "severity": "warning",
      "is_resolved": 0,
      "created_at": "2025-11-01 10:30:00",
      "resolved_at": null,
      "item_name": "Office Paper A4",
      "sku": "PAPER-A4-001",
      "quantity": 8,
      "min_threshold": 10
    }
  ]
}
```

---

#### 2.2 Get Active Alerts Only

**GET** `/alerts/active`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/active"
```

**Example Response:** (Same format as Get All Alerts, but filtered)

---

#### 2.3 Resolve Alert

**PATCH** `/alerts/:id/resolve`

**URL Parameters:**
- `id` (required): Alert ID

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/1/resolve" -Method PATCH
```

**Example Response:**
```json
{
  "success": true,
  "message": "Alert resolved successfully"
}
```

---

#### 2.4 Delete Alert

**DELETE** `/alerts/:id`

**URL Parameters:**
- `id` (required): Alert ID

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/1" -Method DELETE
```

**Example Response:**
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

### 3. System Endpoints

#### 3.1 Health Check

**GET** `/health`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

**Example Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-01T14:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request body or parameters |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate SKU or other conflict |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement express-rate-limit
- Suggested: 100 requests per 15 minutes per IP

---

## CORS

CORS is enabled for all origins in development. For production:
- Restrict to specific domains
- Update CORS configuration in `server.js`

---

## Performance Headers

All responses include:
- `X-Response-Time`: Request processing time in milliseconds

---

## Pagination

Currently not implemented. For large datasets, consider adding:
- `page` query parameter
- `limit` query parameter
- Response metadata with `total`, `page`, `pageSize`

---

## Webhooks (Future Enhancement)

Consider implementing webhooks for:
- Low stock alerts
- Item created/updated/deleted
- Daily inventory reports

---

## Testing with cURL

### Get All Items
```bash
curl http://localhost:3000/api/inventory
```

### Create Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "sku": "TEST-001",
    "quantity": 100
  }'
```

### Update Stock
```bash
curl -X PATCH http://localhost:3000/api/inventory/1/stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "operation": "add"
  }'
```

---

## Best Practices

1. **Always validate input** on the client-side before sending
2. **Handle errors gracefully** and provide user feedback
3. **Use appropriate HTTP methods** (GET, POST, PUT, PATCH, DELETE)
4. **Include Content-Type header** for POST/PUT/PATCH requests
5. **Check response status** before processing data

---

## Example Full Workflow

```powershell
# 1. Get current inventory
$inventory = Invoke-RestMethod -Uri "http://localhost:3000/api/inventory"
Write-Host "Total items: $($inventory.count)"

# 2. Create a new item
$newItem = @{
    name = "New Product"
    sku = "NEW-001"
    quantity = 50
    category = "Test"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" `
    -Method POST `
    -Body $newItem `
    -ContentType "application/json"

Write-Host "Created item ID: $($created.data.id)"

# 3. Update stock
$stockUpdate = @{
    quantity = 10
    operation = "remove"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/$($created.data.id)/stock" `
    -Method PATCH `
    -Body $stockUpdate `
    -ContentType "application/json"

# 4. Check for alerts
$alerts = Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/active"
Write-Host "Active alerts: $($alerts.count)"

# 5. Get statistics
$stats = Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/stats"
Write-Host "Total value: $($stats.data.total_inventory_value)"
```

---

**API Version:** 1.0.0  
**Last Updated:** November 2025
