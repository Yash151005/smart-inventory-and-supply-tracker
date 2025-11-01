const db = require('../database/db');

async function logActivity(itemId, action, details) {
  try {
    await db.run(
      'INSERT INTO activity_log (item_id, action, details) VALUES (?, ?, ?)',
      [itemId, action, details]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

module.exports = {
  logActivity
};
