module.exports = async function (context, req) {
  const name = req.query.name || (req.body && req.body.name);
  context.res = {
    body: {
      message: `Hello ${name || "World"}! Your Inventory API is working successfully.`,
      status: "OK"
    }
  };
};
