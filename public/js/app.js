// API Base URL
// In Azure: if frontend and backend are hosted under the same App Service, use the relative path '/api'.
// If you want to call the Function App directly, replace with the Function URL, e.g.:
// const API_BASE_URL = 'https://func-smartinv-<uniq>.azurewebsites.net/api';
const API_BASE_URL = '/api';


// State management
let currentEditId = null;
let currentStockId = null;
let allItems = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadInventory();
    loadStats();
    loadAlerts();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadStats();
        loadAlerts();
    }, 30000);
});

// Event Listeners
function initializeEventListeners() {
    document.getElementById('btn-add-item').addEventListener('click', () => openItemModal());
    document.getElementById('btn-cancel').addEventListener('click', closeItemModal);
    document.getElementById('btn-stock-cancel').addEventListener('click', closeStockModal);
    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
    document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('filter-category').addEventListener('change', handleCategoryFilter);
    document.getElementById('filter-low-stock').addEventListener('click', handleLowStockFilter);
    
    // Event delegation for table action buttons
    document.getElementById('inventory-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.dataset.action;
        const id = parseInt(button.dataset.id);
        const name = button.dataset.name;
        
        if (action === 'stock') {
            openStockModal(id, name);
        } else if (action === 'edit') {
            editItem(id);
        } else if (action === 'delete') {
            deleteItem(id, name);
        }
    });
    
    // Event delegation for alert resolve buttons
    document.getElementById('alerts-container').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action="resolve-alert"]');
        if (!button) return;
        
        const id = parseInt(button.dataset.id);
        resolveAlert(id);
    });
}

// Load inventory items
async function loadInventory(filters = {}) {
    try {
        let url = `${API_BASE_URL}/inventory`;
        const params = new URLSearchParams(filters);
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            allItems = data.data;
            renderInventoryTable(data.data);
            populateCategoryFilter(data.data);
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        showNotification('Failed to load inventory', 'error');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('empty-state');
    
    if (items.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    tbody.innerHTML = items.map(item => {
        const stockStatus = getStockStatus(item);
        const totalValue = (item.quantity * item.unit_price).toFixed(2);
        
        return `
            <tr class="hover:bg-gray-50 transition fade-in">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${escapeHtml(item.name)}</div>
                    <div class="text-sm text-gray-500">${escapeHtml(item.description || '')}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(item.sku)}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        ${escapeHtml(item.category || 'N/A')}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">${item.quantity} ${escapeHtml(item.unit)}</div>
                    <div class="text-xs text-gray-500">Min: ${item.min_threshold}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.class}">
                        ${stockStatus.text}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(item.location || 'N/A')}</td>
                <td class="px-6 py-4 font-medium text-gray-900">$${totalValue}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button data-action="stock" data-id="${item.id}" data-name="${escapeHtml(item.name)}" 
                                class="text-blue-600 hover:text-blue-800 transition" 
                                title="Update Stock">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button data-action="edit" data-id="${item.id}" 
                                class="text-green-600 hover:text-green-800 transition" 
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-action="delete" data-id="${item.id}" data-name="${escapeHtml(item.name)}" 
                                class="text-red-600 hover:text-red-800 transition" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get stock status
function getStockStatus(item) {
    if (item.quantity === 0) {
        return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    } else if (item.quantity <= item.min_threshold) {
        return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    } else if (item.quantity >= item.max_threshold) {
        return { text: 'Overstock', class: 'bg-purple-100 text-purple-800' };
    } else {
        return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('stat-total').textContent = data.data.total_items;
            document.getElementById('stat-low-stock').textContent = data.data.low_stock_items;
            document.getElementById('stat-value').textContent = `$${data.data.total_inventory_value}`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load alerts
async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/active`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('stat-alerts').textContent = data.count;
            renderAlerts(data.data);
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Render alerts
function renderAlerts(alerts) {
    const container = document.getElementById('alerts-container');
    
    if (alerts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fas fa-bell text-red-500"></i>
                Active Alerts (${alerts.length})
            </h3>
            <div class="space-y-3">
                ${alerts.map(alert => `
                    <div class="alert-${alert.severity} border-l-4 border-${getSeverityColor(alert.severity)}-500 p-4 rounded-lg flex items-start justify-between fade-in">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fas fa-exclamation-circle text-${getSeverityColor(alert.severity)}-600"></i>
                                <span class="font-semibold text-gray-800">${escapeHtml(alert.item_name)}</span>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-${getSeverityColor(alert.severity)}-200 text-${getSeverityColor(alert.severity)}-800">
                                    ${alert.severity.toUpperCase()}
                                </span>
                            </div>
                            <p class="text-sm text-gray-700">${escapeHtml(alert.message)}</p>
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="far fa-clock"></i> ${formatDate(alert.created_at)}
                            </p>
                        </div>
                        <button data-action="resolve-alert" data-id="${alert.id}" 
                                class="ml-4 text-gray-400 hover:text-gray-600 transition"
                                title="Resolve Alert">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Get severity color
function getSeverityColor(severity) {
    const colors = {
        critical: 'red',
        high: 'orange',
        warning: 'yellow'
    };
    return colors[severity] || 'gray';
}

// Resolve alert
async function resolveAlert(alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
            method: 'PATCH'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Alert resolved', 'success');
            loadAlerts();
            loadStats();
        }
    } catch (error) {
        console.error('Error resolving alert:', error);
        showNotification('Failed to resolve alert', 'error');
    }
}

// Open item modal
function openItemModal(item = null) {
    const modal = document.getElementById('item-modal');
    const form = document.getElementById('item-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    currentEditId = item?.id || null;
    
    if (item) {
        title.textContent = 'Edit Item';
        document.getElementById('input-name').value = item.name;
        document.getElementById('input-sku').value = item.sku;
        document.getElementById('input-description').value = item.description || '';
        document.getElementById('input-category').value = item.category || '';
        document.getElementById('input-quantity').value = item.quantity;
        document.getElementById('input-unit').value = item.unit;
        document.getElementById('input-price').value = item.unit_price;
        document.getElementById('input-min').value = item.min_threshold;
        document.getElementById('input-max').value = item.max_threshold;
        document.getElementById('input-supplier').value = item.supplier || '';
        document.getElementById('input-location').value = item.location || '';
    } else {
        title.textContent = 'Add New Item';
    }
    
    modal.classList.remove('hidden');
}

// Close item modal
function closeItemModal() {
    document.getElementById('item-modal').classList.add('hidden');
    currentEditId = null;
}

// Handle item form submit
async function handleItemSubmit(e) {
    e.preventDefault();
    
    const itemData = {
        name: document.getElementById('input-name').value,
        sku: document.getElementById('input-sku').value,
        description: document.getElementById('input-description').value,
        category: document.getElementById('input-category').value,
        quantity: parseInt(document.getElementById('input-quantity').value),
        unit: document.getElementById('input-unit').value || 'units',
        unit_price: parseFloat(document.getElementById('input-price').value) || 0,
        min_threshold: parseInt(document.getElementById('input-min').value) || 10,
        max_threshold: parseInt(document.getElementById('input-max').value) || 100,
        supplier: document.getElementById('input-supplier').value,
        location: document.getElementById('input-location').value
    };
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/inventory/${currentEditId}`
            : `${API_BASE_URL}/inventory`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(
                currentEditId ? 'Item updated successfully' : 'Item created successfully',
                'success'
            );
            closeItemModal();
            loadInventory();
            loadStats();
            loadAlerts();
        } else {
            showNotification(data.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showNotification('Failed to save item', 'error');
    }
}

// Edit item
async function editItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
        const data = await response.json();
        
        if (data.success) {
            openItemModal(data.data);
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showNotification('Failed to load item', 'error');
    }
}

// Delete item
async function deleteItem(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Item deleted successfully', 'success');
            loadInventory();
            loadStats();
            loadAlerts();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Failed to delete item', 'error');
    }
}

// Open stock modal
function openStockModal(id, name) {
    currentStockId = id;
    document.getElementById('stock-item-name').textContent = name;
    document.getElementById('stock-quantity').value = '';
    document.querySelector('input[name="operation"][value="add"]').checked = true;
    document.getElementById('stock-modal').classList.remove('hidden');
}

// Close stock modal
function closeStockModal() {
    document.getElementById('stock-modal').classList.add('hidden');
    currentStockId = null;
}

// Handle stock form submit
async function handleStockSubmit(e) {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('stock-quantity').value);
    const operation = document.querySelector('input[name="operation"]:checked').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${currentStockId}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity, operation })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Stock updated successfully', 'success');
            closeStockModal();
            loadInventory();
            loadStats();
            loadAlerts();
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification('Failed to update stock', 'error');
    }
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
    );
    renderInventoryTable(filtered);
}

// Category filter
function populateCategoryFilter(items) {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    const select = document.getElementById('filter-category');
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    if (currentValue && categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

function handleCategoryFilter(e) {
    const category = e.target.value;
    if (category) {
        loadInventory({ category });
    } else {
        loadInventory();
    }
}

// Low stock filter
function handleLowStockFilter() {
    loadInventory({ low_stock: 'true' });
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}
