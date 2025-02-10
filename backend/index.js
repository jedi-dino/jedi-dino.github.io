import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()
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
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5174',
      'http://localhost:5173',
      'https://test.github.io',
      'https://jedi-dino.github.io',
      'https://testserverprobsfail.replit.app'
    ]
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/users/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.error('MongoDB connection error:', err)
})

const db = mongoose.connection
db.on('error', (err) => {
  console.error('MongoDB error:', err)
})
db.once('open', () => {
  console.log('Connected to MongoDB')
})

// Handle MongoDB operation errors
db.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...')
})
db.on('reconnected', () => {
  console.log('MongoDB reconnected')
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notes', noteRoutes)

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name
  })

  // Handle MongoDB specific errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate key error',
        message: 'Username or email already exists'
      })
    }
    return res.status(500).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred with the database'
    })
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    })
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
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
