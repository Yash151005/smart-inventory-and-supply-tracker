# Smart Inventory & Supply Tracker MVP

A lightweight, full-stack inventory management prototype designed to demonstrate essential workflows locally before scaling to Azure Cloud.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-MVP-orange)

## 📋 Overview

The Smart Inventory & Supply Tracker MVP is a comprehensive inventory management system that enables:
- ✅ Full CRUD operations on inventory items
- 📊 Real-time stock level tracking
- ⚠️ Automated low-quantity alerts
- 📈 Inventory statistics and analytics
- 🎨 Responsive, modern UI built with Tailwind CSS
- 🔒 Secure REST API architecture

Built with modularity in mind, this MVP simulates Azure cloud components locally (Azure Functions, Cosmos DB, Logic Apps) to ensure seamless future migration to Azure's free-tier ecosystem.

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- SQLite3 (local database)
- RESTful API architecture

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Font Awesome icons

**Middleware & Security:**
- Helmet.js (security headers)
- CORS (cross-origin resource sharing)
- Morgan (HTTP request logging)
- Custom performance monitoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```powershell
   cd "d:\TY_1_1\CAD\smart inventory and supply tracker"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Set up environment variables:**
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Initialize the database:**
   ```powershell
   npm run init-db
   ```

5. **Start the server:**
   ```powershell
   npm start
   ```

   For development with auto-reload:
   ```powershell
   npm run dev
   ```

6. **Access the application:**
   Open your browser and navigate to: `http://localhost:3000`

---

## 📁 Project Structure

```
smart-inventory-supply-tracker/
├── server.js                    # Main Express server
├── package.json                 # Project dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
│
├── src/
│   ├── controllers/             # Request handlers
│   │   ├── inventory.controller.js
│   │   └── alert.controller.js
│   │
│   ├── routes/                  # API route definitions
│   │   ├── inventory.routes.js
│   │   └── alert.routes.js
│   │
│   ├── services/                # Business logic
│   │   └── alert.service.js
│   │
│   ├── database/                # Database setup
│   │   ├── db.js               # Database connection wrapper
│   │   └── init-db.js          # Schema initialization
│   │
│   ├── middleware/              # Express middleware
│   │   ├── performance.middleware.js
│   │   └── error.middleware.js
│   │
│   └── utils/                   # Utility functions
│       └── logger.js
│
├── public/                      # Frontend static files
│   ├── index.html              # Main HTML page
│   └── js/
│       └── app.js              # Frontend JavaScript
│
└── data/                        # Database files (auto-generated)
    └── inventory.db
```

---

## 🔌 API Endpoints

### Inventory Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all inventory items |
| GET | `/api/inventory/stats` | Get inventory statistics |
| GET | `/api/inventory/:id` | Get single item by ID |
| POST | `/api/inventory` | Create new item |
| PUT | `/api/inventory/:id` | Update item |
| PATCH | `/api/inventory/:id/stock` | Update stock quantity |
| DELETE | `/api/inventory/:id` | Delete item |

### Alert Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/alerts/active` | Get active alerts only |
| PATCH | `/api/alerts/:id/resolve` | Resolve an alert |
| DELETE | `/api/alerts/:id` | Delete an alert |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |

---

## 📊 Features

### 1. Inventory Management
- Add, edit, and delete inventory items
- Track multiple attributes: SKU, category, supplier, location, pricing
- Set minimum and maximum stock thresholds
- Update stock levels with add/remove operations

### 2. Real-time Alerts
- Automatic low-stock alerts based on configurable thresholds
- Three severity levels: Warning, High, Critical
- Alert resolution and history tracking
- Visual alert indicators in the dashboard

### 3. Dashboard & Analytics
- Total items count
- Low stock items counter
- Total inventory value calculation
- Category-based filtering
- Real-time search functionality

### 4. Responsive UI
- Mobile-friendly design with Tailwind CSS
- Intuitive modal-based forms
- Color-coded stock status indicators
- Live data updates every 30 seconds

### 5. Performance Monitoring
- Request logging with Morgan
- Custom performance tracking middleware
- Response time headers
- Activity audit trail

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./data/inventory.db

# Alert Thresholds
LOW_STOCK_THRESHOLD=10

# Performance Monitoring
ENABLE_LOGGING=true
LOG_LEVEL=info
```

---

## 🧪 Sample Data

The database is pre-seeded with sample inventory items including:
- Wireless Mouse
- Office Paper A4
- USB-C Cable
- Ballpoint Pens
- Laptop Stand
- Sticky Notes
- HDMI Cable
- Desk Organizer

---

## 🎯 Future Azure Migration Plan

This MVP is designed for easy migration to Azure's free-tier services:

### Planned Azure Components

| Local Component | Azure Equivalent |
|----------------|------------------|
| SQLite Database | Azure Cosmos DB (Free Tier) |
| Express REST API | Azure Functions (Consumption Plan) |
| Alert System | Azure Logic Apps (Free Tier) |
| Static Frontend | Azure Static Web Apps |
| Logging | Azure Application Insights |

### Migration Steps

1. **Database**: Migrate SQLite to Cosmos DB with SQL API
2. **Backend**: Convert Express routes to Azure Functions
3. **Alerts**: Implement Logic Apps for alert workflows
4. **Frontend**: Deploy to Azure Static Web Apps
5. **Monitoring**: Integrate Application Insights

---

## 🛡️ Security Features

- Helmet.js for secure HTTP headers
- CORS protection
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection in frontend
- Environment-based configuration

---

## 📝 Development

### Running in Development Mode

```powershell
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Database Reset

To reset the database and re-seed with sample data:

```powershell
Remove-Item -Path "data/inventory.db" -Force
npm run init-db
```

---

## 🤝 Contributing

This is an MVP project. For production use:
1. Add comprehensive unit tests
2. Implement authentication/authorization
3. Add input validation middleware
4. Set up CI/CD pipeline
5. Add database migrations
6. Implement rate limiting

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built as a demonstration of full-stack development and Azure cloud migration patterns.

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Change PORT in .env file or kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Locked Error
```powershell
# Ensure no other processes are accessing the database
# Restart the server
```

### Module Not Found
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔮 Roadmap

- [ ] User authentication & authorization
- [ ] Multi-user support
- [ ] Advanced reporting & analytics
- [ ] Barcode/QR code scanning
- [ ] Email notifications for alerts
- [ ] Export data to CSV/Excel
- [ ] Mobile app (React Native)
- [ ] Azure cloud deployment
- [ ] Docker containerization
- [ ] GraphQL API option

---

## 📞 Support

For issues or questions, please check the troubleshooting section or review the code documentation.

---

**Happy Inventory Management! 📦**
