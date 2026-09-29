// Centralized error handler. Keep messages generic in production.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
}

module.exports = { notFound, errorHandler };
