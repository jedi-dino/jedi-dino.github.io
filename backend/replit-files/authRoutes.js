import express from 'express'
import bcrypt from 'bcryptjs'
import User from './User.js'
import { generateToken } from './auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores, and must be between 3 and 30 characters' })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already taken' })
    }

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: password
    })

    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({
      id: user._id,
      username: user.username,
      token
    })
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username or email is already taken' })
    }
    res.status(500).json({ error: 'Server error during registration', details: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail.toLowerCase() },
        { email: usernameOrEmail.toLowerCase() }
      ]
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    res.json({
      id: user._id,
      username: user.username,
      token
    })
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: 'Server error during login', details: error.message })
  }
})

export default router
