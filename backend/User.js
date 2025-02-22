import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100
  },
  imageUrl: {
    type: String,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

userSchema.index({ username: 1 })
userSchema.index({ email: 1 })
userSchema.index({ username: 'text', email: 'text' })

userSchema.pre('save', async function(next) {
  try {
    const user = this
    if (user.isModified('password')) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(user.password, salt)
    }
    next()
  } catch (error) {
    console.error('Password hashing error:', {
      message: error.message,
      stack: error.stack
    })
    next(error)
  }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    console.error('Password comparison error:', {
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// Use transform for better control over JSON serialization
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password
    return ret
  }
})

const User = mongoose.model('User', userSchema)

export default User
