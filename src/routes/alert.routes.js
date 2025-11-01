const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

// GET /api/alerts/active - Get all active (unresolved) alerts
router.get('/active', alertController.getActiveAlerts.bind(alertController));

// GET /api/alerts - Get all alerts
router.get('/', alertController.getAllAlerts.bind(alertController));

// PATCH /api/alerts/:id/resolve - Resolve an alert
router.patch('/:id/resolve', alertController.resolveAlert.bind(alertController));

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', alertController.deleteAlert.bind(alertController));

module.exports = router;
