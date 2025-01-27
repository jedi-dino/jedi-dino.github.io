import express from 'express'
import bcrypt from 'bcryptjs'
import User from './User.js'
import { generateToken } from './auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    })
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already taken' })
    }

    const user = new User({ username, email, password })
    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
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
