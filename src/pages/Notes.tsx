import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, ENDPOINTS } from '../config'
import UserMenu from '../components/UserMenu'
import ThemeToggle from '../components/ThemeToggle'
import NoteEditor from '../components/NoteEditor'

interface User {
  id: string
  username: string
  token: string
}

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

interface NotesProps {
  user: User
  onLogout: () => void
}

const Notes: React.FC<NotesProps> = ({ user, onLogout }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.GET}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim()) return

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      const newNote = await response.json()
      setNotes(prev => [newNote, ...prev])
      setNewNoteTitle('')
      setIsCreating(false)
      setSelectedNote(newNote)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create note')
    }
  }

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.UPDATE}/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      const updatedNote = await response.json()
      setNotes(prev => prev.map(note => note._id === noteId ? updatedNote : note))
      setSelectedNote(updatedNote)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.DELETE}/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(prev => prev.filter(note => note._id !== noteId))
      if (selectedNote?._id === noteId) {
        setSelectedNote(null)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete note')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Notes</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
              >
                New Note
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateNote} className="space-y-2">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="input"
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewNoteTitle('')
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newNoteTitle.trim()}
                    className="btn btn-primary"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : notes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No notes yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div
                    key={note._id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedNote?._id === note._id
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {note.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note._id)
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {selectedNote ? (
              <NoteEditor
                note={selectedNote}
                onUpdate={(content) => handleUpdateNote(selectedNote._id, content)}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a note to start editing
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Notes
