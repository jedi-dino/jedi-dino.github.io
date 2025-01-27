import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import Message from './Message.js'
import { auth } from './auth.js'

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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

router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body
    const { media } = req.files || {}

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content
    })

    if (media) {
      try {
        const result = await cloudinary.uploader.upload(media, {
          resource_type: 'auto',
          folder: 'chat-app'
        })

        message.mediaUrl = result.secure_url
        message.mediaType = result.resource_type
      } catch (error) {
        return res.status(400).json({ error: 'Failed to upload media' })
      }
    }

    await message.save()
    await message.populate('sender', 'username')
    await message.populate('recipient', 'username')

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
