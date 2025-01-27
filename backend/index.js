import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import messageRoutes from './messageRoutes.js'
import noteRoutes from './noteRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const uploadsDir = path.join(__dirname, 'uploads')
const userUploadsDir = path.join(uploadsDir, 'users')
const messageUploadsDir = path.join(uploadsDir, 'messages')

const corsOptions = {
  origin: [
    'http://localhost:5174',
    'http://localhost:5173',
    'https://test.github.io',
    'https://jedi-dino.github.io'
  ],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/api/users/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose.connect(process.env.MONGODB_URI)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notes', noteRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
