import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserMenu from '../components/UserMenu'
import ThemeToggle from '../components/ThemeToggle'

interface Note {
  id: string
  title: string
  content: string
  collaborators: string[]
  lastModified: Date
}

interface NotesProps {
  user: {
    id: string
    username: string
    token: string
  }
  onLogout: () => void
}

const Notes: React.FC<NotesProps> = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle || 'Untitled Note',
      content: '',
      collaborators: [user.username],
      lastModified: new Date()
    }
    setNotes([...notes, newNote])
    setShowNewNoteModal(false)
    setNewNoteTitle('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Notes</h2>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Note</span>
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notes</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{note.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Last modified {new Date(note.lastModified).toLocaleDateString()}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {note.collaborators.map((collaborator, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-800"
                      >
                        {collaborator[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note Title"
              className="input w-full mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
