import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  images: [{
    url: String,
    caption: String
  }]
}, {
  timestamps: true
})

noteSchema.index({ owner: 1, collaborators: 1 })

const Note = mongoose.model('Note', noteSchema)

export default Note
