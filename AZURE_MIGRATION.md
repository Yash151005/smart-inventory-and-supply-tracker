# Azure Cloud Migration Guide

## Overview
This guide provides step-by-step instructions for migrating the Smart Inventory & Supply Tracker MVP from local SQLite to Azure's free-tier cloud services.

---

## Architecture Comparison

### Current Local Architecture
- **Database**: SQLite (file-based)
- **Backend**: Express.js on Node.js
- **Frontend**: Static HTML/CSS/JS
- **Alerts**: Local service logic
- **Logging**: Console + Morgan

### Target Azure Architecture
- **Database**: Azure Cosmos DB (Free Tier - 1000 RU/s, 25GB storage)
- **Backend**: Azure Functions (Consumption Plan - 1M free executions/month)
- **Frontend**: Azure Static Web Apps (Free Tier)
- **Alerts**: Azure Logic Apps (Free Tier - 4000 actions/month)
- **Logging**: Azure Application Insights (Free Tier - 5GB/month)

---

## Migration Steps

### Phase 1: Database Migration to Cosmos DB

#### 1.1 Create Cosmos DB Account
```powershell
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login to Azure
az login

# Create resource group
az group create --name inventory-tracker-rg --location eastus

# Create Cosmos DB account (free tier)
az cosmosdb create `
  --name inventory-tracker-db `
  --resource-group inventory-tracker-rg `
  --locations regionName=eastus `
  --enable-free-tier true `
  --default-consistency-level Session
```

#### 1.2 Create Database and Containers
```powershell
# Create database
az cosmosdb sql database create `
  --account-name inventory-tracker-db `
  --resource-group inventory-tracker-rg `
  --name InventoryDB

# Create inventory container
az cosmosdb sql container create `
  --account-name inventory-tracker-db `
  --resource-group inventory-tracker-rg `
  --database-name InventoryDB `
  --name Items `
  --partition-key-path "/category" `
  --throughput 400

# Create alerts container
az cosmosdb sql container create `
  --account-name inventory-tracker-db `
  --resource-group inventory-tracker-rg `
  --database-name InventoryDB `
  --name Alerts `
  --partition-key-path "/item_id" `
  --throughput 400
```

#### 1.3 Data Migration Script
Create `migrate-to-cosmos.js`:

```javascript
const { CosmosClient } = require("@azure/cosmos");
const sqlite3 = require('sqlite3').verbose();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function migrateData() {
  const database = client.database("InventoryDB");
  const container = database.container("Items");
  
  // Read from SQLite
  const db = new sqlite3.Database('./data/inventory.db');
  
  db.all("SELECT * FROM inventory_items", async (err, rows) => {
    if (err) throw err;
    
    for (const row of rows) {
      await container.items.create({
        id: row.id.toString(),
        ...row,
        category: row.category || "Uncategorized"
      });
    }
    
    console.log('Migration complete!');
  });
}

migrateData();
```

---

### Phase 2: Backend Migration to Azure Functions

#### 2.1 Install Azure Functions Core Tools
```powershell
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

#### 2.2 Create Function App
```powershell
# Create function app
func init InventoryFunctions --javascript

# Create HTTP trigger functions
cd InventoryFunctions
func new --name GetInventory --template "HTTP trigger"
func new --name CreateItem --template "HTTP trigger"
func new --name UpdateItem --template "HTTP trigger"
func new --name DeleteItem --template "HTTP trigger"
func new --name GetAlerts --template "HTTP trigger"
```

#### 2.3 Sample Azure Function (GetInventory)
```javascript
const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    const client = new CosmosClient({ 
        endpoint: process.env.COSMOS_ENDPOINT, 
        key: process.env.COSMOS_KEY 
    });
    
    const database = client.database("InventoryDB");
    const container = database.container("Items");
    
    const { resources } = await container.items
        .query("SELECT * FROM c")
        .fetchAll();
    
    context.res = {
        status: 200,
        body: {
            success: true,
            count: resources.length,
            data: resources
        }
    };
};
```

#### 2.4 Deploy Function App
```powershell
# Create Function App in Azure
az functionapp create `
  --resource-group inventory-tracker-rg `
  --consumption-plan-location eastus `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --name inventory-tracker-functions `
  --storage-account inventorystorage

# Deploy functions
func azure functionapp publish inventory-tracker-functions
```

---

### Phase 3: Frontend Migration to Static Web Apps

#### 3.1 Prepare Frontend
Update `public/js/app.js` to use Azure Functions URL:
```javascript
const API_BASE_URL = 'https://inventory-tracker-functions.azurewebsites.net/api';
```

#### 3.2 Create Static Web App
```powershell
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Create Static Web App
az staticwebapp create `
  --name inventory-tracker-app `
  --resource-group inventory-tracker-rg `
  --location eastus `
  --source https://github.com/yourusername/inventory-tracker `
  --branch main `
  --app-location "/public" `
  --api-location "" `
  --output-location ""
```

---

### Phase 4: Alerts Migration to Logic Apps

#### 4.1 Create Logic App Workflow
1. Go to Azure Portal > Create Logic App
2. Choose Consumption plan (Free tier)
3. Create workflow: "Low Stock Alert"

#### 4.2 Workflow Design
```
Trigger: HTTP Request (from Function)
↓
Action: Query Cosmos DB (check stock level)
↓
Condition: If quantity <= min_threshold
↓
True: Send email via Office 365 Connector
       Create alert in Cosmos DB
↓
False: End
```

#### 4.3 Integrate with Function
Update inventory update function:
```javascript
// After updating item quantity
if (item.quantity <= item.min_threshold) {
    await fetch(process.env.LOGIC_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            threshold: item.min_threshold
        })
    });
}
```

---

### Phase 5: Application Insights Integration

#### 5.1 Add Application Insights
```powershell
# Create Application Insights
az monitor app-insights component create `
  --app inventory-tracker-insights `
  --location eastus `
  --resource-group inventory-tracker-rg `
  --application-type web
```

#### 5.2 Update Function App
```javascript
const appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();

const client = appInsights.defaultClient;

// In your function
client.trackEvent({ name: "InventoryUpdated", properties: { itemId: id } });
client.trackMetric({ name: "StockLevel", value: quantity });
```

---

## Cost Optimization

### Free Tier Limits
- **Cosmos DB**: 1000 RU/s, 25GB storage (permanently free)
- **Azure Functions**: 1M executions, 400,000 GB-s/month
- **Static Web Apps**: 100GB bandwidth/month
- **Logic Apps**: 4,000 actions/month
- **Application Insights**: 5GB data ingestion/month

### Staying Within Free Tier
1. Use serverless (consumption) plans
2. Enable auto-pause for development environments
3. Optimize Cosmos DB queries (reduce RU consumption)
4. Cache frequently accessed data
5. Monitor usage via Azure Cost Management

---

## Configuration & Environment Variables

### Azure Function App Settings
```
COSMOS_ENDPOINT=https://inventory-tracker-db.documents.azure.com:443/
COSMOS_KEY=<your-cosmos-key>
COSMOS_DATABASE=InventoryDB
COSMOS_CONTAINER_ITEMS=Items
COSMOS_CONTAINER_ALERTS=Alerts
APPINSIGHTS_INSTRUMENTATIONKEY=<your-insights-key>
LOGIC_APP_URL=<your-logic-app-url>
```

---

## Testing Migration

### 1. Test Cosmos DB Connection
```powershell
node migrate-to-cosmos.js
```

### 2. Test Azure Functions Locally
```powershell
cd InventoryFunctions
func start
```

### 3. Test Static Web App
```powershell
cd public
npx http-server
```

### 4. End-to-End Testing
- Create new inventory item
- Update stock levels
- Verify alerts are triggered
- Check Application Insights for telemetry

---

## Rollback Plan

If issues arise during migration:

1. **Keep SQLite database** as backup
2. **Maintain local Express server** until Azure is stable
3. **Use feature flags** to toggle between local/cloud
4. **Monitor Azure costs** daily during initial deployment
5. **Document all Azure resource names** for easy cleanup

---

## Security Considerations

### 1. Authentication
- Enable Azure AD authentication for Function Apps
- Use Managed Identities for Cosmos DB access
- Implement API key rotation

### 2. Network Security
- Configure CORS properly in Function Apps
- Use Azure Front Door for DDoS protection
- Enable HTTPS only

### 3. Data Protection
- Enable Cosmos DB encryption at rest
- Use Azure Key Vault for secrets
- Implement backup and disaster recovery

---

## Monitoring & Maintenance

### Daily Checks
- Monitor Application Insights for errors
- Review Cosmos DB RU consumption
- Check Function App execution logs

### Weekly Tasks
- Review cost analysis reports
- Update dependencies and security patches
- Backup Cosmos DB data

### Monthly Activities
- Analyze usage patterns
- Optimize performance bottlenecks
- Review and update documentation

---

## Support Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Logic Apps Documentation](https://docs.microsoft.com/azure/logic-apps/)

---

**Migration Checklist:**
- [ ] Create Azure account with free tier
- [ ] Set up Cosmos DB and migrate data
- [ ] Convert Express routes to Azure Functions
- [ ] Deploy frontend to Static Web Apps
- [ ] Configure Logic Apps for alerts
- [ ] Set up Application Insights
- [ ] Update environment variables
- [ ] Test all functionality end-to-end
- [ ] Set up monitoring and alerts
- [ ] Document Azure resource URLs

---

**Ready to scale to the cloud!** ☁️
