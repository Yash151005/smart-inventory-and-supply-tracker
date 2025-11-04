module.exports = async function (context, req) {
  context.log('InventoryAPI function processed a request.');

  // Simple router: return text for GET, JSON for POST
  if (req && req.method && req.method.toUpperCase() === 'GET') {
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Inventory API is running'
    };
    return;
  }

  if (req && req.method && req.method.toUpperCase() === 'POST') {
    context.log('Request body:', req.body);
    const item = req.body || null;
    // echo back the item for testing; DB save can be added later
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      // stringify the JSON body to ensure a proper byte payload is returned
      body: JSON.stringify({ message: 'Item saved', item })
    };
    return;
  }

  context.res = {
    status: 405,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: 'Method not allowed'
  };
};
