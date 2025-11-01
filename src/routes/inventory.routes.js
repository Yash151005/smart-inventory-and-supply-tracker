const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// GET /api/inventory - Get all items (with optional filters)
router.get('/', inventoryController.getAllItems.bind(inventoryController));

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', inventoryController.getStats.bind(inventoryController));

// GET /api/inventory/:id - Get single item by ID
router.get('/:id', inventoryController.getItemById.bind(inventoryController));

// POST /api/inventory - Create new item
router.post('/', inventoryController.createItem.bind(inventoryController));

// PUT /api/inventory/:id - Update item
router.put('/:id', inventoryController.updateItem.bind(inventoryController));

// PATCH /api/inventory/:id/stock - Update stock quantity
router.patch('/:id/stock', inventoryController.updateStock.bind(inventoryController));

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', inventoryController.deleteItem.bind(inventoryController));

module.exports = router;
