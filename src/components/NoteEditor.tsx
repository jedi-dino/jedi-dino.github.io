import React, { useState, useEffect } from 'react'

interface Note {
  _id: string
  title: string
  content: string
  owner: {
    _id: string
    username: string
  }
  collaborators: Array<{
    _id: string
    username: string
  }>
  createdAt: string
  updatedAt: string
}

interface NoteEditorProps {
  note: Note
  onUpdate: (content: string) => void
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate }) => {
  const [content, setContent] = useState(note.content)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setContent(note.content)
  }, [note])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdate(newContent)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      // Here you would typically upload to your image hosting service
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file)
      
      // Insert image markdown at cursor position or at end
      const imageMarkdown = `![${file.name}](${imageUrl})\n`
      const textarea = e.target.parentElement?.querySelector('textarea')
      
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
        setContent(newContent)
        onUpdate(newContent)
        
        // Reset cursor position
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length)
        }, 0)
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {note.title}
        </h2>
        <div className="flex items-center space-x-2">
          <label className="btn btn-secondary cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading ? 'Uploading...' : 'Add Image'}
          </label>
          <button className="btn btn-secondary">
            Share
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start writing your note..."
        className="flex-1 w-full p-4 bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none"
      />

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default NoteEditor
