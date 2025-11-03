module.exports = async function (context, req) {
  context.log("InventoryAPI function processed a request.");

  context.res = {
    status: 200,
    headers: { "Content-Type": "text/html" },
    body: `
      <html>
        <head><title>Inventory API</title></head>
        <body style="font-family: Arial; text-align:center; padding-top:50px;">
          <h1 style="color: green;">✅ Inventory API is running correctly!</h1>
          <p>Your backend function is active and ready.</p>
        </body>
      </html>
    `
  };
};
