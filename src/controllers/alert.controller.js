const alertService = require('../services/alert.service');

class AlertController {
  // Get all active alerts
  async getActiveAlerts(req, res, next) {
    try {
      const alerts = await alertService.getActiveAlerts();
      
      res.json({
        success: true,
        count: alerts.length,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all alerts (including resolved)
  async getAllAlerts(req, res, next) {
    try {
      const alerts = await alertService.getAllAlerts();
      
      res.json({
        success: true,
        count: alerts.length,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  // Resolve an alert
  async resolveAlert(req, res, next) {
    try {
      const { id } = req.params;
      const resolved = await alertService.resolveAlert(id);
      
      if (!resolved) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete an alert
  async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await alertService.deleteAlert(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();
