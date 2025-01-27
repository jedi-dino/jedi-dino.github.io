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

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword
    })

    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({
      id: user._id,
      username: user.username,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Server error during registration' })
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

    const isMatch = await bcrypt.compare(password, user.password)
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
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
})

export default router
