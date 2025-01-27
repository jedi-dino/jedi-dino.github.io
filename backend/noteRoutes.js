import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import Note from './Note.js'
import { auth } from './auth.js'
import User from './User.js'

const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body
    const note = new Note({
      title,
      owner: req.user._id,
      collaborators: [req.user._id]
    })
    await note.save()
    await note.populate('owner collaborators', 'username')
    res.status(201).json(note)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    })
    .populate('owner collaborators', 'username')
    .sort({ updatedAt: -1 })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    }).populate('owner collaborators', 'username')

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'content']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' })
  }

  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    updates.forEach(update => note[update] = req.body[update])
    await note.save()
    await note.populate('owner collaborators', 'username')
    res.json(note)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { email } = req.body
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    const collaborator = await User.findOne({ email })
    if (!collaborator) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (note.collaborators.includes(collaborator._id)) {
      return res.status(400).json({ error: 'User is already a collaborator' })
    }

    note.collaborators.push(collaborator._id)
    await note.save()
    await note.populate('owner collaborators', 'username')
    res.json(note)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id/collaborators/:userId', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    note.collaborators = note.collaborators.filter(
      id => id.toString() !== req.params.userId
    )
    await note.save()
    await note.populate('owner collaborators', 'username')
    res.json(note)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
