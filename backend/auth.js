export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      throw new Error()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw new Error()
    }

    user.lastActive = new Date()
    await user.save()

    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)
      if (user) {
        user.lastActive = new Date()
        await user.save()
        req.user = user
        req.token = token
      }
    }
    next()
  } catch (error) {
    console.log('Optional auth token error:', error.message)
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
