const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabaseClient')
const { jwtSecret } = require('../config/env')

async function register(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const { error } = await supabase.from('users').insert([{ email, password_hash: hashed }])

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(201).json({ success: true, message: 'User created' })
  } catch (error) {
    return next(error)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const storedHash = data.password_hash || data.password
    const match = await bcrypt.compare(password, storedHash)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Wrong password' })
    }

    const token = jwt.sign({ id: data.id, email: data.email }, jwtSecret, { expiresIn: '7d' })
    return res.status(200).json({ success: true, token })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
}
