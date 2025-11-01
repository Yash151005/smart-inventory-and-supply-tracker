const db = require('../database/db');

class AlertService {
  // Check if item is low on stock and create alert
  async checkLowStock(itemId) {
    try {
      const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [itemId]);
      
      if (!item) {
        return null;
      }
      
      // Check if quantity is below minimum threshold
      if (item.quantity <= item.min_threshold) {
        // Check if there's already an unresolved alert
        const existingAlert = await db.get(
          'SELECT * FROM alerts WHERE item_id = ? AND is_resolved = 0 AND alert_type = ?',
          [itemId, 'LOW_STOCK']
        );
        
        if (!existingAlert) {
          // Create new alert
          const severity = item.quantity === 0 ? 'critical' : item.quantity <= item.min_threshold / 2 ? 'high' : 'warning';
          
          await db.run(`
            INSERT INTO alerts (item_id, alert_type, message, severity)
            VALUES (?, ?, ?, ?)
          `, [
            itemId,
            'LOW_STOCK',
            `Low stock alert: ${item.name} (SKU: ${item.sku}) has only ${item.quantity} ${item.unit} remaining. Minimum threshold: ${item.min_threshold}`,
            severity
          ]);
          
          console.log(`⚠️  Low stock alert created for: ${item.name}`);
        }
      } else {
        // Resolve any existing low stock alerts
        await db.run(`
          UPDATE alerts SET
            is_resolved = 1,
            resolved_at = CURRENT_TIMESTAMP
          WHERE item_id = ? AND alert_type = ? AND is_resolved = 0
        `, [itemId, 'LOW_STOCK']);
      }
      
      return item;
    } catch (error) {
      console.error('Error checking low stock:', error);
      throw error;
    }
  }

  // Get all active alerts
  async getActiveAlerts() {
    try {
      const alerts = await db.all(`
        SELECT 
          a.*,
          i.name as item_name,
          i.sku,
          i.quantity,
          i.min_threshold
        FROM alerts a
        JOIN inventory_items i ON a.item_id = i.id
        WHERE a.is_resolved = 0
        ORDER BY 
          CASE a.severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'warning' THEN 3
            ELSE 4
          END,
          a.created_at DESC
      `);
      
      return alerts;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  }

  // Get all alerts (including resolved)
  async getAllAlerts() {
    try {
      const alerts = await db.all(`
        SELECT 
          a.*,
          i.name as item_name,
          i.sku,
          i.quantity,
          i.min_threshold
        FROM alerts a
        JOIN inventory_items i ON a.item_id = i.id
        ORDER BY a.created_at DESC
      `);
      
      return alerts;
    } catch (error) {
      console.error('Error getting all alerts:', error);
      throw error;
    }
  }

  // Resolve an alert
  async resolveAlert(alertId) {
    try {
      const result = await db.run(`
        UPDATE alerts SET
          is_resolved = 1,
          resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [alertId]);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  // Delete an alert
  async deleteAlert(alertId) {
    try {
      const result = await db.run('DELETE FROM alerts WHERE id = ?', [alertId]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();
