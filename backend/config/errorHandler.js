function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  if (res.headersSent) {
    return next(err)
  }

  return res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
