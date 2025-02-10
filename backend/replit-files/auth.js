import jwt from 'jsonwebtoken'
import User from './User.js'

export const generateToken = (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined')
    }
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    )
    return token
  } catch (error) {
    console.error('Token generation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    throw error
  }
}

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('No token provided')
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw new Error('User not found')
    }

    user.lastActive = new Date()
    await user.save()

    req.token = token
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error.message)
    res.status(401).json({ error: 'Please authenticate' })
  }
}
