const db = require('../database/db');
const { logActivity } = require('../utils/logger');
const { checkLowStock } = require('../services/alert.service');

class InventoryController {
  // Get all inventory items
  async getAllItems(req, res, next) {
    try {
      const { category, low_stock } = req.query;
      
      let sql = 'SELECT * FROM inventory_items';
      const params = [];
      
      if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
      }
      
      if (low_stock === 'true') {
        sql += category ? ' AND' : ' WHERE';
        sql += ' quantity <= min_threshold';
      }
      
      sql += ' ORDER BY name ASC';
      
      const items = await db.all(sql, params);
      
      res.json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single item by ID
  async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new inventory item
  async createItem(req, res, next) {
    try {
      const {
        name, description, sku, quantity, unit, category,
        min_threshold, max_threshold, unit_price, supplier, location
      } = req.body;
      
      // Validation
      if (!name || !sku || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Name, SKU, and quantity are required fields'
        });
      }
      
      const result = await db.run(`
        INSERT INTO inventory_items (
          name, description, sku, quantity, unit, category,
          min_threshold, max_threshold, unit_price, supplier, location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, description || null, sku, quantity, unit || 'units', category || null,
        min_threshold || 10, max_threshold || 100, unit_price || 0.00,
        supplier || null, location || null
      ]);
      
      // Log activity
      await logActivity(result.id, 'CREATE', `Created new item: ${name}`);
      
      // Check for low stock alert
      await checkLowStock(result.id);
      
      const newItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [result.id]);
      
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: newItem
      });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists'
        });
      }
      next(error);
    }
  }

  // Update inventory item
  async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name, description, sku, quantity, unit, category,
        min_threshold, max_threshold, unit_price, supplier, location
      } = req.body;
      
      // Check if item exists
      const existingItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      const result = await db.run(`
        UPDATE inventory_items SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          sku = COALESCE(?, sku),
          quantity = COALESCE(?, quantity),
          unit = COALESCE(?, unit),
          category = COALESCE(?, category),
          min_threshold = COALESCE(?, min_threshold),
          max_threshold = COALESCE(?, max_threshold),
          unit_price = COALESCE(?, unit_price),
          supplier = COALESCE(?, supplier),
          location = COALESCE(?, location),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, description, sku, quantity, unit, category,
        min_threshold, max_threshold, unit_price, supplier, location, id
      ]);
      
      // Log activity
      await logActivity(id, 'UPDATE', `Updated item: ${name || existingItem.name}`);
      
      // Check for low stock alert
      await checkLowStock(id);
      
      const updatedItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Item updated successfully',
        data: updatedItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete inventory item
  async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      
      const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      await db.run('DELETE FROM inventory_items WHERE id = ?', [id]);
      await logActivity(id, 'DELETE', `Deleted item: ${item.name}`);
      
      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update stock quantity (increment/decrement)
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;
      
      if (!quantity || !operation) {
        return res.status(400).json({
          success: false,
          message: 'Quantity and operation (add/remove) are required'
        });
      }
      
      const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      let newQuantity;
      if (operation === 'add') {
        newQuantity = item.quantity + quantity;
      } else if (operation === 'remove') {
        newQuantity = Math.max(0, item.quantity - quantity);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use "add" or "remove"'
        });
      }
      
      await db.run(`
        UPDATE inventory_items SET
          quantity = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newQuantity, id]);
      
      await logActivity(
        id,
        operation.toUpperCase(),
        `${operation === 'add' ? 'Added' : 'Removed'} ${quantity} units. New quantity: ${newQuantity}`
      );
      
      await checkLowStock(id);
      
      const updatedItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: updatedItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Get inventory statistics
  async getStats(req, res, next) {
    try {
      const totalItems = await db.get('SELECT COUNT(*) as count FROM inventory_items');
      const lowStockItems = await db.get('SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= min_threshold');
      const totalValue = await db.get('SELECT SUM(quantity * unit_price) as value FROM inventory_items');
      const categories = await db.all('SELECT category, COUNT(*) as count FROM inventory_items WHERE category IS NOT NULL GROUP BY category');
      
      res.json({
        success: true,
        data: {
          total_items: totalItems.count,
          low_stock_items: lowStockItems.count,
          total_inventory_value: parseFloat(totalValue.value || 0).toFixed(2),
          categories: categories
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
