export const rootIndex = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the WaitlistHQ Email Automation API',
    version: '1.0.0',
    documentation: 'https://github.com/vanrajsinh650/WaitlistHQ#readme',
  });
};

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'OK',
      database: 'Not Connected', // Placeholder for future database health
    },
  });
};
