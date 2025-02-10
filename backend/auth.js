import jwt from 'jsonwebtoken'
import User from './User.js'

export const generateToken = (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
  } catch (error) {
    console.error('Token generation error:', {
      message: error.message,
      userId
    })
    throw error
  }
}

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      console.error('JWT verification error:', {
        message: jwtError.message,
        token: token.substring(0, 10) + '...' // Log only part of token for security
      })
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    try {
      user.lastActive = new Date()
      await user.save()
    } catch (saveError) {
      console.error('Error updating lastActive:', {
        message: saveError.message,
        userId: user._id
      })
      // Continue even if lastActive update fails
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    console.error('Authentication error:', {
      message: error.message,
      stack: error.stack
    })
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId)
        if (user) {
          try {
            user.lastActive = new Date()
            await user.save()
          } catch (saveError) {
            console.error('Error updating lastActive in optionalAuth:', {
              message: saveError.message,
              userId: user._id
            })
          }
          req.user = user
          req.token = token
        }
      } catch (tokenError) {
        console.error('Optional auth token verification error:', {
          message: tokenError.message,
          token: token.substring(0, 10) + '...'
        })
      }
    }
    next()
  } catch (error) {
    console.error('Optional auth error:', {
      message: error.message,
      stack: error.stack
    })
    next()
  }
}

export const rateLimit = (limit = parseInt(process.env.RATE_LIMIT) || 100, windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) => {
  const requests = new Map()

  if (limit === 0) {
    return (req, res, next) => next()
  }

  return (req, res, next) => {
    const now = Date.now()
    const windowStart = now - windowMs

    requests.forEach((timestamps, key) => {
      const filtered = timestamps.filter(timestamp => timestamp > windowStart)
      if (filtered.length === 0) {
        requests.delete(key)
      } else {
        requests.set(key, filtered)
      }
    })

    const ip = req.ip
    const userRequests = requests.get(ip) || []

    if (userRequests.length > limit) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      })
    }

    userRequests.push(now)
    requests.set(ip, userRequests)

    next()
  }
}
