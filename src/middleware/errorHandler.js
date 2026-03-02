const errorHandler = (err, req, res, next) => {
  console.error('💥 Error Handler caught error:');
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
