import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import Message from './Message.js'
import { auth } from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'))
    }
  }
})

const router = express.Router()

router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender recipient', 'username')

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { recipientId, content } = req.body

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content
    })

    if (req.file) {
      message.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video'
      message.mediaUrl = `/uploads/${req.file.filename}`
    }

    await message.save()
    await message.populate('sender recipient', 'username')

    res.status(201).json({
      status: 'success',
      message
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/read/:senderId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        recipient: req.user._id,
        read: false
      },
      { read: true }
    )
    res.json({ status: 'success' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/recent/chats', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender recipient', 'username')

    const users = new Map()

    messages.forEach(message => {
      const otherUser = message.sender._id.equals(req.user._id)
        ? message.recipient
        : message.sender

      if (!users.has(otherUser._id.toString())) {
        users.set(otherUser._id.toString(), {
          id: otherUser._id,
          username: otherUser.username,
          lastMessage: message
        })
      }
    })

    res.json([...users.values()])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
