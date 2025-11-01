// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original send function
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log request details
    if (process.env.ENABLE_LOGGING === 'true') {
      console.log({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent')
      });
    }
    
    // Add performance header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Call original send
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  performanceLogger
};
