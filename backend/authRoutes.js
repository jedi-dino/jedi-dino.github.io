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

    // Normalize email and username
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    // Check for existing user with more detailed error messages
    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail }
      ]
    })

    if (existingUser) {
      const field = existingUser.username === normalizedUsername ? 'username' : 'email'
      return res.status(400).json({ 
        error: `This ${field} is already registered`,
        field: field
      })
    }

    // Create new user with normalized values
    const user = new User({ 
      username: normalizedUsername, 
      email: normalizedEmail, 
      password 
    })

    try {
      await user.save()
    } catch (saveError) {
      console.error('User save error:', saveError)
      
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message)
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors 
        })
      }

      if (saveError.code === 11000) {
        // Handle race condition where duplicate was created between check and save
        const field = Object.keys(saveError.keyPattern)[0]
        return res.status(400).json({ 
          error: `This ${field} is already registered`,
          field: field
        })
      }

      throw saveError // Let the outer catch handle other errors
    }

    const token = generateToken(user._id)
    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      error: 'Failed to register user',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body

    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail.toLowerCase() },
        { email: usernameOrEmail.toLowerCase() }
      ]
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken(user._id)
    res.json({ user, token })
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

export default router
