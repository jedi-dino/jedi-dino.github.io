import express from 'express'
import bcrypt from 'bcryptjs'
import User from './User.js'
import { auth } from './auth.js'

const router = express.Router()

router.get('/search', auth, async (req, res) => {
  try {
    const { username } = req.query
    const users = await User.find({
      _id: { $ne: req.user._id },
      username: { $regex: username, $options: 'i' }
    })
    .select('username imageUrl lastActive')
    .limit(10)

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    .select('username imageUrl lastActive')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch('/me', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, username } = req.body

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, req.user.password)
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }

      const salt = await bcrypt.genSalt(10)
      req.user.password = await bcrypt.hash(newPassword, salt)
    }

    if (username) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({
          error: 'Username must be 3-30 characters and can only contain letters, numbers, and underscores'
        })
      }

      const existingUser = await User.findOne({
        _id: { $ne: req.user._id },
        username: username.toLowerCase()
      })

      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' })
      }

      req.user.username = username
    }

    if (req.body.profilePicture) {
      req.user.imageUrl = req.body.profilePicture
    }

    await req.user.save()
    res.json(req.user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
