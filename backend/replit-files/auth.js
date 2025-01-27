import jwt from 'jsonwebtoken'
import User from './User.js'

export const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id })

    if (!user) {
      throw new Error()
    }

    user.lastActive = new Date()
    await user.save()

    req.token = token
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' })
  }
}
