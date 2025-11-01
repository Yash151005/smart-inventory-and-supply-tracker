const db = require('./db');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Sample seed data
const seedData = [
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with USB receiver',
    sku: 'MOUSE-001',
    quantity: 45,
    unit: 'pieces',
    category: 'Electronics',
    min_threshold: 15,
    max_threshold: 100,
    unit_price: 24.99,
    supplier: 'Tech Supplies Inc.',
    location: 'Warehouse A - Shelf 12'
  },
  {
    name: 'Office Paper A4',
    description: 'Premium white office paper, 500 sheets per ream',
    sku: 'PAPER-A4-001',
    quantity: 8,
    unit: 'reams',
    category: 'Office Supplies',
    min_threshold: 10,
    max_threshold: 200,
    unit_price: 5.99,
    supplier: 'Paper World Ltd.',
    location: 'Warehouse B - Shelf 5'
  },
  {
    name: 'USB-C Cable',
    description: 'High-speed USB-C charging and data cable, 6ft',
    sku: 'CABLE-USBC-001',
    quantity: 120,
    unit: 'pieces',
    category: 'Electronics',
    min_threshold: 20,
    max_threshold: 150,
    unit_price: 12.99,
    supplier: 'Cable Connect Corp.',
    location: 'Warehouse A - Shelf 8'
  },
  {
    name: 'Ballpoint Pens (Blue)',
    description: 'Box of 50 blue ballpoint pens',
    sku: 'PEN-BLUE-001',
    quantity: 5,
    unit: 'boxes',
    category: 'Office Supplies',
    min_threshold: 8,
    max_threshold: 50,
    unit_price: 15.99,
    supplier: 'Pen & Paper Co.',
    location: 'Warehouse B - Shelf 3'
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    sku: 'STAND-001',
    quantity: 32,
    unit: 'pieces',
    category: 'Electronics',
    min_threshold: 10,
    max_threshold: 50,
    unit_price: 39.99,
    supplier: 'Tech Supplies Inc.',
    location: 'Warehouse A - Shelf 15'
  },
  {
    name: 'Sticky Notes (3x3)',
    description: 'Yellow sticky notes, pack of 12 pads',
    sku: 'STICKY-001',
    quantity: 3,
    unit: 'packs',
    category: 'Office Supplies',
    min_threshold: 5,
    max_threshold: 30,
    unit_price: 8.99,
    supplier: 'Paper World Ltd.',
    location: 'Warehouse B - Shelf 2'
  },
  {
    name: 'HDMI Cable 2.0',
    description: '4K HDMI cable, 10ft length',
    sku: 'HDMI-001',
    quantity: 67,
    unit: 'pieces',
    category: 'Electronics',
    min_threshold: 15,
    max_threshold: 80,
    unit_price: 18.99,
    supplier: 'Cable Connect Corp.',
    location: 'Warehouse A - Shelf 9'
  },
  {
    name: 'Desk Organizer',
    description: 'Multi-compartment desk organizer',
    sku: 'ORG-001',
    quantity: 18,
    unit: 'pieces',
    category: 'Office Supplies',
    min_threshold: 10,
    max_threshold: 40,
    unit_price: 22.99,
    supplier: 'Office Essentials Ltd.',
    location: 'Warehouse B - Shelf 7'
  }
];

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Initialize schema
    await db.initialize();
    
    // Check if data already exists
    const existingItems = await db.all('SELECT COUNT(*) as count FROM inventory_items');
    
    if (existingItems[0].count === 0) {
      console.log('Seeding database with sample data...');
      
      for (const item of seedData) {
        await db.run(`
          INSERT INTO inventory_items (
            name, description, sku, quantity, unit, category,
            min_threshold, max_threshold, unit_price, supplier, location
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.name, item.description, item.sku, item.quantity, item.unit,
          item.category, item.min_threshold, item.max_threshold,
          item.unit_price, item.supplier, item.location
        ]);
        
        console.log(`  ✓ Added: ${item.name}`);
      }
      
      console.log('\n✓ Database seeded successfully!');
    } else {
      console.log('Database already contains data. Skipping seed.');
    }
    
    console.log('\n✓ Database initialization complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
