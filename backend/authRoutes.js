import express from 'express'
import User from './User.js'
import { generateToken } from './auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' })
    }

    const user = new User({ username, password })
    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findByCredentials(username, password)
    const token = generateToken(user._id)
    res.json({ user, token })
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

export default router
