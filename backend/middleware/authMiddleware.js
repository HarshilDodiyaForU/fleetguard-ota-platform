const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/env')

function protect(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

module.exports = {
  protect,
}
